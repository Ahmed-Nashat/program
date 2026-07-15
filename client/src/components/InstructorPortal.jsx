import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function InstructorPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ title: '', description: '', price: '', category: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  const [lessonData, setLessonData] = useState({ title: '', order: '' });
  const [videoFile, setVideoFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchMyCourses = async () => {
    try {
      const res = await api.get('/courses/mine');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'instructor') {
      navigate('/');
      return;
    }
    fetchMyCourses();
  }, [user, navigate]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let thumbnailUrl = '';
      if (thumbnailFile) {
        const fileData = new FormData();
        fileData.append('image', thumbnailFile);
        const uploadRes = await api.post('/uploads/image', fileData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        thumbnailUrl = uploadRes.data.url;
      }

      await api.post('/courses', {
        ...formData,
        price: Number(formData.price),
        thumbnailUrl
      });
      
      setShowCreateModal(false);
      setFormData({ title: '', description: '', price: '', category: '' });
      setThumbnailFile(null);
      fetchMyCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const fileData = new FormData();
      fileData.append('video', videoFile);
      const uploadRes = await api.post('/uploads/video', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await api.post(`/courses/${selectedCourseId}/lessons`, {
        title: lessonData.title,
        order: Number(lessonData.order),
        videoUrl: uploadRes.data.url
      });
      
      setShowLessonModal(false);
      setLessonData({ title: '', order: '' });
      setVideoFile(null);
      fetchMyCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading Instructor Portal...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--c-bg)' }}>
      {/* Top Navbar */}
      <div style={{ padding: '16px 24px', background: 'var(--c-card)', borderBottom: '1px solid var(--c-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/student')} style={{ background: 'transparent', border: 'none', color: 'var(--c-sub)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span style={{ marginLeft: '8px' }}>Back to Student View</span>
          </button>
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: '0' }}>Instructor Portal</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
           <span style={{ color: 'var(--c-sub)' }}>{user?.name}</span>
           <button onClick={onLogout} className="glass-btn hover-glow" style={{ padding: '6px 12px', fontSize: '0.9rem', width: 'auto' }}>Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>My Courses</h2>
            <button onClick={() => setShowCreateModal(true)} className="glass-btn auth-submit-btn" style={{ width: 'auto', padding: '12px 24px' }}>
              + Create New Course
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courses.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--c-sub)' }}>
                You haven't created any courses yet.
              </div>
            ) : (
              courses.map(course => (
                <div key={course._id} className="glass-card hover-glow" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.title} style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '120px', height: '80px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: '8px' }}></div>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.3rem', margin: '0 0 8px 0' }}>{course.title}</h3>
                      <div style={{ color: 'var(--c-sub)', fontSize: '0.95rem' }}>Price: EGP {course.price} • Category: {course.category}</div>
                      <div style={{ marginTop: '8px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          background: course.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : course.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: course.status === 'approved' ? '#10B981' : course.status === 'rejected' ? '#ef4444' : '#F59E0B'
                        }}>
                          {course.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => { setSelectedCourseId(course._id); setShowLessonModal(true); }}
                      className="glass-btn hover-glow" style={{ padding: '8px 16px', fontSize: '0.95rem' }}
                    >
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-entrance" style={{ width: '100%', maxWidth: '600px', padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Create New Course</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}
            
            <form onSubmit={handleCreateCourse}>
              <div className="auth-input-group">
                <label>Course Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="auth-input" placeholder="e.g. Advanced React Patterns" />
              </div>
              <div className="auth-input-group">
                <label>Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="auth-input" style={{ minHeight: '100px' }} placeholder="What will students learn?" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="auth-input-group" style={{ flex: 1 }}>
                  <label>Price (EGP)</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="auth-input" placeholder="e.g. 500" />
                </div>
                <div className="auth-input-group" style={{ flex: 1 }}>
                  <label>Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="auth-input">
                    <option value="">Select a category</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Business">Business</option>
                    <option value="Data">Data</option>
                  </select>
                </div>
              </div>
              <div className="auth-input-group">
                <label>Thumbnail Image</label>
                <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files[0])} className="auth-input" style={{ padding: '10px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="glass-btn hover-glow" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="glass-btn auth-submit-btn" style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Submit Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass-card animate-entrance" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Add Lesson</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}
            
            <form onSubmit={handleAddLesson}>
              <div className="auth-input-group">
                <label>Lesson Title</label>
                <input required type="text" value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})} className="auth-input" placeholder="e.g. Introduction to State" />
              </div>
              <div className="auth-input-group">
                <label>Order Number</label>
                <input required type="number" min="1" value={lessonData.order} onChange={e => setLessonData({...lessonData, order: e.target.value})} className="auth-input" placeholder="e.g. 1" />
              </div>
              <div className="auth-input-group">
                <label>Video File</label>
                <input required type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} className="auth-input" style={{ padding: '10px' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--c-sub)', marginTop: '8px' }}>Uploading directly to Cloudinary</div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowLessonModal(false)} className="glass-btn hover-glow" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={submitting} className="glass-btn auth-submit-btn" style={{ flex: 1 }}>
                  {submitting ? 'Uploading Video...' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
