import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseApi } from '../api/courses';

const CATEGORIES = ['All', 'Computer Science', 'Business', 'Engineering', 'Design', 'Medicine', 'Law'];

const getThumbIcon = (category) => {
  const map = {
    'Computer Science': '💻',
    'Business': '📈',
    'Engineering': '⚙️',
    'Design': '🎨',
    'Medicine': '⚕️',
    'Law': '⚖️',
  };
  return map[category] || '📘';
};

const BrowseCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const { data } = await courseApi.getApproved(params);
      setCourses(data.courses);
      setLoading(false);
    };

    const timeout = setTimeout(fetchCourses, 300);
    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="mx-auto max-w-[1180px] px-7 py-12 pb-24">
      <div className="mb-14">
        <p className="text-[13px] font-semibold text-brand uppercase tracking-wider mb-2.5">Course Catalog</p>
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-2">Explore University Courses</h1>
        <p className="text-base text-text-secondary max-w-[560px]">Find the best classes taught by top instructors.</p>
      </div>

      <div className="mb-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search courses…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="auth-input sm:max-w-xs !mt-0"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="auth-input sm:max-w-xs !mt-0"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="mt-8 text-sm text-text-secondary">Loading courses…</p>}

      {!loading && courses.length === 0 && (
        <p className="mt-8 text-sm text-text-secondary">No courses match your search.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-[16px] shadow-sm overflow-hidden transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 group"
          >
            <div className="h-[110px] bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-[34px]">
              {getThumbIcon(course.category)}
            </div>
            <div className="p-4.5 pb-5">
              <h3 className="text-base font-semibold text-slate-900 mb-1">{course.title}</h3>
              <p className="text-[13px] text-text-secondary mb-2.5">{course.instructor?.name || 'Instructor'}</p>
              
              <div className="text-[#F5A623] text-sm tracking-widest mb-3.5">
                ★★★★<span className="text-[#E4E1F5]">★</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-semibold ${course.price === 0 ? 'text-[#22C55E]' : 'text-brand'}`}>
                  {course.price === 0 ? 'Free' : `E£${course.price}`}
                </span>
                <Link to={`/courses/${course._id}`} className="font-semibold text-[13px] text-brand bg-[#F3EEFF] hover:bg-[#E8DEFF] px-3.5 py-2 rounded-[10px] transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseCourses;
