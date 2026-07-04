import React from 'react';
import WsModal from './Modal';

function DeleteEntry({ handleClose, handleDelete, showDelete }) {
  return (
    <WsModal show={showDelete} onClose={handleClose} title="Delete cue" tone="danger">
      <WsModal.Body>
        <p>Are you sure you want to delete this cue? This can't be undone.</p>
      </WsModal.Body>
      <WsModal.Footer>
        <button className="ws-btn" onClick={handleClose}>Cancel</button>
        <button className="ws-btn danger-solid" onClick={handleDelete}>Delete</button>
      </WsModal.Footer>
    </WsModal>
  );
}

export default DeleteEntry;