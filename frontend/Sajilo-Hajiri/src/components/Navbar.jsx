// Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ currentUser, handleLogout, notifications }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg shadow-sm fixed-top bg-white">
      <div className="container-fluid d-flex justify-content-between align-items-center px-4">
        <NavLink className="navbar-brand fw-bold" to="/">
          Sajilo Hajiri
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                Home
              </NavLink>
            </li>

            {/* Dashboard link for any logged-in user */}
            {currentUser && (
              <li className="nav-item">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Dashboard
                </NavLink>
              </li>
            )}

            {!currentUser ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                    Register
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                {currentUser?.role === 'admin' && (
                  <li className="nav-item">
                    <NavLink
                      to="/records"
                      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    >
                      Records
                    </NavLink>
                  </li>
                )}
                <li className="nav-item d-flex align-items-center ms-3">
                  <span className="fw-bold me-2">
                    {currentUser.name || currentUser.username}
                  </span>
                  <img
                    src={
                      currentUser.avatar
                        ? `http://localhost:8000${currentUser.avatar}`
                        : "/default-avatar.png"
                    }
                    alt="avatar"
                    className="rounded-circle me-2"
                    width="40"
                    height="40"
                  />
                  <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
