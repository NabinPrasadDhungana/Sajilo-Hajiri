import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login/Login';
import AdminPanel from './components/AdminPanel';

import Dashboard from "./components/Dashboard"; // picks up index.jsx automatically
import StudentHistoryModal from "./components/Dashboard/StudentHistoryModal";
import Footer from "./components/Footer/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Simulated users data (students and teachers)
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

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  // Admin functions to update user status & notifications
  const approveUser = (email) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email
          ? { ...u, status: "approved", notification: "You are approved!" }
          : u
      )
    );
  };

  const unapproveUser = (email) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email
          ? { ...u, status: "unapproved", notification: "You are unapproved." }
          : u
      )
    );
  };

  const sendFeedback = (email, message) => {
    setUsers((prev) =>
      prev.map((u) => (u.email === email ? { ...u, notification: message } : u))
    );
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route
          exact
          path="/register"
          element={<Register showAlert={(msg, type) => alert(`${msg}`)} />}
        />

        <Route
          exact
          path="/dashboard"
          element={
            <>
              <Dashboard onStudentClick={handleStudentClick} />
              {selectedStudent && (
                <StudentHistoryModal student={selectedStudent} onClose={closeModal} />
              )}
            </>
          }
        />

        {/* Admin Panel Route */}
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
