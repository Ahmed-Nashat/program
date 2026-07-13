import { useEffect, useState } from 'react';
import { courseApi } from '../../api/courses';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const loadPending = async () => {
    try {
      const { data } = await courseApi.getPending();
      setCourses(data.courses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleDecision = async (id, decision) => {
    setActioningId(id);
    try {
      if (decision === 'approve') {
        await courseApi.approve(id);
      } else {
        await courseApi.reject(id);
      }
      // Remove it from the local list immediately rather than re-fetching —
      // it's no longer pending, so it shouldn't be in this list either way.
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Pending course approvals</h1>
      <p className="mt-1 text-sm text-slate-500">
        Review new courses before they go live in the student catalog.
      </p>

      {loading && <p className="mt-8 text-sm text-slate-400">Loading…</p>}

      {!loading && courses.length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm text-slate-500">No pending courses right now. 🎉</p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {courses.map((course) => (
          <div key={course._id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{course.title}</p>
                <p className="mt-1 text-sm text-slate-500">{course.description}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {course.category} · E£{course.price} · by {course.instructor?.name} (
                  {course.instructor?.email})
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => handleDecision(course._id, 'reject')}
                  disabled={actioningId === course._id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleDecision(course._id, 'approve')}
                  disabled={actioningId === course._id}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
