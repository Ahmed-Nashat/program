import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { courseApi } from '../api/courses';

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await courseApi.getById(id);
        setCourse(data.course);
        setLessons(data.lessons);
      } catch (err) {
        setError(err.response?.data?.message || 'Course not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <p className="px-6 py-12 text-sm text-slate-400">Loading…</p>;
  if (error) return <p className="px-6 py-12 text-sm text-red-600">{error}</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <span className="text-xs font-medium uppercase tracking-wide text-indigo-600">
        {course.category}
      </span>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{course.title}</h1>
      <p className="mt-2 text-sm text-slate-500">by {course.instructor?.name}</p>
      <p className="mt-6 text-slate-600">{course.description}</p>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
        <span className="text-2xl font-bold text-slate-900">E£{course.price}</span>
        <button
          disabled
          title="Enrollment ships in Week 3"
          className="cursor-not-allowed rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white opacity-60"
        >
          Enroll (coming soon)
        </button>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Curriculum</h2>
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
      </div>
    </div>
  );
};

export default CourseDetails;
