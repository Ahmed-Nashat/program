import { getInternalConfig } from '../utils/configFetcher.js';

export const maintenanceMiddleware = async (req, res, next) => {
  // Allow bypassing for superadmin or whitelisted emails
  // We can only check email if the token is already decoded, but this middleware usually runs before auth for public routes.
  // We'll let auth routes proceed if they are trying to log in, maybe?
  // Let's just do a basic check.
  
  // Allow login endpoint so admins can log in
  if (req.path === '/api/auth/login') {
    return next();
  }

  try {
    const config = await getInternalConfig();
    
    if (config?.maintenance?.isMaintenanceMode) {
      // If user is already authenticated and is superadmin, let them through
      // But we don't have req.user yet if this is global.
      // We will place this middleware AFTER the cookie parser, but BEFORE the main routes?
      // Actually, to make it simple: just block unless it's a whitelisted route.
      
      // We can also allow super admins by decoding token here if needed, but it's cleaner to 
      // just block API responses with a 503 if not logged in as a valid whitelisted user.
      // For now, MVP: block all non-auth requests if maintenance is on.
      
      // Optionally decode JWT manually to check role
      const token = req.cookies?.token;
      if (token) {
        // Just let protect middleware handle it, or decode here
        import('jsonwebtoken').then(({ default: jwt }) => {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // We would need to query the user to check role, or just assume if they have a token they might be admin
          } catch (e) {
            // ignore
          }
        });
      }

      // Simple implementation: 503 response
      // For MVP, we won't fully implement whitelist decoding here to save DB hits.
      return res.status(503).json({
        message: config.maintenance.message || 'System is currently under maintenance.',
        estimatedCompletion: config.maintenance.estimatedCompletion
      });
    }
    
    next();
  } catch (err) {
    console.error("Maintenance check error:", err);
    next(); // Fail open
  }
};
