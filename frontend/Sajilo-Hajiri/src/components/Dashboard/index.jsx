import React, { useState, useEffect } from "react";
import TeacherAttendanceSession from '../TeacherAttendanceSession';
import { useNavigate } from "react-router-dom";
import AdminPanel from "../AdminPanel";
import { authFetch } from "../../Helper/Csrf_token";
import Register from "../Register";
import StudentRecords from '../StudentRecords';
import { CSVLink } from "react-csv";

export default function Dashboard({ user }) {
  // All hooks must be declared at the top level, never inside conditionals
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSession, setActiveSession] = useState(null); // For teacher attendance session
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const PAGE_SIZE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin"); // prevent further dashboard logic
    }
  }, [user, navigate]);


  const getCSRFToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';
  };

  // Redirect if user is not defined
  useEffect(() => {
    if (!user) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setData({ user: JSON.parse(savedUser) });
      } else {
        navigate('/login');
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const csrfToken = getCSRFToken();
        if (!csrfToken) throw new Error("CSRF token not found");

        const response = await authFetch("/api/dashboard/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 403) navigate('/login');
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="main-content container mt-5"><p>Loading dashboard...</p></div>;
  if (error) return <div className="main-content container mt-5 alert alert-danger">Error: {error}</div>;
  if (!data) return <div className="main-content container mt-5"><p>No dashboard data found.</p></div>;
  if (!user) return null;

  if (data.user.approval_status === 'pending') {
    return (
      <div className="main-content container mt-5">
        <div className="alert alert-warning">
          Your account is <strong>{data.user.approval_status}</strong>. Please update your info below.
        </div>
        {data.user.feedback && (
          <div className="alert alert-info">
            <strong>Admin Feedback:</strong> {data.user.feedback}
          </div>
        )}
        <Register editMode={true} />
      </div>
    );
  }

  if (user.role === "admin") {
    const csrfToken = getCSRFToken();
    return (
      <AdminPanel
        stats={data.stats}
        users={data.stats?.pending_users || []}
        approveUser={async (email) => {
          try {
            const response = await authFetch("/api/admin/approve-user/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify({ email, action: "approve" }),
            });
            if (!response.ok) throw new Error("Approval failed");
            alert("✅ User approved successfully!");
          } catch (err) {
            console.error("Approval error:", err);
            alert("❌ Failed to approve user.");
          }
        }}
        unapproveUser={async (email) => {
          try {
            const response = await authFetch("/api/admin/unapprove-user/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify({ email, action: "unapprove" }),
            });
            if (!response.ok) throw new Error("Unapproval failed");
            alert("❌ User unapproved successfully!");
          } catch (err) {
            console.error("Unapproval error:", err);
            alert("⚠️ Failed to unapprove user.");
          }
        }}
        sendFeedback={async (email, feedback) => {
          try {
            const response = await authFetch("/api/admin/send-feedback/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify({ email, feedback }),
            });
            if (!response.ok) throw new Error("Feedback sending failed");
            alert("📩 Feedback sent successfully!");
          } catch (err) {
            console.error("Feedback error:", err);
            alert("❗ Failed to send feedback.");
          }
        }}
      />
    );
  }

  // Prepare student dashboard variables
  let student = null, summaryBySubject = {}, sortedSubjects = [], totalPages = 1, startIdx = 0, endIdx = 0, pagedAttendance = [], subjectOptions = [];

  if (user && user.role === "student" && data && data.student_data) {
    student = data.student_data;
    // Attendance summary by subject
    const getAttendanceSummaryBySubject = attendance => {
      const summary = {};
      attendance.forEach(a => {
        const subj = a.subject || 'Unknown';
        if (!summary[subj]) summary[subj] = { present: 0, absent: 0, total: 0 };
        if (a.entry_status === 'present' || a.entry_status === 'manual-present') {
          summary[subj].present += 1;
        } else {
          summary[subj].absent += 1;
        }
        summary[subj].total += 1;
      });
      return summary;
    };
    summaryBySubject = getAttendanceSummaryBySubject(student.attendance || []);
    sortedSubjects = Object.keys(summaryBySubject).sort();

    // Build subject options from attendance records for exact match
    const subjectNames = Array.from(new Set((student.attendance || []).map(r => r.subject_name).filter(Boolean)));
    subjectOptions = subjectNames.map(name => ({ value: name, label: name })) || [];

    let filteredAttendance = (student.attendance || []).filter(record => {
      let match = true;
      if (filterSubject && record.subject_name && record.subject_name.trim().toLowerCase() !== filterSubject.trim().toLowerCase()) match = false;
      if (filterDate && record.date !== filterDate) match = false;
      if (filterStatus && record.entry_status !== filterStatus && record.exit_status !== filterStatus) match = false;
      if (searchText && !(
        (record.subject_name && record.subject_name.toLowerCase().includes(searchText.trim().toLowerCase())) ||
        (record.entry_status && record.entry_status.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.exit_status && record.exit_status.toLowerCase().includes(searchText.toLowerCase())) ||
        (record.date && record.date.includes(searchText))
      )) match = false;
      return match;
    });

    totalPages = Math.ceil(filteredAttendance.length / PAGE_SIZE) || 1;
    startIdx = (currentPage - 1) * PAGE_SIZE;
    endIdx = startIdx + PAGE_SIZE;
    pagedAttendance = filteredAttendance.slice(startIdx, endIdx);
  }
  if (user.role === "student") {
    if (!student) {
      return <div className="main-content container  alert alert-warning">⚠️ You are not enrolled in any class yet.</div>;
    }
    // Status options for filter dropdown
    const statusOptions = [
      { value: '', label: 'All' },
      { value: 'present', label: 'Present' },
      { value: 'absent', label: 'Absent' },
      { value: 'manual-present', label: 'Manual Present' },
      { value: 'manual-exit', label: 'Manual Exit' },
    ];
    return (
      <div className="main-content container ">
        <h2 className="mb-4">Welcome, {user.name || user.username} 👨‍🎓</h2>
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">📚 Class: <span className="text-primary">{student.class}</span></h5>
          </div>
        </div>
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">📘 Subjects:</h5>
            {student.subjects?.length > 0 ? (
              <ul className="list-group list-group-flush">
                {student.subjects.map((subj) => (
                  <li key={subj.id} className="list-group-item">
                    {subj.name} <small className="text-muted">({subj.code})</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No subjects assigned.</p>
            )}
          </div>
        </div>
        <div className="card shadow-sm mb-4" id="records">
          <div className="card-body">
            <h5 className="card-title">📝 Attendance Summary by Subject:</h5>
            {sortedSubjects.length === 0 ? (
              <span className="text-muted">No attendance records found.</span>
            ) : (
              <ul className="list-unstyled mb-0">
                {sortedSubjects.map(subj => {
                  const stats = summaryBySubject[subj];
                  const percent = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
                  let color = 'secondary';
                  if (percent >= 75) color = 'success';
                  else if (percent >= 50) color = 'warning';
                  else color = 'danger';
                  return (
                    <li key={subj}>
                      <span className="fw-bold">{subj}:</span>
                      <span className="badge bg-success ms-2">Present: {stats.present}</span>
                      <span className="badge bg-danger ms-2">Absent: {stats.absent}</span>
                      <span className={`badge bg-${color} ms-2`} title={`Attendance: ${percent}%`}>{percent}%</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title">🔍 Filter & Search Attendance Records:</h5>
            <div className="row mb-3">
              <div className="col-md-4 mb-2">
                <select className="form-select" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                  <option value="">All Subjects</option>
                  {subjectOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4 mb-2">
                <input type="date" className="form-control" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
              </div>
              <div className="col-md-4 mb-2">
                <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-12 mb-2">
                <input type="text" className="form-control" placeholder="Search by subject, status, date..." value={searchText} onChange={e => setSearchText(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">📝 Attendance Records:</h5>
             {pagedAttendance.length > 0 && (
    <CSVLink
      data={pagedAttendance.map(rec => ({
        Date: rec.date,
        Subject: rec.subject_name,
        "Entry Status": rec.entry_status,
        "Exit Status": rec.exit_status
      }))}
      filename={`attendance-${user.username || user.name}.csv`}
      className="btn btn-outline-success btn-sm"
    >
      ⬇️ Download CSV
    </CSVLink>
  )}
            {(pagedAttendance.length > 0) ? (
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Entry Status</th>
                      <th>Exit Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAttendance.map((record) => (
                      <tr key={record.id}>
                        <td>{record.date}</td>
                        <td>{record.subject_name}</td>
                        <td>
                          <span className={`badge bg-${record.entry_status === 'present' ? 'success' : record.entry_status === 'manual-present' ? 'info' : 'danger'}`}>{record.entry_status}</span>
                        </td>
                        <td>
                          <span className={`badge bg-${record.exit_status === 'present' ? 'success' : record.exit_status === 'manual-exit' ? 'info' : 'danger'}`}>{record.exit_status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div>
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >Prev</button>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >Next</button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted">No attendance records found.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user.role === "teacher") {
    const teacher = data.teacher_data;
    if (!teacher || teacher.teaching.length === 0) {
      return <div className="main-content container  alert alert-info">📘 You are not assigned to teach any classes yet.</div>;
    }

    // Build subject options for filter
    const subjectOptions = teacher.teaching.map(t => ({ value: t.id, label: `${t.class} - ${t.subject}` }));
    const filtersConfig = [
      { name: 'subject_id', label: 'Subject', type: 'select', options: subjectOptions },
      { name: 'date', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'text' },
      { name: 'name', label: 'Student Name', type: 'text' },
      { name: 'roll_number', label: 'Roll Number', type: 'text' },
    ];

    return (
      <div className="main-content container " id="attendance">
        <h2 className="mb-4">Welcome, {user.name || user.username} 👨‍🏫</h2>
        {teacher.teaching.map((assignment, index) => (
          <div className="card mb-4 shadow-sm" key={index}>
            <div className="card-body">
              <h5 className="card-title">
                Class: <span className="text-primary">{assignment.class}</span> | Subject: <strong>{assignment.subject}</strong>
              </h5>
              <button
                className="btn btn-success mb-2"
                onClick={() => setActiveSession({
                  classSubjectId: assignment.id, // Always use ClassSubject id
                  sessionTitle: `${assignment.subject} - ${new Date().toLocaleDateString()}`
                })}
              >
                Start Attendance Session
              </button>
              {activeSession && activeSession.classSubjectId === assignment.id && (
                <div className="mt-3">
                  <TeacherAttendanceSession
                    classSubjectId={activeSession.classSubjectId}
                    sessionTitle={activeSession.sessionTitle}
                    students={assignment.students}
                  />
                  <button className="btn btn-link mt-2" onClick={() => setActiveSession(null)}>Close Attendance Session</button>
                </div>
              )}
              <h6 className="mt-3">👨‍🎓 Students Enrolled:</h6>
              {assignment.students?.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {assignment.students.map((student, idx) => (
                    <li key={idx} className="list-group-item d-flex align-items-center">
                      <img
                        src={student.avatar ? `http://localhost:8000${student.avatar}` : "/default-avatar.png"}
                        alt="avatar"
                        className="rounded-circle me-2"
                        width="35"
                        height="35"
                      />
                      <div>
                        <strong>{student.name || student.username}</strong><br />
                        <small className="text-muted">{student.email} | Roll: {student.roll_number}</small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No students enrolled yet.</p>
              )}
            </div>
          </div>
        ))}
        <div className="card my-4" id="records">
          <div className="card-header bg-info text-white">
            <h5 className="mb-0">Student Records for Your Subjects</h5>
          </div>
          <div className="card-body">
            <StudentRecords apiUrl="/api/teacher/student-records/" filtersConfig={filtersConfig} title="Teacher: Student Records" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
