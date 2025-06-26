import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg shadow-sm fixed-top">
      <div className="container-fluid d-flex justify-content-between align-items-center px-4">
        <NavLink className="navbar-brand" to="/">
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
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/login"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/register"
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                Register
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
