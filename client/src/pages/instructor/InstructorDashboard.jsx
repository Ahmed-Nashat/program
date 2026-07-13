import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../../api/courses';
import StatusBadge from '../../components/StatusBadge';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await courseApi.getMine();
        setCourses(data.courses);
      } catch (err) {
        setError('Could not load your courses.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            New courses need admin approval before students can see them.
          </p>
        </div>
        <Link
          to="/instructor/courses/new"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + New course
        </Link>
      </div>

      {loading && <p className="mt-8 text-sm text-slate-400">Loading…</p>}
      {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-500">You haven't created any courses yet.</p>
          <Link
            to="/instructor/courses/new"
            className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create your first course →
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-3">
        {courses.map((course) => (
          <Link
            key={course._id}
            to={`/instructor/courses/${course._id}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 hover:border-slate-300"
          >
            <div>
              <p className="font-medium text-slate-900">{course.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{course.category} · E£{course.price}</p>
            </div>
            <StatusBadge status={course.status} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InstructorDashboard;
