// LoadingModal.jsx
import React from 'react';
import './LoadingModal.css';
import LoadingSpinner from './LoadingSpinner';

const LoadingModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="loading-modal">
      <div className="modal-content">
        <LoadingSpinner />
        <p>Processing…</p>
      </div>
    </div>
  );
};

export default LoadingModal;