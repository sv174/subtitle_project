import './Modal.css';
import React, { useEffect } from 'react';

/**
 * WsModal — shared dialog shell for the whole app.
 * Drop-in replacement for react-bootstrap's <Modal>, styled to match
 * the dark slate workspace instead of Bootstrap defaults.
 *
 * Usage:
 * <WsModal show={show} onClose={handleClose} title="Import SRT" tone="danger" wide>
 *   <WsModal.Body>...</WsModal.Body>
 *   <WsModal.Footer>...</WsModal.Footer>
 * </WsModal>
 */
function WsModal({ show, onClose, title, tone, wide, children }) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="ws-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`ws-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ws-modal-header">
          <h2 className={tone === 'danger' ? 'tone-danger' : ''}>{title}</h2>
          <button className="ws-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

WsModal.Body = function Body({ children }) {
  return <div className="ws-modal-body">{children}</div>;
};

WsModal.Footer = function Footer({ children }) {
  return <div className="ws-modal-footer">{children}</div>;
};

export default WsModal;