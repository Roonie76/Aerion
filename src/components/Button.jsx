import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  ariaLabel,
}) {
  const computedAriaLabel = ariaLabel ?? (typeof children === 'string' ? children : undefined);

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={computedAriaLabel}
      className={`btn btn-${variant} btn-interactive ${className}`.trim()}
    >
      <span className="btn-content">{children}</span>
    </button>
  );
}
