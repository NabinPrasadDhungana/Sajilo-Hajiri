// components/NotificationBell.jsx
import React, { useState } from "react";
import { FaBell } from "react-icons/fa";

export default function NotificationBell({ notifications }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="position-relative">
      <button
        className="btn btn-light"
        onClick={() => setOpen(!open)}
        style={{ borderRadius: "50%" }}
      >
        <FaBell />
        {notifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {notifications.length}
          </span>
        )}
      </button>
      {open && (
        <div
          className="dropdown-menu show shadow"
          style={{
            right: 0,
            left: "auto",
            position: "absolute",
            minWidth: "250px",
            zIndex: 9999,
          }}
        >
          <h6 className="dropdown-header">🔔 Notifications</h6>
          <div className="dropdown-divider" />
          {notifications.length === 0 ? (
            <div className="dropdown-item text-muted">No notifications yet</div>
          ) : (
            notifications.map((note, i) => (
              <div key={i} className="dropdown-item small">{note}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
