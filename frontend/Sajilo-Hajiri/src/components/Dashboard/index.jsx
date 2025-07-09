import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../AdminPanel";
import { authFetch } from "../../Helper/Csrf_token";
import Register from "../Register";

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (user.role === "student") {
    const student = data.student_data;
    if (!student) {
      return <div className="main-content container  alert alert-warning">⚠️ You are not enrolled in any class yet.</div>;
    }

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

        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">📝 Recent Attendance Records:</h5>
            {student.attendance?.length > 0 ? (
              <ul className="list-group list-group-flush">
                {student.attendance.map((record) => (
                  <li key={record.id} className="list-group-item">
                    <strong>{record.subject_name}</strong><br />
                    <span className="text-muted">
                      {new Date(record.entry_time).toLocaleString()} — {record.entry_status}
                      {record.exit_time && (
                        <> → {new Date(record.exit_time).toLocaleString()} — {record.exit_status}</>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
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

    return (
      <div className="main-content container ">
        <h2 className="mb-4">Welcome, {user.name || user.username} 👨‍🏫</h2>
        {teacher.teaching.map((assignment, index) => (
          <div className="card mb-4 shadow-sm" key={index}>
            <div className="card-body">
              <h5 className="card-title">
                Class: <span className="text-primary">{assignment.class}</span> | Subject: <strong>{assignment.subject}</strong>
              </h5>
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
      </div>
    );
  }

  return null;
}
