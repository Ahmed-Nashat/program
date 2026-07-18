import React, { useState } from 'react';
import HomepageManager from './HomepageManager';
import AboutManager from './AboutManager';
import FAQManager from './FAQManager';
import ContactManager from './ContactManager';
import TestimonialsManager from './TestimonialsManager';
import AnnouncementsManager from './AnnouncementsManager';

export default function WebsiteManagement({ user, subTab }) {
  // Use the subTab prop if provided (e.g. from AdminPortal router), 
  const currentTab = subTab || 'home';

  return (
    <div className="website-management">
      {currentTab === 'home' && <HomepageManager user={user} />}
      {currentTab === 'about' && <AboutManager user={user} />}
      {currentTab === 'faq' && <FAQManager user={user} />}
      {currentTab === 'contact' && <ContactManager user={user} />}
      {currentTab === 'testimonials' && <TestimonialsManager user={user} />}
      {currentTab === 'announcements' && <AnnouncementsManager user={user} />}
    </div>
  );
}
