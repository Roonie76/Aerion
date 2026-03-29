import React from 'react';
import PageWrapper from '../components/PageWrapper';
import SectionHeading from '../components/SectionHeading';

export default function About() {
  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container">
          <SectionHeading title="About Aerion" subtitle="Performance engineering built for serious play." />
          <div className="content-card">
            <p>
              AERION Sports Labs develops precision badminton flight systems with a single goal: no unpredictable
              shots. Our process blends feather grading, cork density control, and repeated environmental testing.
            </p>
            <p>
              Every tube is benchmarked for speed class consistency, rotational stability, and recovery response so
              players can focus on tactics instead of equipment variation.
            </p>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
