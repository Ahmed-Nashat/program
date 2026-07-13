import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SidebarLayout from './components/SidebarLayout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BrowseCourses from './pages/BrowseCourses';
import CourseDetails from './pages/CourseDetails';

import InstructorDashboard from './pages/instructor/InstructorDashboard';
import CreateCourse from './pages/instructor/CreateCourse';
import ManageCourse from './pages/instructor/ManageCourse';

import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<><Navbar /><Landing /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />

        {/* Sidebar Layout Routes */}
        <Route element={<SidebarLayout />}>
          <Route path="/courses" element={<BrowseCourses />} />
          <Route path="/courses/:id" element={<CourseDetails />} />
  
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
  
          {/* Instructor-only routes */}
          <Route
            path="/instructor/courses"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/new"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <CreateCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/courses/:id"
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <ManageCourse />
              </ProtectedRoute>
            }
          />
  
          {/* Admin-only routes */}
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
