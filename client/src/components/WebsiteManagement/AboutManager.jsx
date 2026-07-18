import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button, TextareaField, notyf } from './SharedUI';

export default function AboutManager({ user }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website/content');
      setContent(res.data.about);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch('/website/content', { about: content });
      notyf.success('About settings saved successfully!');
    } catch (err) {
      notyf.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>About Page Management</h2>
          <p style={{ color: 'var(--text-2)' }}>Manage company story, mission, and team members.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          disabled={saving}
          style={{ height: '40px' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="admin-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Company Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <TextareaField
            label="Company Story"
            value={content?.companyStory || ''}
            onChange={(e) => handleChange('companyStory', e.target.value)}
            rows={4}
          />
          <TextareaField
            label="Mission Statement"
            value={content?.mission || ''}
            onChange={(e) => handleChange('mission', e.target.value)}
            rows={2}
          />
          <TextareaField
            label="Vision Statement"
            value={content?.vision || ''}
            onChange={(e) => handleChange('vision', e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
