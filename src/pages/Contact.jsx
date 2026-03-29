import React from 'react';
import PageWrapper from '../components/PageWrapper';
import SectionHeading from '../components/SectionHeading';

export default function Contact() {
  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container">
          <SectionHeading title="Contact" subtitle="Connect with our performance and partnership team." />
          <div className="content-card">
            <p>Email: performance@aerionlabs.com</p>
            <p>Phone: +91 90000 00000</p>
            <p>For bulk procurement, club support, and tournament-grade recommendations, contact AERION Sports Labs.</p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
