import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Button, InputField, TextareaField, notyf } from './SharedUI';

export default function ContactManager({ user }) {
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
      setContent(res.data.contact);
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
      await api.patch('/website/content', { contact: content });
      notyf.success('Contact settings saved successfully!');
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

  const handleSocialChange = (network, value) => {
    setContent(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [network]: value
      }
    }));
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="admin-page-content">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Contact Management</h2>
          <p style={{ color: 'var(--text-2)' }}>Manage business details and social media links.</p>
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
        <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Business Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <InputField
            label="Support Email"
            type="email"
            value={content?.supportEmail || ''}
            onChange={(e) => handleChange('supportEmail', e.target.value)}
          />
          <InputField
            label="Business Email"
            type="email"
            value={content?.businessEmail || ''}
            onChange={(e) => handleChange('businessEmail', e.target.value)}
          />
          <InputField
            label="WhatsApp Number"
            value={content?.whatsappNumber || ''}
            onChange={(e) => handleChange('whatsappNumber', e.target.value)}
          />
          <InputField
            label="Business Hours"
            value={content?.businessHours || ''}
            onChange={(e) => handleChange('businessHours', e.target.value)}
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <TextareaField
              label="Physical Address"
              value={content?.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={2}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <InputField
              label="Google Maps Embed URL"
              value={content?.googleMapsUrl || ''}
              onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--text-1)' }}>Social Media Links</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {['facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'github'].map(network => (
            <InputField
              key={network}
              label={network.charAt(0).toUpperCase() + network.slice(1)}
              type="url"
              value={content?.socialMediaLinks?.[network] || ''}
              onChange={(e) => handleSocialChange(network, e.target.value)}
              placeholder={`https://${network}.com/...`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
