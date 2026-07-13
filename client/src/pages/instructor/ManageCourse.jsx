import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { courseApi } from '../../api/courses';
import StatusBadge from '../../components/StatusBadge';

const ManageCourse = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lessonForm, setLessonForm] = useState({ title: '', videoUrl: '' });
  const [addingLesson, setAddingLesson] = useState(false);
  const [error, setError] = useState('');

  const loadCourse = async () => {
    try {
      const { data } = await courseApi.getById(id);
      setCourse(data.course);
      setLessons(data.lessons);
    } catch (err) {
      setError('Could not load this course.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setError('');
    setAddingLesson(true);
    try {
      await courseApi.addLesson(id, lessonForm);
      setLessonForm({ title: '', videoUrl: '' });
      await loadCourse(); // refresh the lesson list so the new one shows up immediately
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add lesson.');
    } finally {
      setAddingLesson(false);
    }
  };

  if (loading) return <p className="px-6 py-12 text-sm text-slate-400">Loading…</p>;
  if (!course) return <p className="px-6 py-12 text-sm text-red-600">Course not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
        <StatusBadge status={course.status} />
      </div>
      <p className="mt-2 text-sm text-slate-500">{course.description}</p>

      {course.status === 'pending' && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          This course is awaiting admin approval and isn't visible to students yet. You can
          still add lessons now.
        </div>
      )}
      {course.status === 'rejected' && (
        <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          This course was rejected by an admin.
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Lessons</h2>

        {lessons.length === 0 && (
          <p className="mt-2 text-sm text-slate-400">No lessons added yet.</p>
        )}

        <ol className="mt-3 space-y-2">
          {lessons.map((lesson) => (
            <li
              key={lesson._id}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <span className="text-slate-400">{lesson.order}.</span>
              <span className="font-medium text-slate-800">{lesson.title}</span>
            </li>
          ))}
        </ol>

        <form onSubmit={handleAddLesson} className="mt-6 space-y-4 rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700">Add a lesson</h3>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <label htmlFor="lessonTitle" className="block text-xs font-medium text-slate-600">
              Lesson title
            </label>
            <input
              id="lessonTitle"
              required
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-xs font-medium text-slate-600">
              Video URL
            </label>
            <input
              id="videoUrl"
              required
              placeholder="https://res.cloudinary.com/..."
              value={lessonForm.videoUrl}
              onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-400">
              For now, paste a hosted video URL directly. Cloudinary upload comes next.
            </p>
          </div>

          <button
            type="submit"
            disabled={addingLesson}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {addingLesson ? 'Adding…' : 'Add lesson'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManageCourse;
