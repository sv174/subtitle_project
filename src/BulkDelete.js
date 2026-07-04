import React, { useState } from 'react';
import WsModal from './Modal';

function BulkDelete({ Entries, setEntries, Divs, setDivs }) {
  const [startIndex, setStartIndex] = useState('');
  const [endIndex, setEndIndex] = useState('');
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    setShow(false);
    setStartIndex('');
    setEndIndex('');
    setErrorMessage('');
  };

  const showDialog = () => setShow(true);

  const deleteEntriesBulk = () => {
    const start = parseInt(startIndex) - 1;
    const end = parseInt(endIndex) - 1;

    if (isNaN(start) || isNaN(end) || start < 0 || end < 0 || start > end || end >= Entries.length) {
      setErrorMessage('Invalid start or end index. Please ensure the indices are valid.');
      return;
    }

    const updatedEntries = Entries.filter((_, index) => index < start || index > end);
    const updatedDivs = Divs.filter((_, index) => index < start || index > end);

    setEntries(updatedEntries);
    setDivs(updatedDivs);
    handleClose();
  };

  return (
    <>
      <button onClick={showDialog} className="ws-btn danger">Bulk delete</button>

      <WsModal show={show} onClose={handleClose} title="Delete multiple cues" tone="danger">
        <WsModal.Body>
          <div className="ws-form-row">
            <div className="ws-form-group">
              <label>Start index (1-based)</label>
              <input
                type="number"
                className="ws-input"
                placeholder="e.g. 3"
                value={startIndex}
                onChange={(e) => setStartIndex(e.target.value)}
              />
            </div>
            <div className="ws-form-group">
              <label>End index (1-based)</label>
              <input
                type="number"
                className="ws-input"
                placeholder="e.g. 8"
                value={endIndex}
                onChange={(e) => setEndIndex(e.target.value)}
              />
            </div>
          </div>

          {errorMessage && <div className="ws-form-error">{errorMessage}</div>}

          <div className="ws-form-note">
            This permanently removes every cue from the start index through the end index, inclusive.
            <ul>
              <li>Indices are 1-based — cue #1 is the first row in the timeline.</li>
              <li>Set start and end to the same number to delete a single cue.</li>
            </ul>
          </div>
        </WsModal.Body>
        <WsModal.Footer>
          <button className="ws-btn" onClick={handleClose}>Cancel</button>
          <button className="ws-btn danger-solid" onClick={deleteEntriesBulk}>Delete range</button>
        </WsModal.Footer>
      </WsModal>
    </>
  );
}

export default BulkDelete;