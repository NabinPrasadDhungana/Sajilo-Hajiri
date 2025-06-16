import React from "react";
import "./StudentHistoryModal.css";

const fakeHistory = [
  { date: "June 16, 2025", arrival: "09:02 AM", departure: "03:45 PM", duration: "6h 43m", status: "Present" },
  { date: "June 15, 2025", arrival: "-", departure: "-", duration: "0h", status: "Absent" },
  { date: "June 14, 2025", arrival: "09:10 AM", departure: "04:10 PM", duration: "7h", status: "Present" }
];

export default function StudentHistoryModal({ student, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Attendance History - {student.name}</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Arrival</th>
              <th>Departure</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fakeHistory.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.arrival}</td>
                <td>{entry.departure}</td>
                <td>{entry.duration}</td>
                <td>{entry.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
