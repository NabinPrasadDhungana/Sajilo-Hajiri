// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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

export default function App() {
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

    // Optional: Restore session from localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

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

  const sendFeedback = (email, message) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, notification: message } : u
      )
    );
    const user = users.find((u) => u.email === email);
    if (user) {
      setNotifications((prev) => [
        ...prev,
        `Feedback sent to ${user.fullName}: "${message}"`
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
        <Route exact path="/register" element={<Register showAlert={(msg) => alert(`${msg}`)} />} />
        <Route path="/login" element={<Login setCurrentUser={setCurrentUser} />} />
        <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
        <Route
          exact
          path="/admin"
          element={
            <AdminPanel
              users={users}
              approveUser={approveUser}
              unapproveUser={unapproveUser}
              sendFeedback={sendFeedback}
            />
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}
