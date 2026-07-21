import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button, InputField, TextareaField, SelectField, notyf } from './SharedUI';

export default function AnnouncementsManager({ user }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', content: '', type: 'General', audience: 'Everyone', priority: 'Low', status: 'draft', isPinned: false, showAsBanner: false 
  });
  const [editingId, setEditingId] = useState(null);
  
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/website/announcements/${editingId}`, formData);
      } else {
        await api.post('/website/announcements', formData);
      }
      setShowModal(false);
      notyf.success('Announcement saved successfully');
      fetchAnnouncements();
    } catch (err) {
      notyf.error('Failed to save announcement: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement permanently?')) return;
    try {
      await api.delete(`/website/announcements/${id}`);
      notyf.success('Announcement deleted successfully');
      fetchAnnouncements();
    } catch (err) {
      notyf.error('Failed to delete announcement: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEdit = (item) => {
    setFormData({ 
      title: item.title, content: item.content, type: item.type, audience: item.audience, 
      priority: item.priority, status: item.status, isPinned: item.isPinned, showAsBanner: item.showAsBanner 
    });
    setEditingId(item._id);
    setShowModal(true);
  };

  const openCreate = () => {
    setFormData({ 
      title: '', content: '', type: 'General', audience: 'Everyone', priority: 'Low', status: 'draft', isPinned: false, showAsBanner: false 
    });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Announcements</h2>
          <p style={{ color: 'var(--text-2)' }}>Broadcast messages, maintenance alerts, and banners.</p>
        </div>
        <Button variant="primary" onClick={openCreate} style={{ height: '40px' }}>
          + New Announcement
        </Button>
      </div>

      <div className="admin-card">
        <table className="program-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Announcement</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Audience</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Priority</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ color: 'var(--text-1)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.title}
                    {item.isPinned && <span style={{ fontSize: '12px' }}>📌</span>}
                    {item.showAsBanner && <span style={{ fontSize: '12px', background: 'var(--c-orange)', padding: '2px 6px', borderRadius: '4px', color: 'black' }}>Banner</span>}
                  </div>
                  <div style={{ color: 'var(--text-2)', fontSize: '12px', marginTop: '4px' }}>{item.type}</div>
                </td>
                <td style={{ padding: '16px', color: 'var(--text-2)' }}>{item.audience}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge badge-${item.priority === 'Critical' ? 'danger' : item.priority === 'High' ? 'warning' : 'secondary'}`}>
                    {item.priority}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge badge-${item.status === 'published' ? 'success' : 'secondary'}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => openEdit(item)}>Edit</Button>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDelete(item._id)}
                    disabled={!isSuperAdmin}
                    title={!isSuperAdmin ? "Super Admin permission required" : ""}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)' }}>
                  No announcements found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: '600px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-1)' }}>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InputField
                label="Title"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
              <TextareaField
                label="Content"
                value={formData.content}
                onChange={e => setFormData({...formData, content: e.target.value})}
                required
                rows={4}
              />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <SelectField
                  label="Type"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  options={['General', 'Maintenance', 'Feature Update', 'Promotion', 'Emergency']}
                />
                <SelectField
                  label="Audience"
                  value={formData.audience}
                  onChange={e => setFormData({...formData, audience: e.target.value})}
                  options={['Everyone', 'Students', 'Instructors', 'Admins']}
                />
                <SelectField
                  label="Priority"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  options={['Low', 'Medium', 'High', 'Critical']}
                />
                <SelectField
                  label="Status"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  disabled={!isSuperAdmin && (formData.status === 'published' || formData.status === 'archived')}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                    { value: 'archived', label: 'Archived' }
                  ]}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-1)' }}>
                  <input type="checkbox" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: 'var(--c-accent)' }} />
                  Pin to Top
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-1)' }}>
                  <input type="checkbox" checked={formData.showAsBanner} onChange={e => setFormData({...formData, showAsBanner: e.target.checked})} style={{ width: '16px', height: '16px', accentColor: 'var(--c-accent)' }} />
                  Show as Homepage Banner
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Announcement</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
