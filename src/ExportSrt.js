import React, { useState } from 'react';
import ExportDialog from './ExportDialog';

function ExportSrt({ Entries }) {
  const [show, setShow] = useState(false);

  const ShowDialog = () => setShow(true);

  const convertToSrt = (entries) => {
    return entries
      .map((entry, index) => {
        const { startTime, endTime, Text } = entry;
        return `${index + 1}\n${startTime} --> ${endTime}\n${Text}\n`;
      })
      .join('\n');
  };

  const saveSrtFile = (entries, filename) => {
    const srtContent = convertToSrt(entries);
    const blob = new Blob([srtContent], { type: 'text/srt' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.srt';
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <button className="ws-btn" onClick={ShowDialog} disabled={Entries.length === 0}>Export SRT</button>
      <ExportDialog show={show} saveSrtFile={saveSrtFile} Entries={Entries} setShow={setShow} />
    </>
  );
}

export default ExportSrt;