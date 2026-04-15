import React from 'react';
import './WarehousePickerModal.css';

/**
 * Shared Warehouse Picker Modal
 *
 * Props:
 *   open          {boolean}   — show/hide
 *   onClose       {fn}        — called on backdrop click or X
 *   onConfirm     {fn(wh)}    — called with selected warehouse object
 *   loading       {boolean}   — show skeleton while fetching stock
 *   warehouses    {Array}     — [{ name, qty, label?, unitCost? }]
 *   product       {object}    — { itemDescription, partNumber }
 *   title         {string}    — modal heading (default "Select Warehouse")
 *   confirmLabel  {string}    — confirm button text (default "Add to Cart")
 *   note          {string}    — optional note shown at bottom
 */
const WarehousePickerModal = ({
  open,
  onClose,
  onConfirm,
  loading = false,
  warehouses = [],
  product = null,
  title = 'Select Warehouse',
  confirmLabel = 'Add to Cart',
  note = null,
}) => {
  const [selected, setSelected] = React.useState(null);

  // Auto-select best warehouse when list loads
  React.useEffect(() => {
    if (!loading && warehouses.length > 0) {
      const best = warehouses.find(w => w.qty > 0) || warehouses[0];
      setSelected(best);
    } else {
      setSelected(null);
    }
  }, [loading, warehouses]);

  if (!open) return null;

  const handleConfirm = () => {
    if (selected) onConfirm(selected);
  };

  const totalStock = warehouses.reduce((s, w) => s + (w.qty || 0), 0);

  return (
    <div className="wpm-overlay" onClick={onClose}>
      <div className="wpm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="wpm-header">
          <div className="wpm-header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="wpm-header-text">
            <h3 className="wpm-title">{title}</h3>
            {product && (
              <p className="wpm-subtitle">
                {product.itemDescription && <span className="wpm-product-name">{product.itemDescription}</span>}
                {product.partNumber && <span className="wpm-part-no">Part# {product.partNumber}</span>}
              </p>
            )}
          </div>
          <button className="wpm-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Stock summary strip */}
        {!loading && warehouses.length > 0 && (
          <div className="wpm-summary-strip">
            <div className="wpm-summary-item">
              <span className="wpm-summary-val">{warehouses.length}</span>
              <span className="wpm-summary-lbl">Warehouses</span>
            </div>
            <div className="wpm-summary-divider" />
            <div className="wpm-summary-item">
              <span className={`wpm-summary-val ${totalStock > 0 ? 'wpm-green' : 'wpm-orange'}`}>{totalStock}</span>
              <span className="wpm-summary-lbl">Total Stock</span>
            </div>
            <div className="wpm-summary-divider" />
            <div className="wpm-summary-item">
              <span className="wpm-summary-val">{warehouses.filter(w => w.qty > 0).length}</span>
              <span className="wpm-summary-lbl">In Stock</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="wpm-body">
          {loading ? (
            <div className="wpm-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="wpm-skeleton-row">
                  <div className="wpm-skeleton wpm-sk-radio" />
                  <div className="wpm-skeleton wpm-sk-name" />
                  <div className="wpm-skeleton wpm-sk-badge" />
                </div>
              ))}
            </div>
          ) : warehouses.length === 0 ? (
            <div className="wpm-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <p>No warehouses available</p>
            </div>
          ) : (
            <div className="wpm-list">
              {warehouses.map((wh, i) => {
                const isSelected = selected?.name === wh.name;
                const inStock = wh.qty > 0;
                return (
                  <div
                    key={wh.name}
                    className={`wpm-row${isSelected ? ' wpm-row--selected' : ''}${!inStock ? ' wpm-row--backorder' : ''}`}
                    onClick={() => setSelected(wh)}
                  >
                    {/* Radio */}
                    <div className={`wpm-radio${isSelected ? ' wpm-radio--active' : ''}`} />

                    {/* Info */}
                    <div className="wpm-row-info">
                      <div className="wpm-row-top">
                        <span className="wpm-wh-name">{wh.name}</span>
                        {wh.label && (
                          <span className={`wpm-label-tag wpm-label-${i === 0 ? 'primary' : i === 1 ? 'secondary' : 'tertiary'}`}>
                            {wh.label}
                          </span>
                        )}
                        {!inStock && <span className="wpm-backorder-tag">Back Order</span>}
                      </div>
                      {wh.unitCost && (
                        <span className="wpm-unit-cost">₹{parseFloat(wh.unitCost).toFixed(2)}</span>
                      )}
                    </div>

                    {/* Stock qty */}
                    <div className="wpm-qty-wrap">
                      <span className={`wpm-qty ${inStock ? 'wpm-qty--in' : 'wpm-qty--out'}`}>
                        {inStock ? wh.qty : '0'}
                      </span>
                      <span className="wpm-qty-lbl">{inStock ? 'in stock' : 'no stock'}</span>
                    </div>

                    {/* Selected check */}
                    {isSelected && (
                      <div className="wpm-check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {note && (
            <div className="wpm-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="wpm-footer">
          <button className="wpm-btn wpm-btn--cancel" onClick={onClose}>Cancel</button>
          <button
            className="wpm-btn wpm-btn--confirm"
            onClick={handleConfirm}
            disabled={!selected || loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Need React in scope for hooks
export default WarehousePickerModal;
