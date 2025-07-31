
import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

function TeacherAttendanceSession({ classSubjectId, students, sessionTitle }) {
  const [sessionId, setSessionId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isManualAllowed, setIsManualAllowed] = useState(true);
  const [recognized, setRecognized] = useState([]);
  const [mode, setMode] = useState('entry'); // 'entry' or 'exit'
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Helper to get CSRF token from cookie
  const getCSRFToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';
  };

  // 1. Show confirmation dialog
  const handleStartSession = () => setShowDialog(true);

  // 2. Create or reuse attendance session
  const createSession = async () => {
    // Try to find an open session for this class/subject first
    const resCheck = await fetch(`/api/attendance/session/open/?class_subject_id=${classSubjectId}`);
    if (resCheck.ok) {
      const data = await resCheck.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setShowDialog(false);
        return;
      }
    }
    // If not found, create a new session
    const res = await fetch(`/api/attendance/session/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({
        class_subject_id: classSubjectId,
        session_title: sessionTitle,
        is_manual_allowed: isManualAllowed,
      }),
      credentials: 'include',
    });
    const data = await res.json();
    if (res.ok) {
      setSessionId(data.session_id);
      setShowDialog(false);
    } else {
      alert(data.error || 'Failed to create session');
    }
  };

  // 4. Capture webcam images and send for recognition
  const captureAndRecognize = async () => {
    setIsCapturing(true);
    let images = [];
    for (let i = 0; i < 5; i++) { // Capture 5 frames
      const imageSrc = webcamRef.current.getScreenshot();
      images.push(imageSrc.replace(/^data:image\/\w+;base64,/, ''));
      await new Promise(r => setTimeout(r, 500));
    }
    const res = await fetch(`/api/attendance/recognize/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({ session_id: sessionId, images, mode }),
      credentials: 'include',
    });
    const data = await res.json();
    setRecognized(data.recognized || []);
    setIsCapturing(false);
  };

  // 5. Manual attendance marking
  const markManual = async (studentId, mode) => {
    const res = await fetch(`/api/attendance/manual/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({ session_id: sessionId, student_id: studentId, mode }),
      credentials: 'include',
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <div>
      {!sessionId && (
        <>
          <button onClick={handleStartSession}>Create Attendance Session</button>
          {showDialog && (
            <div className="dialog">
              <p>Are you sure to create attendance session for this class?</p>
              <label>
                <input type="checkbox" checked={isManualAllowed} onChange={e => setIsManualAllowed(e.target.checked)} />
                Allow manual attendance
              </label>
              <button onClick={createSession}>Yes, Create</button>
              <button onClick={() => setShowDialog(false)}>Cancel</button>
            </div>
          )}
        </>
      )}
      {sessionId && (
        <div>
          <h3>Attendance Session #{sessionId}</h3>
          <div>
            <label>Mode: </label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="entry">Entry</option>
              <option value="exit">Exit</option>
            </select>
          </div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
          />
          <button onClick={captureAndRecognize} disabled={isCapturing}>
            {isCapturing ? 'Recognizing...' : 'Recognize Students'}
          </button>
          <h4>Recognized Students:</h4>
          <ul>
            {recognized.map(r => (
              <li key={r.student_id}>{r.name} ({r.mode}) - {r.status}</li>
            ))}
          </ul>
          <h4>Manual Attendance</h4>
          <ul>
            {Array.isArray(students) && students.length > 0 ? (
              students.map(s => (
                <li key={s.id}>
                  {s.name}
                  <button onClick={() => markManual(s.id, 'entry')}>Manual Entry</button>
                  <button onClick={() => markManual(s.id, 'exit')}>Manual Exit</button>
                </li>
              ))
            ) : (
              <li>No students found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TeacherAttendanceSession;