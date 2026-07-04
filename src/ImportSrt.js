import React, { useState } from 'react';
import srtParser2 from 'srt-parser-2';
import WsModal from './Modal';

function ImportSrt({ setEntries, SetDivs, setIndex }) {
  const [srtfile, setSrtFile] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const handleCloseExportModal = () => {
    setShow(false);
    setSrtFile('');
    setError('');
  };

  const ShowDialog = () => setShow(true);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSrtFile(file);
      setError('');
    }
  };

  const handleSrtSelection = () => {
    if (!srtfile) {
      setError('Choose an .srt file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const srtFileContent = e.target.result;
      const parser = new srtParser2();
      const srt_array = parser.fromSrt(srtFileContent);

      const formattedArray = srt_array
        .map((entry, index) => {
          if (entry && entry.startTime && entry.endTime && entry.text) {
            return {
              id: (index + 1).toString(),
              startTime: entry.startTime,
              endTime: entry.endTime,
              Text: entry.text,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (formattedArray.length === 0) {
        setError('No valid cues found in that file. Check the .srt format and try again.');
        return;
      }

      setEntries(formattedArray);
      setIndex(formattedArray.length + 1);
      const divArray = Array.from({ length: formattedArray.length }, (_, index) => index + 1);
      SetDivs(divArray);
      handleCloseExportModal();
    };
    reader.readAsText(srtfile);
  };

  return (
    <>
      <button className="ws-btn" onClick={ShowDialog}>Import SRT</button>

      <WsModal show={show} onClose={handleCloseExportModal} title="Import SRT file">
        <WsModal.Body>
          <div className="ws-form-group">
            <label>SRT file</label>
            <div className="ws-file-drop">
              <input type="file" accept=".srt" onChange={handleFileChange} />
              {srtfile && <div className="picked">{srtfile.name}</div>}
            </div>
          </div>
          {error && <div className="ws-form-error">{error}</div>}
          <div className="ws-form-hint">This replaces the current timeline. Export your work first if you want to keep it.</div>
        </WsModal.Body>
        <WsModal.Footer>
          <button className="ws-btn" onClick={handleCloseExportModal}>Cancel</button>
          <button className="ws-btn primary" onClick={handleSrtSelection}>Import</button>
        </WsModal.Footer>
      </WsModal>
    </>
  );
}

export default ImportSrt;