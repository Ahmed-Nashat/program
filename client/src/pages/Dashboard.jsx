import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect instructors and admins to their respective dashboards
  if (user.role === 'instructor') return <Navigate to="/instructor/courses" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/courses" replace />;

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-[28px] font-bold text-[#111] mb-2">Welcome Back, {user.name.split(' ')[0]} 👋</h1>
        <p className="text-[#8a8fa8] font-medium">Ready to continue learning?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="dash-card">
          <h3 className="text-[#8a8fa8] text-sm font-semibold uppercase tracking-wider mb-2">Courses</h3>
          <h1 className="text-[32px] font-bold text-[#111]">12</h1>
        </div>
        <div className="dash-card">
          <h3 className="text-[#8a8fa8] text-sm font-semibold uppercase tracking-wider mb-2">Assignments</h3>
          <h1 className="text-[32px] font-bold text-[#111]">2</h1>
        </div>
        <div className="dash-card">
          <h3 className="text-[#8a8fa8] text-sm font-semibold uppercase tracking-wider mb-2">Quizzes</h3>
          <h1 className="text-[32px] font-bold text-[#111]">4</h1>
        </div>
        <div className="dash-card">
          <h3 className="text-[#8a8fa8] text-sm font-semibold uppercase tracking-wider mb-2">Completion</h3>
          <h1 className="text-[32px] font-bold text-[#111]">82%</h1>
        </div>
      </div>

      <h2 className="text-[22px] font-bold text-[#111] mb-5">Latest Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Placeholder courses until backend is wired up */}
        <div className="dash-card flex flex-col justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[#111] mb-4">Node.js Backend</h3>
            <div className="h-2 bg-[#eee] rounded-full overflow-hidden w-full mb-2">
              <div className="h-full bg-brand" style={{ width: '45%' }}></div>
            </div>
            <small className="text-[#8a8fa8] font-semibold">45%</small>
          </div>
          <div className="mt-5 text-right">
            <button className="bg-brand text-white border-none rounded-[10px] px-[18px] py-[10px] font-medium text-sm hover:bg-brand-dark transition-colors cursor-pointer">
              Continue
            </button>
          </div>
        </div>

        <div className="dash-card flex flex-col justify-between">
          <div>
            <h3 className="text-[17px] font-bold text-[#111] mb-4">Operating Systems</h3>
            <div className="h-2 bg-[#eee] rounded-full overflow-hidden w-full mb-2">
              <div className="h-full bg-brand" style={{ width: '82%' }}></div>
            </div>
            <small className="text-[#8a8fa8] font-semibold">82%</small>
          </div>
          <div className="mt-5 text-right">
            <button className="bg-brand text-white border-none rounded-[10px] px-[18px] py-[10px] font-medium text-sm hover:bg-brand-dark transition-colors cursor-pointer">
              Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
