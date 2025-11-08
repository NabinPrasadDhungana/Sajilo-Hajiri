import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

// Note: This version uses Bootstrap 5 classes and custom CSS to match the image design.
// It includes a spacer element to prevent content from hiding behind the fixed navbar.

const Navbar = ({ currentUser, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- CONDITIONAL RENDERING: HIDE NAVBAR ON LOGIN PAGE ---
  if (location.pathname === "/login") {
    return null;
  }
  // --------------------------------------------------------

  const handleAvatarClick = () => {
    // Uses switch case for navigation based on role
    switch (currentUser?.role) {
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/dashboard");
    }
  };

  // 1. Define Navigation Link Sets
  const navItemsMarketing = ["Product", "Solutions", "Integrations", "Resources"];
  const navItemsTeacher = ["Attendance", "Records", "Analysis"];
  const navItemsStudent = ["Records", "Analysis", "Report"];

  // 2. Determine which set of links to display
  let dynamicNavItems = [];
  let isDashboardLinks = false; // Flag to check if we should use hash fragments

  if (!currentUser || currentUser.role === "admin") {
    // Case 1: Not logged in (Marketing links) OR Admin (Default links, no change)
    dynamicNavItems = navItemsMarketing;
  } else if (currentUser.role === "teacher") {
    // Case 2: Teacher role
    dynamicNavItems = navItemsTeacher;
    isDashboardLinks = true;
  } else if (currentUser.role === "student") {
    // Case 3: Student role
    dynamicNavItems = navItemsStudent;
    isDashboardLinks = true;
  }

  // Helper function to determine the target path
  const getNavLinkTarget = (item) => {
    const cleanItem = item.toLowerCase().replace(/\s/g, '');
    if (isDashboardLinks) {
      // For Teacher/Student roles, use the current path + hash fragment (e.g., /dashboard#records)
      return `${location.pathname}#${cleanItem}`;
    } else {
      // For Marketing/Admin roles, use standard path (e.g., /product)
      return `/${cleanItem}`;
    }
  };
  
  // Custom click handler for dashboard links to trigger scroll
  const handleDashboardLinkClick = (e, item) => {
    // Only handle click if it's a dashboard link (internal scroll)
    if (isDashboardLinks) {
        const cleanItem = item.toLowerCase().replace(/\s/g, '');
        const targetElement = document.getElementById(cleanItem);

        if (targetElement) {
            e.preventDefault(); // Prevent default NavLink behavior

            // Calculate target position considering the fixed navbar height (96px)
            const navbarHeight = 96;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            // Optionally update URL hash without refreshing the page
            window.history.pushState(null, null, `#${cleanItem}`);
        }
    }
    // If it's a marketing link, NavLink handles standard routing
  };


  return (
    <React.Fragment>
      {/* 1. THE FIXED NAVBAR 
        The 'fixed-top' class keeps this element at the top of the viewport.
      */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm fixed-top border-bottom">
        {/* Container for the navbar content */}
        <div className="container-fluid px-4 px-md-5 px-xl-5 d-flex justify-content-between align-items-center">

          {/* === LEFT: LOGO === */}
          <div className="d-flex align-items-center">
            <NavLink className="navbar-brand fw-extrabold fs-5 d-flex align-items-center text-dark" to="/">
              <img
                src="/logo-orange.png" // replace with your actual logo path
                alt="Sajilo Hajiri Logo"
                height="28"
                className="me-2"
              />
              Sajilo Hajiri
            </NavLink>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
          </button>


          {/* === CENTER: NAV LINKS (Desktop Only) - DYNAMIC LINKS BASED ON ROLE === */}
          <div className="d-none d-lg-flex flex-grow-1 justify-content-center">
              <ul className="navbar-nav d-flex flex-row">
              {dynamicNavItems.map((item) => (
                  <li key={item} className="nav-item mx-3">
                  <NavLink
                      // Removed 'text-sm' since font-size is set in CSS
                      className="nav-link fw-semibold" 
                      to={getNavLinkTarget(item)} // Use helper function to get target
                      onClick={isDashboardLinks ? (e) => handleDashboardLinkClick(e, item) : undefined} // Add custom click handler
                  >
                      {item}
                  </NavLink>
                  </li>
              ))}
              </ul>
          </div>


          {/* === RIGHT: BUTTONS / USER === */}
          <div className="d-flex align-items-center">
            {!currentUser ? (
              <div className="d-flex flex-column align-items-end">
                {/* Top Row: Utility Links and Buttons */}
                <div className="d-flex align-items-center mb-1">
                  
                  {/* EN & Login (Hidden on Mobile) */}
                  <span className="text-secondary fw-medium small me-3 d-none d-md-block">EN</span>
                  <NavLink to="/login" className="text-secondary fw-medium small me-4 text-decoration-none d-none d-md-block navbar-link-custom">
                    Login
                  </NavLink>

                  {/* Book Demo Button (Outline Orange) */}
                  <button className="btn btn-outline-custom-orange fw-semibold px-3 py-2 me-2 btn-sm text-nowrap">
                    Book Demo
                  </button>

                  {/* Start NOW! Button (Solid Orange) */}
                  <button className="btn btn-custom-orange fw-semibold text-white px-3 py-2 shadow-sm me-1 btn-sm text-nowrap">
                    Start NOW!
                  </button>
                </div>

                {/* Bottom Line: Call Us */}
                <span className="text-muted small-text">
                  Call us: <a href="tel:+9779826110703" className="text-dark fw-bold text-decoration-none navbar-link-custom-dark">+1 (977)9826110703</a>
                </span>
              </div>
            ) : (
              /* Authenticated User View (Preserving original logic) */
              <div className="d-flex align-items-center">
                <span className="fw-semibold me-2 text-secondary small">
                  {currentUser.name || currentUser.username}
                </span>
                <img
                  src={
                    currentUser.avatar
                      ? `http://localhost:8000${currentUser.avatar}`
                      : "https://placehold.co/40x40/f7f7f7/6b7280?text=U"
                  }
                  alt="avatar"
                  className="rounded-circle me-2 avatar-custom"
                  width="40"
                  height="40"
                  style={{ cursor: "pointer", border: "2px solid #ddd" }}
                  onClick={handleAvatarClick}
                />
                <button
                  className="btn btn-sm btn-danger fw-semibold px-3 py-1"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. THE SPACER ELEMENT 
        This non-visual element pushes the main page content down by exactly the height 
        of the fixed navbar, preventing overlap. It is also hidden when the navbar is hidden (since the whole component returns null).
      */}
      <div className="navbar-spacer"></div>

      {/* Inline Styles for Custom Sajilo Hajiri Look */}
      <style>{`
        :root {
          --jibble-orange: #ff6600;
        }
        .navbar {
          min-height: 96px; /* H-24 equivalent */
        }
        /* New Spacer Class to reserve space */
        .navbar-spacer {
            height: 96px; 
            width: 100%;
        }

        .navbar-brand, .nav-link, .navbar-link-custom {
          color: #4a5568 !important; /* Tailwind gray-700 equivalent (Base Text Color) */
          transition: color 0.15s ease-in-out;
          font-size: 0.875rem !important; /* text-sm equivalent */
        }
        
        /* FIX: Force the base color on all pseudo-states to prevent Bootstrap defaults from overriding */
        .nav-link:link, 
        .nav-link:visited, 
        .nav-link.active,
        .nav-link:focus { 
          color: #4a5568 !important; 
        }

        /* Hover state (This remains the orange color) */
        .navbar-brand:hover, 
        .nav-link:hover, 
        .navbar-link-custom:hover {
          color: var(--jibble-orange) !important;
        }

        .navbar-link-custom-dark:hover {
            color: var(--jibble-orange) !important;
        }

        /* Custom Buttons */
        .btn-custom-orange {
          background-color: var(--jibble-orange);
          border-color: var(--jibble-orange);
          border-radius: 8px; /* rounded-lg */
          box-shadow: 0 4px 6px -1px rgba(255, 102, 0, 0.2), 0 2px 4px -2px rgba(255, 102, 0, 0.1);
          transition: background-color 0.15s ease-in-out;
        }
        .btn-custom-orange:hover {
          background-color: #e65c00; /* slightly darker orange */
          border-color: #e65c00;
          color: white;
        }

        .btn-outline-custom-orange {
          color: var(--jibble-orange);
          border-color: var(--jibble-orange);
          border-radius: 8px;
          background-color: transparent;
          transition: all 0.15s ease-in-out;
        }
        .btn-outline-custom-orange:hover {
          color: var(--jibble-orange);
          background-color: rgba(255, 102, 0, 0.05); /* very light orange background on hover */
          border-color: var(--jibble-orange);
        }

        /* Font/Text Sizing */
        .fw-extrabold { font-weight: 800; }
        .small-text { font-size: 0.75rem; } /* Tailwind text-xs equivalent */
        .btn-sm { padding: 0.5rem 1rem !important; }
        
        /* Avatar Hover Effect */
        .avatar-custom:hover {
          border-color: var(--jibble-orange) !important;
          transform: scale(1.05);
          transition: 0.2s ease;
        }

      `}</style>
    </React.Fragment>
  );
};

// Required for the React Immersive environment
export default Navbar;