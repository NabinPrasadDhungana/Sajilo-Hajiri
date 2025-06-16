import React from 'react'
import {
    
  Link,
} from "react-router-dom";

export default function Navbar() {
  return (
    <>
 <nav className="navbar navbar-expand-lg navbar-light bg-primary fixed-top">
      <div className="container-fluid">
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon" />
    </button>
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
       
         <li className="nav-item">
          <Link  className="btn btn-primary my-3 mx-3" to="/">
           Home
          </Link>
        </li>
         <li className="nav-item">
          <Link  className="btn btn-primary my-3 mx-3" to="/Register">
            Dashboard
          </Link>
        </li>
        <li className="nav-item">
          <Link  className="btn btn-primary my-3 mx-3" to="/Register">
            Resister Now
          </Link>
        </li>
        <li className="nav-item">
          <Link  className="btn btn-primary my-3 mx-3" to="/Register">
            Logout
          </Link>
        </li>

         <li className="nav-item">
          <Link  className="btn btn-primary my-3 mx-3" to="/Register">
            Login
          </Link>
        </li>
        
      </ul>
    </div>
  </div>
</nav>

    </>
  )
}
