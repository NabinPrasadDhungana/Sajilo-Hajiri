// components/Dashboard/index.jsx
import React, { useState } from "react";
import "./Dashboard.css";

const attendanceData = {
  Math: [
    { id: 1, name: "Anish Joshi", roll: "07", arrival: "09:05 AM", departure: "03:58 PM", duration: "6h 53m" },
    { id: 3, name: "Sita Sharma", roll: "12", arrival: "09:15 AM", departure: "04:00 PM", duration: "6h 45m" },
  ],
  Science: [
    { id: 2, name: "Hemraj Pant", roll: "08", arrival: "09:11 AM", departure: "-", duration: "Ongoing" },
    { id: 4, name: "Ram Kumar", roll: "09", arrival: "09:00 AM", departure: "03:30 PM", duration: "6h 30m" },
  ],
  English: [
    { id: 1, name: "Anish Joshi", roll: "07", arrival: "09:10 AM", departure: "04:00 PM", duration: "6h 50m" },
    { id: 5, name: "Gita Rai", roll: "10", arrival: "09:05 AM", departure: "03:45 PM", duration: "6h 40m" },
  ]
};

export default function Dashboard({ onStudentClick }) {
  const subjects = Object.keys(attendanceData);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

  const students = attendanceData[selectedSubject];

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Attendance Dashboard</h1>
      </header>

      <nav className="subject-tabs">
        {subjects.map((subject) => (
          <button
            key={subject}
            className={`subject-tab ${subject === selectedSubject ? "active" : ""}`}
            onClick={() => setSelectedSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </nav>

      <section className="summary">
        <div className="card">Subject: {selectedSubject}</div>
        <div className="card">Total Present: {students.length}</div>
        {/* Add more summary stats here if you want */}
      </section>

      <section className="student-table-section">
        <h2>{selectedSubject} Attendance</h2>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Arrival</th>
              <th>Departure</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} onClick={() => onStudentClick(student)}>
                <td className="name-cell">{student.name}</td>
                <td>{student.roll}</td>
                <td>{student.arrival}</td>
                <td>{student.departure}</td>
                <td>{student.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
