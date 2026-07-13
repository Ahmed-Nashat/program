import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../../api/courses';

const CATEGORIES = ['Computer Science', 'Business', 'Engineering', 'Design', 'Medicine', 'Law'];

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: CATEGORIES[0],
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data } = await courseApi.create({
        ...formData,
        price: Number(formData.price),
      });
      // Take them straight to the manage-lessons page for the course they
      // just created — that's the natural next step.
      navigate(`/instructor/courses/${data.course._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Create a course</h1>
      <p className="mt-1 text-sm text-slate-500">
        Submitted courses go to an admin for approval before appearing publicly.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700">
              Price (E£)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-400">Display only — no payment processing yet.</p>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
