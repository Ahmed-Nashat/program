import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button, InputField, TextareaField, notyf } from './SharedUI';

export default function TestimonialsManager({ user }) {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ studentName: '', university: '', role: '', rating: 5, review: '' });
  
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website/testimonials');
      setTestimonials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!isSuperAdmin && ['approved', 'featured'].includes(status)) {
      notyf.error('Super Admin permission required to approve or feature testimonials.');
      return;
    }
    try {
      await api.patch(`/website/testimonials/${id}`, { status });
      notyf.success('Testimonial status updated');
      fetchTestimonials();
    } catch (err) {
      notyf.error('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial permanently?')) return;
    try {
      await api.delete(`/website/testimonials/${id}`);
      notyf.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (err) {
      notyf.error('Failed to delete testimonial: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/website/testimonials', formData);
      setShowModal(false);
      notyf.success('Testimonial created successfully');
      fetchTestimonials();
    } catch (err) {
      notyf.error('Failed to create testimonial');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return 'badge-success';
      case 'featured': return 'badge-accent';
      case 'rejected': return 'badge-danger';
      case 'hidden': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Testimonials Moderation</h2>
          <p style={{ color: 'var(--text-2)' }}>Approve, feature, or reject student reviews.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)} style={{ height: '40px' }}>
          + Add Testimonial
        </Button>
      </div>

      <div className="admin-card">
        <table className="program-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Student Info</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Review</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <div style={{ color: 'var(--text-1)', fontWeight: 'bold' }}>{item.studentName}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: '12px' }}>{item.role} • {item.university}</div>
                  <div style={{ color: 'var(--c-orange)', fontSize: '12px', marginTop: '4px' }}>{'★'.repeat(item.rating)}</div>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-2)', maxWidth: '400px', verticalAlign: 'top' }}>
                  <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>"{item.review}"</p>
                </td>
                <td style={{ padding: '16px', verticalAlign: 'top' }}>
                  <span className={`badge ${getStatusBadge(item.status)}`} style={{ textTransform: 'capitalize' }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap', verticalAlign: 'top' }}>
                  {item.status !== 'approved' && item.status !== 'featured' && (
                    <Button variant="success" onClick={() => handleStatusChange(item._id, 'approved')} disabled={!isSuperAdmin} title={!isSuperAdmin ? "Super Admin permission required" : ""}>Approve</Button>
                  )}
                  {item.status !== 'featured' && (
                    <Button variant="primary" onClick={() => handleStatusChange(item._id, 'featured')} disabled={!isSuperAdmin} title={!isSuperAdmin ? "Super Admin permission required" : ""}>Feature</Button>
                  )}
                  {item.status !== 'hidden' && (
                    <Button variant="warning" onClick={() => handleStatusChange(item._id, 'hidden')}>Hide</Button>
                  )}
                  <Button variant="danger" onClick={() => handleDelete(item._id)} disabled={!isSuperAdmin} title={!isSuperAdmin ? "Super Admin permission required" : ""}>Delete</Button>
                </td>
              </tr>
            ))}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)' }}>
                  No testimonials found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: '500px', padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-1)' }}>Add Manual Testimonial</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InputField
                label="Student Name"
                value={formData.studentName}
                onChange={e => setFormData({...formData, studentName: e.target.value})}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <InputField
                  label="Role"
                  placeholder="e.g. Developer"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                />
                <InputField
                  label="University"
                  value={formData.university}
                  onChange={e => setFormData({...formData, university: e.target.value})}
                />
              </div>
              <TextareaField
                label="Review Content"
                value={formData.review}
                onChange={e => setFormData({...formData, review: e.target.value})}
                required
                rows={4}
              />
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Add Testimonial</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
