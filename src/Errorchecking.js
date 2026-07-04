import React, { useState } from 'react';
import WsModal from './Modal';

function Errorchecking({ Entries, setHighlight }) {
  const [checking, setChecking] = useState(false);
  const [errors, setErrors] = useState([]);
  const [show, setShow] = useState(false);

  const checkSubtitleErrors = () => {
    setChecking(true);
    const foundErrors = [];
    const highlightIndices = [];

    for (let i = 0; i < Entries.length - 1; i++) {
      const currentSubtitle = Entries[i];
      const nextSubtitle = Entries[i + 1];

      const currentStart = timeToMilliseconds(currentSubtitle.startTime);
      const currentEnd = timeToMilliseconds(currentSubtitle.endTime);
      const nextStart = timeToMilliseconds(nextSubtitle.startTime);

      if (currentEnd > nextStart) {
        foundErrors.push({
          type: 'Overlap',
          message: `Overlap between cue ${i + 1} and cue ${i + 2}`,
          subtitles: [currentSubtitle, nextSubtitle],
        });
        highlightIndices.push(i, i + 1);
      }

      if (currentStart > currentEnd) {
        foundErrors.push({
          type: 'Incorrect sequence',
          message: `Start time of cue ${i + 1} is after its end time`,
          subtitles: [currentSubtitle],
        });
        highlightIndices.push(i);
      }

      if (currentStart > nextStart) {
        foundErrors.push({
          type: 'Incorrect sequence',
          message: `Cue ${i + 2} starts before cue ${i + 1} ends`,
          subtitles: [currentSubtitle, nextSubtitle],
        });
        highlightIndices.push(i, i + 1);
      }
    }

    setErrors(foundErrors);
    setHighlight(highlightIndices);
    setChecking(false);
    setShow(true);
  };

  const timeToMilliseconds = (time) => {
    const [hours, minutes, seconds] = time.split(':');
    const [secs, ms] = seconds.split(',');
    return (+hours) * 3600000 + (+minutes) * 60000 + (+secs) * 1000 + (+ms);
  };

  const handleCloseExportModal = () => {
    setShow(false);
  };

  return (
    <>
      <button onClick={checkSubtitleErrors} className="ws-btn" disabled={checking}>
        {checking ? 'Checking…' : 'Check errors'}
      </button>

      <WsModal
        show={show}
        onClose={handleCloseExportModal}
        title={`${errors.length} ${errors.length === 1 ? 'issue' : 'issues'} found`}
        tone={errors.length ? 'danger' : undefined}
        wide
      >
        <WsModal.Body>
          {errors.length === 0 ? (
            <div className="ws-empty-state">No timing issues found — every cue is in order.</div>
          ) : (
            <ul className="ws-issue-list">
              {errors.map((error, index) => (
                <li key={index} className="ws-issue">
                  <div className="type">{error.type}</div>
                  <div className="msg">{error.message}</div>
                  <ul className="subs">
                    {error.subtitles.map((subtitle, idx) => (
                      <li key={idx}>{subtitle.startTime} → {subtitle.endTime}: {subtitle.Text}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </WsModal.Body>
        <WsModal.Footer>
          <button className="ws-btn primary" onClick={handleCloseExportModal}>Close</button>
        </WsModal.Footer>
      </WsModal>
    </>
  );
}

export default Errorchecking;