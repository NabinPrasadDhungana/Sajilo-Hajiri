// components/AdminPanel/AdminPanel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../Helper/Csrf_token";

export default function AdminPanel({ user }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getCSRFToken = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1] || "";
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          authFetch("/api/admin/stats/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
          }),
          authFetch("/api/admin/pending-users/", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": getCSRFToken(),
            },
            credentials: "include",
          }),
        ]);

        if (!statsRes.ok || !usersRes.ok) throw new Error("Failed to fetch admin data.");

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();

        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAdminData();
  }, [user, navigate]);

  const handleAction = async (email, action) => {
    try {
      const response = await authFetch("/api/admin/approve-user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ email, action }),
      });

      if (!response.ok) throw new Error("Action failed");
      alert(`✅ User ${action}d successfully!`);

      // Refresh users
      const usersRes = await authFetch("/api/admin/pending-users/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
      });

      setUsers(await usersRes.json());
    } catch (err) {
      alert(`❌ Failed to ${action} user.`);
    }
  };

  const sendFeedback = async () => {
    try {
      const response = await authFetch("/api/admin/send-feedback/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify({ email: selectedEmail, feedback: feedbackText }),
      });

      if (!response.ok) throw new Error("Feedback sending failed");
      alert("📩 Feedback sent!");

      setFeedbackText("");
      setSelectedEmail(null);
    } catch (err) {
      alert("❌ Failed to send feedback.");
    }
  };

  if (error) {
    return <div className="main-content container mt-5 alert alert-danger">{error}</div>;
  }

  return (
    <div className="main-content container mt-5">
      <h2 className="mb-4">Admin Panel - Manage Users</h2>

      <div className="row mb-4">
        <div className="col"><div className="card bg-light p-3"><h5>Total Users</h5><p>{stats.total_users}</p></div></div>
        <div className="col"><div className="card bg-light p-3"><h5>Total Students</h5><p>{stats.total_students}</p></div></div>
        <div className="col"><div className="card bg-light p-3"><h5>Total Teachers</h5><p>{stats.total_teachers}</p></div></div>
        <div className="col"><div className="card bg-light p-3"><h5>Total Pending</h5><p>{users.length}</p></div></div>
      </div>

      {users.length === 0 ? (
        <p>No pending users.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Name</th><th>Email</th><th>Image URL</th><th>Role</th>
              <th>Roll Number</th><th>Status</th><th>Feedback</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name || "N/A"}</td>
                <td>{user.email}</td>
                <td>{user.avatar}</td>
                <td><span className={`badge ${user.role === "teacher" ? "bg-info text-dark" : "bg-primary"}`}>{user.role}</span></td>
                <td>{user.roll_number}</td>
                <td><strong style={{ color: user.approval_status === "approved" ? "green" : user.approval_status === "unapproved" ? "red" : "orange" }}>{user.approval_status || "pending"}</strong></td>
                <td>{user.feedback || "—"}</td>
                <td>
                  <button className="btn btn-success btn-sm me-2" disabled={user.approval_status === "approved"} onClick={() => handleAction(user.email, "approve")}>Approve</button>
                  <button className="btn btn-danger btn-sm me-2" disabled={user.approval_status === "unapproved"} onClick={() => handleAction(user.email, "unapprove")}>Unapprove</button>
                  <button className={`btn btn-primary btn-sm ${selectedEmail === user.email ? "active" : ""}`} onClick={() => setSelectedEmail(selectedEmail === user.email ? null : user.email)}>
                    {selectedEmail === user.email ? "Cancel Feedback" : "Send Feedback"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedEmail && (
        <div className="mt-4">
          <h5>Send Feedback to: <span className="text-primary">{selectedEmail}</span></h5>
          <textarea className="form-control" rows="4" placeholder="Enter your feedback here..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
          <button className="btn btn-primary mt-2" onClick={sendFeedback}>Send Feedback</button>
        </div>
      )}
    </div>
  );
}
