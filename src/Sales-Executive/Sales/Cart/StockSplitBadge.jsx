import { useState } from 'react';
import './StockSplitBadge.css';

/**
 * Shows sale/back-order split for a cart item based on availableQty vs quantity.
 * availableQty comes from the warehouse popup at add-to-cart time.
 */
const StockSplitBadge = ({ item }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const ordered = item.quantity || 0;
  const available = item.availableQty ?? null;

  // If availableQty was never set (e.g. added before warehouse popup), skip
  if (available === null || available === undefined) return null;

  const saleQty = Math.min(ordered, available);
  const backQty = Math.max(0, ordered - available);

  // All in stock — no back order, no badge needed
  if (backQty === 0) return null;

  return (
    <div className="ssb-wrap">
      <div className="ssb-badges">
        {saleQty > 0 && (
          <span className="ssb-badge ssb-sale">
            <span className="ssb-dot ssb-dot-sale" />
            Sale: {saleQty}
          </span>
        )}
        <span className="ssb-badge ssb-bo">
          <span className="ssb-dot ssb-dot-bo" />
          Back Order: {backQty}
        </span>
      </div>

      {/* Info icon with tooltip */}
      <div
        className="ssb-info-wrap"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg className="ssb-info-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {showTooltip && (
          <div className="ssb-tooltip">
            <div className="ssb-tooltip-row">
              <span className="ssb-tooltip-dot ssb-dot-sale" />
              <div>
                <strong>Sale Order ({saleQty} units)</strong>
                <p>Stock available — will be processed immediately by ERP.</p>
              </div>
            </div>
            {backQty > 0 && (
              <div className="ssb-tooltip-row">
                <span className="ssb-tooltip-dot ssb-dot-bo" />
                <div>
                  <strong>Back Order ({backQty} units)</strong>
                  <p>No stock — will be fulfilled when stock becomes available.</p>
                </div>
              </div>
            )}
            <div className="ssb-tooltip-note">
              Stock available will be processed as Sale Order. Remaining quantity will be placed as Back Order.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSplitBadge;
