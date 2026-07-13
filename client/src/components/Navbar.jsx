import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getLinkClass = (path) => {
    const base = "bg-transparent border-none font-medium px-4 py-2 rounded-[10px] text-sm transition-all duration-150";
    if (location.pathname === path) {
      return `${base} text-white bg-brand`;
    }
    return `${base} text-[#A9A6B8] hover:text-white hover:bg-white/5`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#111111] flex flex-wrap items-center justify-between px-7 py-3.5 gap-4">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-white font-bold text-[15px] mr-6 flex items-center gap-2">
          <span className="w-[9px] h-[9px] rounded-full bg-brand inline-block"></span>
          UniLMS
        </Link>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Link to="/courses" className={getLinkClass('/courses')}>
            Browse courses
          </Link>
          {user?.role === 'instructor' && (
            <Link to="/instructor/courses" className={getLinkClass('/instructor/courses')}>
              My courses
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/courses" className={getLinkClass('/admin/courses')}>
              Approvals
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm font-medium text-[#A9A6B8] mr-2">
              {user.name} <span className="opacity-50 px-1">·</span> <span className="capitalize">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-transparent border-none text-[#A9A6B8] hover:text-white hover:bg-white/5 font-medium px-4 py-2 rounded-[10px] text-sm transition-all duration-150"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-transparent border-none text-[#A9A6B8] hover:text-white hover:bg-white/5 font-medium px-4 py-2 rounded-[10px] text-sm transition-all duration-150">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-brand text-white border-none rounded-[10px] px-4 py-2 text-sm font-semibold hover:bg-brand-dark transition-all duration-150"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
