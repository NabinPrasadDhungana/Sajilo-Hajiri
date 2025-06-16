import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Register';

import Dashboard from "./components/Dashboard"; // picks up index.jsx automatically
import StudentHistoryModal from "./components/Dashboard/StudentHistoryModal";
import Footer from "./components/Footer/Footer";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/register" element={<Register showAlert={(msg, type) => alert(`${msg}`)} />} />
        
        {/* Add a route for the dashboard */}
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
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
