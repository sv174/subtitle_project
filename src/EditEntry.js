// src/EditEntry.js
import React, { useState, useEffect } from 'react';
import WsModal from './Modal';

function EditEntry({ Entries, show, handleClose, selectedIndex, handleSave }) {
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    if (selectedIndex !== null && Entries[selectedIndex]) {
      setSelectedEntry({ ...Entries[selectedIndex], index: selectedIndex });
    }
  }, [selectedIndex, Entries]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name !== 'Text') {
      setSelectedEntry({ ...selectedEntry, [name]: format(value) });
    } else {
      setSelectedEntry({ ...selectedEntry, [name]: value });
    }
  };

  const format = (val) => {
    let numericValue = val.replace(/\D/g, '');
    let formatted = '';
    if (numericValue.length > 0) {
      formatted = numericValue.slice(0, 2);
      if (numericValue.length > 2) formatted += ':' + numericValue.slice(2, 4);
      if (numericValue.length > 4) formatted += ':' + numericValue.slice(4, 6);
      if (numericValue.length > 6) formatted += ',' + numericValue.slice(6, 9);
    }
    return formatted;
  };

  const handleSaveClick = () => {
    if (selectedEntry) handleSave(selectedEntry);
  };

  return (
    <WsModal show={show} onClose={handleClose} title="Edit cue">
      <WsModal.Body>
        {selectedEntry && (
          <>
            <div className="ws-form-row">
              <div className="ws-form-group">
                <label>Start time</label>
                <input className="ws-input" name="startTime"
                       value={selectedEntry.startTime || ''} onChange={handleChange} />
              </div>
              <div className="ws-form-group">
                <label>End time</label>
                <input className="ws-input" name="endTime"
                       value={selectedEntry.endTime || ''} onChange={handleChange} />
              </div>
            </div>
            <div className="ws-form-group">
              <label>Text</label>
              <input className="ws-input text" name="Text"
                     value={selectedEntry.Text || ''} onChange={handleChange} />
            </div>
          </>
        )}
      </WsModal.Body>
      <WsModal.Footer>
        <button className="ws-btn" onClick={handleClose}>Cancel</button>
        <button className="ws-btn primary" onClick={handleSaveClick}>Save changes</button>
      </WsModal.Footer>
    </WsModal>
  );
}

export default EditEntry;