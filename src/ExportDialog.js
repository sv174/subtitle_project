import React, { useState } from 'react';
import WsModal from './Modal';

function ExportDialog({ show, saveSrtFile, Entries, setShow }) {
  const [fileName, setFileName] = useState('');

  const handleCloseExportModal = () => setShow(false);

  const handleExport = () => {
    saveSrtFile(Entries, fileName || 'subtitles');
    handleCloseExportModal();
  };

  return (
    <WsModal show={show} onClose={handleCloseExportModal} title="Export SRT file">
      <WsModal.Body>
        <div className="ws-form-group">
          <label>File name</label>
          <input
            className="ws-input"
            placeholder="subtitles"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <div className="ws-form-hint">Saved as {fileName || 'subtitles'}.srt — {Entries.length} cue{Entries.length === 1 ? '' : 's'}.</div>
        </div>
      </WsModal.Body>
      <WsModal.Footer>
        <button className="ws-btn" onClick={handleCloseExportModal}>Cancel</button>
        <button className="ws-btn primary" onClick={handleExport}>Export</button>
      </WsModal.Footer>
    </WsModal>
  );
}

export default ExportDialog;