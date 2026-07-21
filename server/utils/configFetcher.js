import SystemConfig from '../models/SystemConfig.js';

// Singleton config cache to reduce DB calls on high-frequency checks like rate-limiting
let cachedConfig = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

/**
 * Fetches the global configuration for internal backend logic.
 * Uses a brief in-memory cache to prevent spamming the database.
 */
export const getInternalConfig = async () => {
  const now = Date.now();
  
  if (cachedConfig && (now - lastFetchTime) < CACHE_TTL) {
    return cachedConfig;
  }

  let config = await SystemConfig.findOne({ isGlobal: true }).lean();
  
  if (!config) {
    // Cannot lean() a creation directly, convert to plain object
    const newConfig = await SystemConfig.create({ isGlobal: true });
    config = newConfig.toObject();
  }
  
  cachedConfig = config;
  lastFetchTime = now;
  
  return cachedConfig;
};

/**
 * Forces the cache to clear. Should be called after a config update.
 */
export const clearConfigCache = () => {
  cachedConfig = null;
  lastFetchTime = 0;
};
