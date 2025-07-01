// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PublicRoute from './components/PublicRoute';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login/Login';
import AdminPanel from './components/AdminPanel';
import Dashboard from "./components/Dashboard";
import StudentHistoryModal from "./components/Dashboard/StudentHistoryModal";
import Footer from "./components/Footer/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css"
import { authFetch } from "./Helper/Csrf_token";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import NotAuthorized from "./components/NotAuthorized";

export default function App() {
  const [adminData, setAdminData] = useState({ stats: {}, pending_users: [] });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [users, setUsers] = useState([
    {
      email: "student1@example.com",
      fullName: "Student One",
      role: "student",
      status: "pending",
      notification: "Waiting for approval",
    },
    {
      email: "teacher1@example.com",
      fullName: "Teacher One",
      role: "teacher",
      status: "approved",
      notification: "Welcome!",
    },
  ]);

  useEffect(() => {
    fetch("/api/csrf/", {
      credentials: "include",
    });

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      Promise.all([
        fetch("/api/admin/stats/", { credentials: "include" }).then(res => res.json()),
        fetch("/api/admin/pending-users/", { credentials: "include" }).then(res => res.json())
      ]).then(([stats, pending_users]) => {
        setAdminData({ stats, pending_users });
      });
    }
  }, [currentUser]);


  // helper functions for admin
  const handleUserAction = async (email, action) => {
    await fetch("/api/admin/user-approval/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, action })
    });
    window.location.reload(); // or refresh the data manually
  };

  const sendFeedback = async (email, feedback) => {
    await fetch("/api/admin/send-feedback/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, feedback })
    });
    window.location.reload();
  };


  // In your handleLogout function (App.jsx)
const handleLogout = async () => {
  try {
    // Refresh CSRF token first
    await fetch('/api/csrf/', { credentials: 'include' });
    
    // Then call logout
    await authFetch('/api/logout/', { method: 'POST' });
    
    setCurrentUser(null);
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  const approveUser = (email) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, status: "approved", notification: "You are approved!" } : u
      )
    );
    const user = users.find((u) => u.email === email);
    if (user) {
      setNotifications((prev) => [
        ...prev,
        `${user.fullName} (${user.role}) has been approved.`
      ]);
    }
  };

  const unapproveUser = (email) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, status: "unapproved", notification: "You are unapproved." } : u
      )
    );
    const user = users.find((u) => u.email === email);
    if (user) {
      setNotifications((prev) => [
        ...prev,
        `${user.fullName} (${user.role}) has been unapproved.`
      ]);
    }
  };

  return (
    <BrowserRouter>
      <Navbar
        currentUser={currentUser}
        handleLogout={handleLogout}
        notifications={notifications}
      />

      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/register" element={<PublicRoute><Register showAlert={(msg) => alert(`${msg}`)} /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login setCurrentUser={setCurrentUser} /></PublicRoute>} />
        <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminPanel
                stats={adminData.stats}
                users={adminData.pending_users}
                approveUser={(email) => handleUserAction(email, "approve")}
                unapproveUser={(email) => handleUserAction(email, "unapprove")}
                sendFeedback={sendFeedback}
              />
            </ProtectedAdminRoute>
          }
        />        
      <Route path="/not-authorized" element={<NotAuthorized />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
