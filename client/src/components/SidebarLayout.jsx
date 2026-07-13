import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const base = "flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl border-none bg-transparent font-medium text-[0.93rem] cursor-pointer text-text-muted transition-all duration-150 hover:bg-sidebar-hover hover:text-white mb-0.5";
    if (location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))) {
        return `${base} bg-sidebar-active text-white`;
    }
    return base;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-[240px] h-screen bg-sidebar flex flex-col pt-7 px-3.5 pb-5 z-40">
        <Link to="/" className="text-[1.3rem] font-bold text-text-primary tracking-wide mb-7 pl-1.5 block">
          <span className="text-brand">P</span>rogram
        </Link>

        <nav className="flex flex-col flex-1">
          {user && (
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              Dashboard
            </Link>
          )}

          <Link to="/courses" className={getLinkClass('/courses')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Browse Courses
          </Link>
          
          {user?.role === 'instructor' && (
             <Link to="/instructor/courses" className={getLinkClass('/instructor/courses')}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                 <path d="M12 20h9"></path>
                 <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
               </svg>
               My Courses
             </Link>
          )}

          {user?.role === 'admin' && (
             <Link to="/admin/courses" className={getLinkClass('/admin/courses')}>
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
               </svg>
               Admin
             </Link>
          )}

          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl border-none bg-transparent font-medium text-[0.93rem] cursor-pointer text-text-muted transition-all duration-150 hover:bg-sidebar-hover hover:text-white mt-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Log out
            </button>
          ) : (
            <Link to="/login" className="flex items-center gap-3.5 w-full px-3.5 py-3 rounded-xl border-none bg-transparent font-medium text-[0.93rem] cursor-pointer text-text-muted transition-all duration-150 hover:bg-sidebar-hover hover:text-white mt-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Log in
            </Link>
          )}
        </nav>
      </div>

      {/* Header */}
      <div className="fixed top-0 left-[240px] right-0 h-[60px] bg-sidebar border-b border-[#1f2133] flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2.5 bg-[#1a1c28] border border-[#252840] rounded-[10px] px-3.5 py-2 w-full max-w-[420px] text-text-muted focus-within:border-brand focus-within:text-text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search courses..." className="bg-transparent border-none outline-none text-text-primary text-sm w-full placeholder:text-text-muted" />
        </div>
        
        <div className="flex items-center gap-4 text-sm font-medium text-text-muted">
          <span className="text-lg cursor-pointer hover:text-white transition-colors">🔔</span>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold shadow-sm">
                 {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-text-primary font-semibold">{user?.name}</span>
            </div>
          ) : (
            <Link to="/register" className="text-brand hover:text-brand-dark transition-colors">Create account</Link>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="ml-[240px] mt-[60px] p-8 w-full max-w-[1200px]">
        <Outlet />
      </div>
    </div>
  );
};

export default SidebarLayout;
