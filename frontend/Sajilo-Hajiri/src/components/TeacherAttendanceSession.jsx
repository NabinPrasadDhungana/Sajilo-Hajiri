import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

function TeacherAttendanceSession({ classSubjectId, students, sessionTitle }) {
  const [sessionId, setSessionId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isManualAllowed, setIsManualAllowed] = useState(true);
  const [recognized, setRecognized] = useState([]);
  const [mode, setMode] = useState('entry');
  const webcamRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showManual, setShowManual] = useState(false);

  const getCSRFToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';
  };

  const handleStartSession = () => setShowDialog(true);

  const createSession = async () => {
    const resCheck = await fetch(`/api/attendance/session/open/?class_subject_id=${classSubjectId}`);
    if (resCheck.ok) {
      const data = await resCheck.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setShowDialog(false);
        return;
      }
    }
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
      setAlert({ type: 'success', message: 'Session created successfully!' });
    } else {
      setAlert({ type: 'danger', message: data.error || 'Failed to create session' });
    }
  };

  const captureAndRecognize = async () => {
    setIsCapturing(true);
    let images = [];
    for (let i = 0; i < 5; i++) {
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
    setAlert({ type: 'info', message: 'Recognition complete.' });
  };

  const markManual = async (rollNumber, mode) => {
    console.log(`Marking student with roll number ${rollNumber} as ${mode} in session ${sessionId}`);
    const res = await fetch(`/api/attendance/manual/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken(),
      },
      body: JSON.stringify({ session_id: sessionId, roll_number: rollNumber, mode }),
      credentials: 'include',
    });
    const data = await res.json();
    setAlert({ type: res.ok ? 'success' : 'danger', message: data.message || data.error });
  };

  return (
    <div className="container my-5">
      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Modal for session creation */}
      {showDialog && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Create Attendance Session</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDialog(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure to create attendance session for this class?</p>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isManualAllowed}
                    id="manualAllowed"
                    onChange={e => setIsManualAllowed(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="manualAllowed">
                    Allow manual attendance
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={createSession}>
                  <i className="bi bi-check-circle me-1"></i>Yes, Create
                </button>
                <button className="btn btn-secondary" onClick={() => setShowDialog(false)}>
                  <i className="bi bi-x-circle me-1"></i>Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {!sessionId && (
        <div className="d-flex justify-content-center">
          <button className="btn btn-primary btn-lg px-4 py-2 shadow" onClick={handleStartSession}>
            <i className="bi bi-plus-circle me-2"></i>
            Create Attendance Session
          </button>
        </div>
      )}

      {sessionId && (
        <div className="card shadow mx-auto" style={{ maxWidth: 650 }}>
          <div className="card-header bg-light border-bottom-0 mb-2">
            <h4 className="mb-0 text-center text-primary">
              <i className="bi bi-calendar-check me-2"></i>
              Attendance Session #{sessionId}
            </h4>
          </div>
          <div className="card-body">
            <div className="mb-3 text-center">
              <label className="form-label me-2 fw-semibold">Mode:</label>
              <select
                className="form-select w-auto d-inline"
                value={mode}
                onChange={e => setMode(e.target.value)}
              >
                <option value="entry">Entry</option>
                <option value="exit">Exit</option>
              </select>
            </div>
            <div className="d-flex flex-column align-items-center mb-4">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                className="border rounded shadow-sm"
              />
              <button
                className="btn btn-info mt-3 px-4"
                onClick={captureAndRecognize}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Recognizing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-bounding-box me-2"></i>
                    Recognize Students
                  </>
                )}
              </button>
            </div>
            <h5 className="mt-4 mb-2">
              <i className="bi bi-people-fill me-2"></i>
              Recognized Students
            </h5>
            <ul className="list-group mb-4">
              {recognized.length > 0 ? recognized.map(r => (
                <li className="list-group-item d-flex align-items-center" key={r.student_id}>
                  <span className="fw-semibold me-2">{r.name}</span>
                  <span className={`badge bg-${r.mode === 'entry' ? 'primary' : 'warning'} text-dark me-2 text-capitalize`}>
                    {r.mode}
                  </span>
                  <span className={`badge bg-${r.status === 'present' ? 'success' : 'secondary'} text-capitalize`}>
                    {r.status}
                  </span>
                </li>
              )) : (
                <li className="list-group-item text-muted">No students recognized yet.</li>
              )}
            </ul>
            <div>
              <button
                className="btn btn-outline-secondary mb-2"
                type="button"
                onClick={() => setShowManual(v => !v)}
                aria-expanded={showManual}
                aria-controls="manualAttendance"
              >
                <i className={`bi ${showManual ? 'bi-caret-down-fill' : 'bi-caret-right-fill'} me-2`}></i>
                Manual Attendance
              </button>
              <div className={showManual ? 'collapse show' : 'collapse'} id="manualAttendance">
                <ul className="list-group">
                  {console.log('Students:', students)}
                  {Array.isArray(students) && students.length > 0 ? (
                    students.map(s => (
                      <li className="list-group-item d-flex justify-content-between align-items-center" key={s.roll_number}>
                        <span>{s.name} <span className="text-muted">({s.roll_number})</span></span>
                        <span>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => markManual(s.roll_number, 'entry')}
                          >
                            <i className="bi bi-box-arrow-in-right me-1"></i>
                            Entry
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => markManual(s.roll_number, 'exit')}
                          >
                            <i className="bi bi-box-arrow-right me-1"></i>
                            Exit
                          </button>
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item text-muted">No students found.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherAttendanceSession;