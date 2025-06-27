// components/Dashboard/index.jsx
import React, { useState, useEffect } from "react";
import AdminPanel from "../AdminPanel";


export default function Dashboard({ user, token }) {
  const [data, setData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, [token]);

  // Dummy handlers – replace with real API calls if needed
  const handleApproveUser = (email) => {
    console.log("Approve:", email);
  };
  const handleUnapproveUser = (email) => {
    console.log("Unapprove:", email);
  };
  const handleSendFeedback = (email, feedback) => {
    console.log("Feedback:", email, feedback);
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>No dashboard data found.</p>;

  // === Admin View ===
  if (user.role === "admin") {
    return (
      <AdminPanel
        stats={data.stats}
        users={data.stats.pending_users}
        approveUser={handleApproveUser}
        unapproveUser={handleUnapproveUser}
        sendFeedback={handleSendFeedback}
      />
    );
  }

  // === Teacher View ===
  if (user.role === "teacher") {
    const classes = data.teaching;
    const handleSelect = (cls) => {
      setSelectedClass(cls.class);
      setSelectedSubject(cls.subject);
      setSelectedStudents(cls.students);
    };

    return (
      <div className="dashboard container mt-4">
        <h2>Teacher Dashboard</h2>
        <select className="form-select mb-3" onChange={(e) => handleSelect(classes[e.target.value])}>
          <option>Select Subject/Class</option>
          {classes.map((item, index) => (
            <option key={index} value={index}>
              {item.subject} ({item.class})
            </option>
          ))}
        </select>

        {selectedStudents.length > 0 && (
          <>
            <h4>{selectedSubject} - {selectedClass}</h4>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudents.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.roll_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  }

  // === Student View ===
  if (user.role === "student") {
    const { attendance, class: className } = data;

    return (
      <div className="dashboard container mt-4">
        <h2>Student Dashboard</h2>
        <div className="card p-3 mb-3">Class: {className}</div>
        <h4>Recent Attendance</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Date</th>
              <th>Subject</th>
              <th>Arrival</th>
              <th>Departure</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.date).toLocaleDateString()}</td>
                <td>{entry.subject_name}</td>
                <td>{entry.entry_time ? new Date(entry.entry_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                <td>{entry.exit_time ? new Date(entry.exit_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div>No role matched.</div>;
}
