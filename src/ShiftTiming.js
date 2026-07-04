import React, { useState } from 'react';
import WsModal from './Modal';

function ShiftTiming({ Entries, setEntries, formatDuration }) {
  const [startSeconds, setStartSeconds] = useState(0);
  const [startMilliseconds, setStartMilliseconds] = useState(0);
  const [endSeconds, setEndSeconds] = useState(0);
  const [endMilliseconds, setEndMilliseconds] = useState(0);
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const showDialog = () => setShow(true);

  function convertToSeconds(timeStr) {
    const [time, ms] = timeStr.split(',');
    const [hours, minutes, seconds] = time.split(':');
    return (
      parseInt(hours, 10) * 3600 +
      parseInt(minutes, 10) * 60 +
      parseFloat(seconds) +
      parseInt(ms, 10) / 1000
    );
  }

  const handleShift = () => {
    const updatedEntries = Entries.map((entry) => {
      const currentStart = convertToSeconds(entry.startTime);
      const currentEnd = convertToSeconds(entry.endTime);

      let totalSecondsStart = +startSeconds + startMilliseconds / 1000;
      let totalSecondsEnd = +endSeconds + endMilliseconds / 1000;

      totalSecondsStart = startSeconds < 0
        ? currentStart - Math.abs(totalSecondsStart)
        : currentStart + totalSecondsStart;

      totalSecondsEnd = endSeconds < 0
        ? currentEnd - Math.abs(totalSecondsEnd)
        : currentEnd + totalSecondsEnd;

      return {
        ...entry,
        startTime: formatDuration(totalSecondsStart),
        endTime: formatDuration(totalSecondsEnd),
      };
    });

    setEntries(updatedEntries);
    handleClose();
  };

  const noChange = !+startSeconds && !+startMilliseconds && !+endSeconds && !+endMilliseconds;

  return (
    <>
      <button className="ws-btn" onClick={showDialog}>Shift timing</button>

      <WsModal show={show} onClose={handleClose} title="Shift timing of all cues">
        <WsModal.Body>
          <div className="ws-form-group">
            <label>Start time offset</label>
            <div className="ws-form-row" style={{ marginBottom: 0 }}>
              <input
                type="number"
                className="ws-input"
                placeholder="Seconds"
                value={startSeconds}
                onChange={(e) => setStartSeconds(e.target.value)}
              />
              <input
                type="number"
                className="ws-input"
                placeholder="Milliseconds"
                value={startMilliseconds}
                onChange={(e) => setStartMilliseconds(e.target.value)}
              />
            </div>
          </div>

          <div className="ws-form-group">
            <label>End time offset</label>
            <div className="ws-form-row" style={{ marginBottom: 0 }}>
              <input
                type="number"
                className="ws-input"
                placeholder="Seconds"
                value={endSeconds}
                onChange={(e) => setEndSeconds(e.target.value)}
              />
              <input
                type="number"
                className="ws-input"
                placeholder="Milliseconds"
                value={endMilliseconds}
                onChange={(e) => setEndMilliseconds(e.target.value)}
              />
            </div>
          </div>

          <div className="ws-form-note">
            This shifts every cue in the timeline, not just the selected one.
            <ul>
              <li>Positive values push times later; negative values pull them earlier.</li>
              <li>Leave a field at 0 to leave that edge unchanged.</li>
            </ul>
          </div>
        </WsModal.Body>
        <WsModal.Footer>
          <button className="ws-btn" onClick={handleClose}>Cancel</button>
          <button className="ws-btn primary" onClick={handleShift} disabled={noChange}>
            Shift {Entries.length} cue{Entries.length === 1 ? '' : 's'}
          </button>
        </WsModal.Footer>
      </WsModal>
    </>
  );
}

export default ShiftTiming;