import React from 'react';
import './Spinner.css';

/**
 * Reusable Spinner
 * Usage:
 *   <Spinner />                        — centered full-area spinner
 *   <Spinner size="sm" />              — small inline spinner
 *   <Spinner text="Loading orders..." />
 *   <Spinner inline />                 — inline (no wrapper div)
 */
const Spinner = ({ size = 'md', text = '', inline = false }) => {
  if (inline) {
    return <span className={`sp sp-${size}`} aria-label="Loading" />;
  }

  return (
    <div className="sp-wrapper">
      <span className={`sp sp-${size}`} aria-label="Loading" />
      {text && <p className="sp-text">{text}</p>}
    </div>
  );
};

export default Spinner;
