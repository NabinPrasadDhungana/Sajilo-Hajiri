import React, { useState } from "react";

const AdminPanel = ({ users, approveUser, unapproveUser, sendFeedback }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);

  const handleSendFeedback = () => {
    if (selectedEmail && feedbackText.trim() !== "") {
      sendFeedback(selectedEmail, feedbackText.trim());
      setFeedbackText("");
      setSelectedEmail(null);
      alert("Feedback sent!");
    } else {
      alert("Please select a user and enter feedback.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Panel - Manage Students & Teachers</h2>
      {users.length === 0 ? (
        <p>No users registered yet.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Notification</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.fullName || "N/A"}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${
                      user.role === "teacher"
                        ? "bg-info text-dark"
                        : "bg-primary"
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>
                  <strong
                    style={{
                      color:
                        user.status === "approved"
                          ? "green"
                          : user.status === "unapproved"
                          ? "red"
                          : "orange",
                    }}
                  >
                    {user.status || "pending"}
                  </strong>
                </td>
                <td>{user.notification || "—"}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    disabled={user.status === "approved"}
                    onClick={() => approveUser(user.email)}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-sm me-2"
                    disabled={user.status === "unapproved"}
                    onClick={() => unapproveUser(user.email)}
                  >
                    Unapprove
                  </button>
                  <button
                    className={`btn btn-primary btn-sm ${
                      selectedEmail === user.email ? "active" : ""
                    }`}
                    onClick={() =>
                      setSelectedEmail(
                        selectedEmail === user.email ? null : user.email
                      )
                    }
                  >
                    {selectedEmail === user.email
                      ? "Cancel Feedback"
                      : "Send Feedback"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Feedback Form */}
      {selectedEmail && (
        <div className="mt-4">
          <h5>
            Send Feedback to:{" "}
            <span className="text-primary">{selectedEmail}</span>
          </h5>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Enter your feedback here..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={handleSendFeedback}>
            Send Feedback
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
