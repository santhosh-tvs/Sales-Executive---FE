/**
 * OrderPlacingOverlay
 * Full-screen animated overlay shown while an order is being placed.
 * Blocks all interaction. Import and render when `isPlacing` is true.
 */
const OrderPlacingOverlay = ({ message = 'Placing your order…' }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 99999,
    background: 'rgba(10,20,60,0.72)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    animation: 'opo-fade-in .2s ease',
  }}>
    <style>{`
      @keyframes opo-fade-in { from { opacity:0 } to { opacity:1 } }
      @keyframes opo-spin { to { transform: rotate(360deg) } }
      @keyframes opo-pulse { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.15);opacity:1} }
      @keyframes opo-dots { 0%{content:'.'} 33%{content:'..'} 66%{content:'...'} 100%{content:'.'} }
      .opo-dots::after { content:'.'; animation: opo-dots 1.4s steps(1) infinite; }
    `}</style>

    {/* Spinner ring */}
    <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 28 }}>
      <div style={{
        position: 'absolute', inset: 0,
        border: '4px solid rgba(255,255,255,.15)',
        borderTopColor: '#f36f21',
        borderRadius: '50%',
        animation: 'opo-spin .8s linear infinite',
      }} />
      <div style={{
        position: 'absolute', inset: 10,
        border: '3px solid rgba(255,255,255,.08)',
        borderTopColor: 'rgba(255,255,255,.5)',
        borderRadius: '50%',
        animation: 'opo-spin 1.4s linear infinite reverse',
      }} />
      {/* Cart icon in center */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'opo-pulse 1.6s ease-in-out infinite',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
    </div>

    <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
      <span className="opo-dots">{message.replace(/…$/, '').replace(/\.$/, '')}</span>
    </div>
    <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>
      Please don't close or refresh this page
    </div>
  </div>
);

export default OrderPlacingOverlay;
