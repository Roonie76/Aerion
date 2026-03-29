import React from 'react';

export default function SectionHeading({ title, subtitle }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
      <span className="section-heading-bar" aria-hidden="true" />
    </div>
  );
}
