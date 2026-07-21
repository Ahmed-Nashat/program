import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button, InputField, TextareaField, SelectField, notyf } from './SharedUI';

export default function FAQManager({ user }) {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'General', status: 'active' });
  const [editingId, setEditingId] = useState(null);
  
  const isSuperAdmin = user?.role === 'superadmin';

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website/faqs');
      setFaqs(res.data);
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
        await api.patch(`/website/faqs/${editingId}`, formData);
      } else {
        await api.post('/website/faqs', formData);
      }
      setShowModal(false);
      notyf.success('FAQ saved successfully');
      fetchFaqs();
    } catch (err) {
      notyf.error('Failed to save FAQ: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ permanently?')) return;
    try {
      await api.delete(`/website/faqs/${id}`);
      notyf.success('FAQ deleted successfully');
      fetchFaqs();
    } catch (err) {
      notyf.error('Failed to delete FAQ: ' + (err.response?.data?.message || err.message));
    }
  };

  const openEdit = (faq) => {
    setFormData({ question: faq.question, answer: faq.answer, category: faq.category, status: faq.status });
    setEditingId(faq._id);
    setShowModal(true);
  };

  const openCreate = () => {
    setFormData({ question: '', answer: '', category: 'General', status: 'active' });
    setEditingId(null);
    setShowModal(true);
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>FAQ Management</h2>
          <p style={{ color: 'var(--text-2)' }}>Manage frequently asked questions.</p>
        </div>
        <Button variant="primary" onClick={openCreate} style={{ height: '40px' }}>
          + Add FAQ
        </Button>
      </div>

      <div className="admin-card">
        <table className="program-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Question</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Category</th>
              <th style={{ padding: '16px', color: 'var(--text-2)' }}>Status</th>
              <th style={{ padding: '16px', color: 'var(--text-2)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map(faq => (
              <tr key={faq._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', color: 'var(--text-1)' }}>{faq.question}</td>
                <td style={{ padding: '16px', color: 'var(--text-2)' }}>{faq.category}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge badge-${faq.status === 'active' ? 'success' : 'warning'}`}>
                    {faq.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => openEdit(faq)}>Edit</Button>
                  <Button 
                    variant="danger" 
                    onClick={() => handleDelete(faq._id)}
                    disabled={!isSuperAdmin}
                    title={!isSuperAdmin ? "Super Admin permission required" : ""}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)' }}>
                  No FAQs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-card" style={{ width: '500px', padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-1)' }}>{editingId ? 'Edit FAQ' : 'Create FAQ'}</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InputField
                label="Question"
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                required
              />
              <TextareaField
                label="Answer"
                value={formData.answer}
                onChange={e => setFormData({...formData, answer: e.target.value})}
                required
                rows={4}
              />
              <SelectField
                label="Category"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                options={['General', 'Pricing', 'Courses', 'Technical Support']}
              />
              <SelectField
                label="Status"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'hidden', label: 'Hidden' }
                ]}
              />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save FAQ</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
