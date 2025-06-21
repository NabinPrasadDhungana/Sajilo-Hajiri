// components/Navbar.jsx
import React from 'react';
import { Link } from "react-router-dom";
import NotificationBell from "./NotificationBell";

export default function Navbar({ notifications }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-primary fixed-top">
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="btn btn-primary my-3 mx-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary my-3 mx-3" to="/Dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary my-3 mx-3" to="/Register">Register Now</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary my-3 mx-3" to="/Login">Login</Link>
            </li>
            <li className="nav-item">
              <Link className="btn btn-primary my-3 mx-3" to="/Register">Logout</Link>
            </li>
          </ul>
        </div>

        {/* Notifications bell */}
        <div className="d-flex align-items-center ms-auto me-3">
          <NotificationBell notifications={notifications} />
        </div>
      </div>
    </nav>
  );
}
