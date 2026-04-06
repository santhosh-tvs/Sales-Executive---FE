/**
 * Order Status Definitions
 *
 * Sale Order statuses (item_details[].status):
 *   pending     → Order created, not yet pushed to ERP
 *   in_progress → Pushed to ERP, ERP Order Number not yet generated
 *   success     → ERP confirmed, order number generated
 *   error       → Error occurred while pushing to ERP
 *
 * Back Order statuses (item_details[].status):
 *   no_stock    → Back order created due to stock unavailability
 *   cancelled   → Back order has been cancelled
 *   expired     → Back order expired due to validity date being reached
 */

export const SALE_STATUSES = new Set(['pending', 'in_progress', 'success', 'error']);
export const HOLD_STATUSES = new Set(['no_stock', 'cancelled', 'expired']);

/**
 * Classify an order as sale / hold / both based on its item statuses.
 * An order with mixed items (some sale, some back order) will have both true.
 * Orders with no item_details yet are treated as sale (pending).
 */
export const classifyOrder = (order) => {
  const items = order.item_details || [];
  if (items.length === 0) return { isSale: true, isHold: false };
  const statuses = items.map(i => (i.status || 'pending').toLowerCase());
  const isSale = statuses.some(s => SALE_STATUSES.has(s));
  const isHold = statuses.some(s => HOLD_STATUSES.has(s));
  return { isSale, isHold };
};

export const STATUS_CONFIG = {
  // Sale Order statuses
  pending:     { label: 'Pending',     cls: 'oh-badge-pending',     desc: 'Order created, not pushed to ERP' },
  in_progress: { label: 'In Progress', cls: 'oh-badge-in-progress', desc: 'Pushed to ERP, ERP Order Number not yet generated' },
  success:     { label: 'Success',     cls: 'oh-badge-success',     desc: 'Successfully created in ERP' },
  error:       { label: 'Error',       cls: 'oh-badge-error',       desc: 'Error occurred while pushing to ERP' },
  // Back Order statuses
  no_stock:    { label: 'No Stock',    cls: 'oh-badge-no-stock',    desc: 'Back order created due to stock unavailability' },
  cancelled:   { label: 'Cancelled',   cls: 'oh-badge-cancelled',   desc: 'Back order has been cancelled' },
  expired:     { label: 'Expired',     cls: 'oh-badge-expired',     desc: 'Back order expired due to validity date' },
};

/**
 * Check if an order's validity date has passed.
 */
export const isExpired = (validityDate) => {
  if (!validityDate) return false;
  return new Date(validityDate) < new Date();
};

/**
 * Derive order-level status from item_details[].status.
 *
 * Sale Order priority (highest → lowest): error > in_progress > pending > success
 * Back Order priority:                    cancelled > expired > no_stock
 *
 * If an order has both sale and back order items, sale status takes precedence.
 */
export const resolveOrderStatus = (order) => {
  const items = order.item_details || [];

  if (items.length === 0) {
    // No details yet — check validity date for expired back orders
    if (isExpired(order.validity_date)) return 'expired';
    return 'pending';
  }

  const statuses = items.map(i => (i.status || 'pending').toLowerCase());

  // Sale order status priority
  if (statuses.some(s => s === 'error'))       return 'error';
  if (statuses.some(s => s === 'in_progress')) return 'in_progress';
  if (statuses.some(s => s === 'pending'))     return 'pending';
  if (statuses.every(s => s === 'success'))    return 'success';

  // Back order status priority
  if (statuses.some(s => s === 'cancelled'))   return 'cancelled';
  if (isExpired(order.validity_date))          return 'expired';
  if (statuses.some(s => s === 'no_stock'))    return 'no_stock';

  // Mixed success + back order — treat as success
  if (statuses.some(s => s === 'success'))     return 'success';

  return 'pending';
};

export const StatusBadge = ({ status }) => {
  const s = (status || 'pending').toLowerCase();
  const cfg = STATUS_CONFIG[s] || { label: status || '-', cls: 'oh-badge-pending', desc: '' };
  return (
    <span className={`oh-badge ${cfg.cls}`} title={cfg.desc}>
      {cfg.label}
    </span>
  );
};
