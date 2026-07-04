import './Workspace.css';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';

import DeleteEntry from './DeleteEntry';
import ImportSrt from './ImportSrt';
import ExportSrt from './ExportSrt';
import Errorchecking from './Errorchecking';
import ShiftTiming from './ShiftTiming';
import BulkDelete from './BulkDelete';

/**
 * Workspace — single responsive layout for the SRT editor.
 * Desktop: 3-pane grid (Video | Timeline | Properties).
 * Mobile:  stacked, video + timeline first, properties panel follows.
 *
 * Replaces the previous Desktop.js / Mobile.js split — one component,
 * CSS media queries handle the reflow instead of a JS breakpoint check.
 */
function Workspace() {
  const [Entries, setEntries] = useState([]);
  const [Divs, SetDivs] = useState([]);
  const [subIndex, setIndex] = useState(1);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [draft, setDraft] = useState(null); // working copy of the selected entry for the props pane

  const [url, ChangeURL] = useState('');
  const [VideoFile, ChangeVideoFile] = useState('');
  const [currentPosition, setCurrentTime] = useState('00:00:00,000');
  const [endTimeGuess, setEndTimeGuess] = useState('00:00:02,000');
  const [isPlaying, setIsPlaying] = useState(false);

  const [delIndex, setDelIndex] = useState(null);
  const [delShow, setDelShow] = useState(false);

  const [highlightIndices, setHighlight] = useState([]);
  const [projectName, setProjectName] = useState('');

  const playerRef = useRef(null);
  const fileInputRef = useRef(null);
  const rowRefs = useRef({});

  const navigate = useNavigate();

  const [row, setRow] = useState({ startTime: '', endTime: '', Text: '' });

  const [videoConfig, setVideoConfig] = useState({
    file: { tracks: [{ kind: 'subtitles', src: '', srcLang: 'en', default: true }] }
  });

  // ---------------------------------------------------------------
  // Load / persist project
  // ---------------------------------------------------------------
  useEffect(() => {
    const storedProjectName = sessionStorage.getItem('project');
    if (storedProjectName == null) {
      navigate('/');
      return;
    }
    setProjectName(storedProjectName);

    const savedEntries = localStorage.getItem(`${storedProjectName}Entries`);
    const savedDivs = localStorage.getItem(`${storedProjectName}Divs`);
    const VideoURL = localStorage.getItem(`${storedProjectName}video`);
    const videoFile = localStorage.getItem(`${storedProjectName}videofile`);

    ChangeVideoFile(videoFile || '');
    ChangeURL(VideoURL || '');

    if (savedEntries && savedDivs) {
      const parsedEntries = JSON.parse(savedEntries);
      setEntries(parsedEntries);
      SetDivs(JSON.parse(savedDivs));
      setIndex(parsedEntries.length + 1);
    }
  }, [navigate]);

  useEffect(() => {
    if (Entries.length > 0 && Divs.length > 0) {
      localStorage.setItem(`${projectName}Entries`, JSON.stringify(Entries));
      localStorage.setItem(`${projectName}Divs`, JSON.stringify(Divs));

      const vtt = convertSrtToWebVtt(Entries);
      const blob = new Blob([vtt], { type: 'text/vtt' });
      const objectURL = URL.createObjectURL(blob);

      if (playerRef.current) {
        const videoElement = playerRef.current.getInternalPlayer();
        if (videoElement) {
          videoElement.querySelectorAll('track').forEach(t => t.remove());
          const track = document.createElement('track');
          track.kind = 'subtitles';
          track.src = objectURL;
          track.srclang = 'en';
          track.label = 'English';
          track.default = true;
          videoElement.appendChild(track);

          requestAnimationFrame(() => {
            Array.from(videoElement.textTracks).forEach(tt => {
              if (tt.kind === 'subtitles' && tt.label === 'English') tt.mode = 'showing';
            });
          });
        }
      }
      return () => URL.revokeObjectURL(objectURL);
    }
  }, [Entries, Divs, projectName]);

  useEffect(() => {
    if (!projectName) return;
    localStorage.setItem(`${projectName}video`, url);
    localStorage.setItem(`${projectName}videofile`, VideoFile);
  }, [url, VideoFile, projectName]);

  const convertSrtToWebVtt = (srtEntries) => {
    let vtt = 'WEBVTT\n\n';
    srtEntries.forEach((entry, index) => {
      const start = entry.startTime.replace(',', '.');
      const end = entry.endTime.replace(',', '.');
      vtt += `${index + 1}\n${start} --> ${end}\n${entry.Text}\n\n`;
    });
    return vtt;
  };

  // ---------------------------------------------------------------
  // Time formatting helpers
  // ---------------------------------------------------------------
  const format = (val) => {
    let numeric = val.replace(/\D/g, '');
    let formatted = '';
    if (numeric.length > 0) {
      formatted = numeric.slice(0, 2);
      if (numeric.length > 2) formatted += ':' + numeric.slice(2, 4);
      if (numeric.length > 4) formatted += ':' + numeric.slice(4, 6);
      if (numeric.length > 6) formatted += ',' + numeric.slice(6, 9);
    }
    return formatted;
  };

  const formatDuration = (seconds) => {
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    const totalSeconds = Math.floor(seconds);
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs},${ms}`;
  };

  const timeToMs = (time) => {
    const [h, m, s] = time.split(':');
    const [secs, ms] = s.split(',');
    return (+h) * 3600000 + (+m) * 60000 + (+secs) * 1000 + (+ms);
  };

  const msToTime = (ms) => {
    ms = Math.max(0, Math.round(ms));
    const h = Math.floor(ms / 3600000).toString().padStart(2, '0');
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const msRem = (ms % 1000).toString().padStart(3, '0');
    return `${h}:${m}:${s},${msRem}`;
  };

  // ---------------------------------------------------------------
  // Video
  // ---------------------------------------------------------------
  const handleFileChange = (e) => {
    if (!e.target.files[0]) return;
    ChangeVideoFile(e.target.files[0]);
    ChangeURL(URL.createObjectURL(e.target.files[0]));
  };

  const handleProgress = (state) => {
    setCurrentTime(formatDuration(state.playedSeconds));
    setEndTimeGuess(formatDuration(state.playedSeconds + 2));
  };

  const selectVideo = () => fileInputRef.current.click();

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const captureAsStart = () => setRow(r => ({ ...r, startTime: currentPosition }));
  const captureAsEnd = () => setRow(r => ({ ...r, endTime: currentPosition }));

  // ---------------------------------------------------------------
  // Entry CRUD
  // ---------------------------------------------------------------
  const AddEntries = () => {
    if (row.startTime.length !== 12 || row.endTime.length !== 12) {
      alert('Start time or End time format is invalid.');
      return;
    }
    const newRow = { ...row };
    if (Entries.length === subIndex - 1) {
      SetDivs([...Divs, Entries.length + 1]);
      setEntries([...Entries, newRow]);
      setIndex(subIndex + 1);
    } else {
      const updatedEntries = [...Entries];
      updatedEntries.splice(subIndex - 1, 0, newRow);
      const updatedDivs = [...Divs];
      updatedDivs.splice(subIndex - 1, 0, updatedEntries.length);
      setEntries(updatedEntries);
      SetDivs(updatedDivs);
      setIndex(subIndex + 1);
    }
    setRow({ startTime: '', endTime: '', Text: '' });
  };

  const handleQuickChange = (e) => {
    const { id, value } = e.target;
    if (id === 'startTime' || id === 'endTime') {
      setRow(r => ({ ...r, [id]: format(value) }));
    }
  };

  const selectEntry = (index) => {
    setSelectedIndex(index);
    setDraft({ ...Entries[index] });
  };

  const handleDraftChange = (field, value) => {
    const formatted = field === 'Text' ? value : format(value);
    setDraft(d => ({ ...d, [field]: formatted }));
  };

  const saveDraft = () => {
    if (selectedIndex === null || !draft) return;
    const updated = [...Entries];
    updated[selectedIndex] = { startTime: draft.startTime, endTime: draft.endTime, Text: draft.Text };
    setEntries(updated);
  };

  const showDeleteConfirm = (index) => {
    setDelIndex(index);
    setDelShow(true);
  };

  const handleDelete = () => {
    setEntries(Entries.filter((_, i) => i !== delIndex));
    SetDivs(Divs.filter((_, i) => i !== delIndex));
    setHighlight(highlightIndices.filter(i => i !== delIndex));
    if (selectedIndex === delIndex) { setSelectedIndex(null); setDraft(null); }
    setDelShow(false);
  };

  const mergeWithNext = (index) => {
    if (index >= Entries.length - 1) return;
    const a = Entries[index];
    const b = Entries[index + 1];
    const merged = { startTime: a.startTime, endTime: b.endTime, Text: `${a.Text} ${b.Text}`.trim() };
    const updated = [...Entries];
    updated.splice(index, 2, merged);
    setEntries(updated);
    SetDivs(Divs.slice(0, -1));
    if (selectedIndex !== null) selectEntry(Math.min(index, updated.length - 1));
  };

  const splitAtCurrentPosition = (index) => {
    const entry = Entries[index];
    if (!entry) return;
    const startMs = timeToMs(entry.startTime);
    const endMs = timeToMs(entry.endTime);
    const posMs = timeToMs(currentPosition);
    if (posMs <= startMs || posMs >= endMs) {
      alert('Move the playhead inside the selected cue to split it there.');
      return;
    }
    const words = entry.Text.split(' ');
    const mid = Math.max(1, Math.round(words.length / 2));
    const first = { startTime: entry.startTime, endTime: msToTime(posMs), Text: words.slice(0, mid).join(' ') };
    const second = { startTime: msToTime(posMs), endTime: entry.endTime, Text: words.slice(mid).join(' ') };
    const updated = [...Entries];
    updated.splice(index, 1, first, second);
    setEntries(updated);
    SetDivs([...Divs, Divs.length + 1]);
  };

  // ---------------------------------------------------------------
  // Keyboard priority
  // ---------------------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';

      if (e.code === 'Space' && !isTyping) {
        e.preventDefault();
        togglePlay();
        return;
      }
      if (isTyping) return; // let Tab / typing behave natively inside fields

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev === null ? 0 : Math.min(prev + 1, Entries.length - 1);
          if (Entries[next]) setDraft({ ...Entries[next] });
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => {
          const next = prev === null ? 0 : Math.max(prev - 1, 0);
          if (Entries[next]) setDraft({ ...Entries[next] });
          rowRefs.current[next]?.scrollIntoView({ block: 'nearest' });
          return next;
        });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIndex !== null) { e.preventDefault(); showDeleteConfirm(selectedIndex); }
      } else if (e.key.toLowerCase() === 'm') {
        if (selectedIndex !== null) mergeWithNext(selectedIndex);
      } else if (e.key.toLowerCase() === 's') {
        if (selectedIndex !== null) splitAtCurrentPosition(selectedIndex);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [Entries, Divs, selectedIndex, currentPosition, togglePlay]);

  // ---------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------
  const rowCount = Divs.length;
  const hasVideo = Boolean(url);

  return (
    <div className="workspace">
      <div className="ws-toolbar">
        <span className="ws-logo">[SRT Creator]</span>

        <div className="ws-group">
          <ExportSrt Entries={Entries} />
          <ImportSrt setEntries={setEntries} SetDivs={SetDivs} setIndex={setIndex} />
        </div>

        <div className="ws-group">
          <Errorchecking Entries={Entries} setHighlight={setHighlight} />
          <ShiftTiming Entries={Entries} setEntries={setEntries} formatDuration={formatDuration} />
          <BulkDelete Entries={Entries} setEntries={setEntries} Divs={Divs} setDivs={SetDivs} />
        </div>

        <div className="ws-spacer" />

        <button className="ws-btn primary" onClick={selectVideo}>Open video</button>
        <input type="file" hidden ref={fileInputRef} accept="video/*" onChange={handleFileChange} />
      </div>

      <div className="ws-main">
        {/* ---------------- VIDEO PANE ---------------- */}
        <section className="ws-pane video">
          <div className="ws-pane-header">
            <span>Preview</span>
            <span>{rowCount} cues</span>
          </div>

          <div className="ws-video-wrap">
            {hasVideo ? (
              <ReactPlayer
                ref={playerRef}
                className="react-player"
                url={url}
                width="100%"
                height="240px"
                controls
                progressInterval={100}
                onProgress={handleProgress}
                config={videoConfig}
                playing={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : (
              <div className="ws-empty-video">
                <div>No video loaded</div>
                <button className="ws-btn primary" onClick={selectVideo}>Open a video</button>
              </div>
            )}
          </div>

          <div className="ws-video-meta">
            <span>Position</span>
            <span className="tc">{currentPosition}</span>
            <span className="ws-spacer" />
            <button className="ws-btn" onClick={togglePlay}>
              {isPlaying ? 'Pause' : 'Play'} <span className="ws-kbd">Space</span>
            </button>
          </div>

          <div className="ws-quick-add">
            <div className="ws-field">
              <label>Start</label>
              <input id="startTime" className="ws-input" value={row.startTime}
                     onChange={handleQuickChange} placeholder="00:00:00,000" />
            </div>
            <div className="ws-field">
              <label>End</label>
              <input id="endTime" className="ws-input" value={row.endTime}
                     onChange={handleQuickChange} placeholder="00:00:00,000" />
            </div>
            <div className="ws-field" style={{ gridColumn: '1 / -1' }}>
              <label>Text</label>
              <input className="ws-input text" value={row.Text}
                     onChange={(e) => setRow(r => ({ ...r, Text: e.target.value }))}
                     placeholder="Subtitle text" />
            </div>
            <button className="ws-btn" onClick={captureAsStart}>Set start = {currentPosition.slice(0, 8)}</button>
            <button className="ws-btn" onClick={captureAsEnd}>Set end = {endTimeGuess.slice(0, 8)}</button>
            <button className="ws-btn primary" onClick={AddEntries}>Add cue</button>
          </div>
        </section>

        {/* ---------------- TIMELINE PANE ---------------- */}
        <section className="ws-pane timeline">
          <div className="ws-pane-header">
            <span>Timeline</span>
            <span>{selectedIndex !== null ? `Selected #${selectedIndex + 1}` : 'None selected'}</span>
          </div>
          <div className="ws-pane-body">
            {rowCount === 0 ? (
              <div className="ws-timeline-empty">No cues yet. Add one from the panel on the left, or import an .srt file.</div>
            ) : (
              <div className="ws-timeline-list">
                {Divs.map((div, index) => {
                  const entry = Entries[index];
                  if (!entry) return null;
                  const isActive = selectedIndex === index;
                  const isError = highlightIndices.includes(index);
                  return (
                    <div
                      key={div}
                      ref={(el) => (rowRefs.current[index] = el)}
                      className={`ws-row${isActive ? ' active' : ''}${isError ? ' error' : ''}`}
                      onClick={() => selectEntry(index)}
                      tabIndex={-1}
                    >
                      <span className="idx">{index + 1}</span>
                      <span className="tc">{entry.startTime}</span>
                      <span className="tc">{entry.endTime}</span>
                      <span className="txt">{entry.Text}</span>
                      <span className="row-actions">
                        <button className="ws-icon-btn" title="Merge with next (M)"
                                onClick={(e) => { e.stopPropagation(); mergeWithNext(index); }}>⤓</button>
                        <button className="ws-icon-btn danger" title="Delete (Del)"
                                onClick={(e) => { e.stopPropagation(); showDeleteConfirm(index); }}>✕</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="ws-hotkey-bar">
            <span><b>Space</b> play/pause</span>
            <span><b>↑ ↓</b> select cue</span>
            <span><b>Tab</b> move between fields</span>
            <span><b>M</b> merge with next</span>
            <span><b>S</b> split at playhead</span>
            <span><b>Del</b> delete selected</span>
          </div>
        </section>

        {/* ---------------- PROPERTIES PANE ---------------- */}
        <section className="ws-pane props">
          <div className="ws-pane-header">
            <span>Properties</span>
          </div>
          <div className="ws-pane-body ws-props-body">
            {draft && selectedIndex !== null ? (
              <>
                <div className="ws-props-row">
                  <div className="ws-props-field">
                    <label>Start</label>
                    <input className="ws-input" value={draft.startTime}
                           onChange={(e) => handleDraftChange('startTime', e.target.value)}
                           onBlur={saveDraft} />
                  </div>
                  <div className="ws-props-field">
                    <label>End</label>
                    <input className="ws-input" value={draft.endTime}
                           onChange={(e) => handleDraftChange('endTime', e.target.value)}
                           onBlur={saveDraft} />
                  </div>
                </div>
                <div className="ws-props-field">
                  <label>Text</label>
                  <textarea className="ws-input" value={draft.Text}
                            onChange={(e) => handleDraftChange('Text', e.target.value)}
                            onBlur={saveDraft} />
                </div>
                <div className="ws-props-actions">
                  <button className="ws-btn primary" onClick={saveDraft}>Save changes</button>
                  <button className="ws-btn danger" onClick={() => showDeleteConfirm(selectedIndex)}>Delete cue</button>
                </div>
                <div className="ws-props-meta">
                  Cue #{selectedIndex + 1} of {Entries.length}
                </div>
              </>
            ) : (
              <div className="ws-props-empty">Select a cue in the timeline to edit its timing and text here.</div>
            )}
          </div>
        </section>
      </div>

      <DeleteEntry
        showDelete={delShow}
        handleClose={() => setDelShow(false)}
        handleDelete={handleDelete}
      />
    </div>
  );
}

export default Workspace;