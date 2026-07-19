import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const CourseCard = ({ enrollment, completed, onOpen }) => (
  <div className="continue-card glass-card hover-glow animate-entrance">
    <div
      className="continue-thumb"
      style={enrollment.course.thumbnailUrl
        ? { backgroundImage: `url(${enrollment.course.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
    ></div>
    <div className="continue-info">
      <div className="continue-details">
        <h3>{enrollment.course.title}</h3>
      </div>
      {completed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 600 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12.5l2.5 2.5L16 9.5" />
          </svg>
          Completed
        </div>
      ) : (
        <div className="continue-progress-area">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${enrollment.progressPercent}%` }}></div>
          </div>
          <span className="progress-text">{enrollment.progressPercent}% Complete</span>
        </div>
      )}
      <button className="play-btn glass-btn" onClick={() => onOpen(enrollment.course._id)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>
  </div>
);

export default function DashboardTab() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const fetchEnrollments = async () => {
      try {
        const { data } = await api.get('/enrollments/mine', { signal: controller.signal });
        setEnrollments(data.enrollments || []);
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return;
        setError(err.response?.data?.message || 'Failed to load your courses');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchEnrollments();
    return () => controller.abort();
  }, []);

  if (loading) return <p style={{ color: 'var(--c-sub)' }}>Loading your courses...</p>;
  if (error) return <p style={{ color: '#ef4444' }}>{error}</p>;

  const completedLessonCount = enrollments.reduce((sum, e) => sum + e.completedLessons.length, 0);
  const inProgress = enrollments.filter(e => e.progressPercent < 100);
  const completed = enrollments.filter(e => e.progressPercent === 100);

  return (
    <>
      <div className="stats-grid animate-entrance" style={{ animationDelay: '0.1s' }}>
        <div className="stat-card glass-card">
          <div className="stat-value">{enrollments.length}</div>
          <div className="stat-label">Enrolled Courses</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-value">{completedLessonCount}</div>
          <div className="stat-label">Completed Lessons</div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-value">{completed.length}</div>
          <div className="stat-label">Courses Completed</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="main-column" style={{ width: '100%' }}>
          <section className="dashboard-section animate-entrance" style={{ animationDelay: '0.2s' }}>
            <div className="section-header">
              <h2>In Progress</h2>
            </div>

            {enrollments.length === 0 ? (
              <p style={{ color: 'var(--c-sub)' }}>
                You haven't enrolled in any courses yet. Head over to Explore to find one.
              </p>
            ) : inProgress.length === 0 ? (
              <p style={{ color: 'var(--c-sub)' }}>
                Nothing in progress right now — nice work keeping up!
              </p>
            ) : (
              <div className="continue-row">
                {inProgress.map((enrollment) => (
                  <CourseCard
                    key={enrollment._id}
                    enrollment={enrollment}
                    completed={false}
                    onOpen={(courseId) => navigate(`/learn/${courseId}`)}
                  />
                ))}
              </div>
            )}
          </section>

          {completed.length > 0 && (
            <section className="dashboard-section animate-entrance" style={{ animationDelay: '0.3s' }}>
              <div className="section-header">
                <h2>Completed</h2>
              </div>
              <div className="continue-row">
                {completed.map((enrollment) => (
                  <CourseCard
                    key={enrollment._id}
                    enrollment={enrollment}
                    completed={true}
                    onOpen={(courseId) => navigate(`/learn/${courseId}`)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
