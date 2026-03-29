import React from 'react';

export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out ${className}`.trim()}>
      {children}
    </div>
  );
}

