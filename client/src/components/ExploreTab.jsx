import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import CourseCard from './CourseCard';

export default function ExploreTab({ user }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const categories = ['All', 'Development', 'Design', 'Data', 'Business'];
  const [currentCategory, setCurrentCategory] = useState('All');
  const categoryContainerRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data.data || res.data.courses || []);
      } catch (err) {
        console.error('Failed to fetch courses', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);


  const filteredCourses =
    currentCategory === 'All'
      ? courses
      : courses.filter((c) => c.category === currentCategory);

  return (
    <>
      {/* Hero Banner */}
      <div className="hero-section glass-card animate-entrance" style={{ animationDelay: '0.1s' }}>
        <div className="hero-content">
          <h1>Ready to level up, {firstName}?</h1>
          <p>Discover new skills, dive into hot topics, and learn from the industry's best instructors.</p>
        </div>
        <button type="button" className="hero-btn glass-btn">Explore Catalog</button>
      </div>

      <div className="dashboard-grid">
        <div className="main-column" style={{ width: '100%' }}>
          <section className="dashboard-section animate-entrance" style={{ animationDelay: '0.4s' }}>
            <div className="section-header">
              <h2>Recommended for You</h2>
              <a href="#" className="view-all">View all</a>
            </div>

            {/* Category filters */}
            <div
              className="category-filters"
              style={{ position: 'relative' }}
              ref={categoryContainerRef}
            >

              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-btn glass-card hover-glow ${cat === currentCategory ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentCategory(cat);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Course grid */}
            {isLoading ? (
              <div className="cc-skeleton-grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="cc-skeleton glass-card" />
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <div className="cc-grid">
                {filteredCourses.map((course, idx) => (
                  <CourseCard key={course._id || idx} course={course} idx={idx} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--c-sub)', padding: '32px 0' }}>
                No courses found in this category.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
