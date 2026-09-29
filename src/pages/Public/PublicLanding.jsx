import React, { useEffect } from 'react';
import { COMPANY_CONFIG } from '../../config/companyConfig';
import PublicHeader from '../../components/public/PublicHeader';
import PublicHero from '../../components/public/PublicHero';
import PublicAbout from '../../components/public/PublicAbout';
import PublicSpecialties from '../../components/public/PublicSpecialties';
import PublicStats from '../../components/public/PublicStats';
import PublicVideo from '../../components/public/PublicVideo';
import PublicProjects from '../../components/public/PublicProjects';
import PublicGallery from '../../components/public/PublicGallery';
import PublicCareers from '../../components/public/PublicCareers';
import PublicContact from '../../components/public/PublicContact';
import PublicFooter from '../../components/public/PublicFooter';

export default function PublicLanding({ config = COMPANY_CONFIG }) {
  useEffect(() => {
    document.title = `${config.identity.commercialName} — ${config.identity.tagline}`;
    
    // Smooth scroll if URL hash exists on load
    const hash = window.location.hash;
    if (hash && hash !== '#inicio' && hash !== '#') {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [config]);

  return (
    <div className="public-site-wrapper">
      {/* Navigation Bar */}
      <PublicHeader config={config} />

      {/* Main Content */}
      <main className="public-site-main">
        {/* Hero Section */}
        <PublicHero config={config} />

        {/* Company & Philosophy Section */}
        <PublicAbout config={config} />

        {/* Specialties / Lines of Business */}
        <PublicSpecialties config={config} />

        {/* Impact Metrics & Certifications */}
        <PublicStats config={config} />

        {/* Institutional Video Section */}
        <PublicVideo config={config} />

        {/* Live Projects Portfolio */}
        <PublicProjects />

        {/* Photographic Works Gallery */}
        <PublicGallery config={config} />

        {/* Careers & Recruitment */}
        <PublicCareers config={config} />

        {/* Contact & Location */}
        <PublicContact config={config} />
      </main>

      {/* Footer */}
      <PublicFooter config={config} />
    </div>
  );
}
