import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const AttendanceRecords = () => {
  const [filters, setFilters] = useState({
    class_id: '', subject_id: '', student_id: '', date: ''
  });
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch('/api/classes/').then(res => res.json()).then(setClasses);
    fetch('/api/students/').then(res => res.json()).then(setStudents);
    fetch('/api/subjects/').then(res => res.json()).then(setSubjects);
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const fetchRecords = async () => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/admin/attendance-records/?${query}`);
    if (!res.ok) return toast.error("Failed to fetch records");
    const data = await res.json();
    setRecords(data);
  };

  return (
    <div className="container mt-5">
      <h2>📋 Attendance Records</h2>

      <div className="row g-3 my-4">
        <div className="col-md-3">
          <select className="form-select" name="class_id" onChange={handleChange}>
            <option value="">Filter by Class</option>
            {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" name="subject_id" onChange={handleChange}>
            <option value="">Filter by Subject</option>
            {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" name="student_id" onChange={handleChange}>
            <option value="">Filter by Student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <input type="date" className="form-control" name="date" onChange={handleChange} />
        </div>
        <div className="col-md-12">
          <button className="btn btn-primary" onClick={fetchRecords}>🔍 View Records</button>
        </div>
      </div>

      <div className="table-responsive mt-4">
        {records.length === 0 ? (
          <p>No records found.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Entry Status</th>
                <th>Exit Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.student_name}</td>
                  <td>{r.class_name}</td>
                  <td>{r.subject_name}</td>
                  <td>{r.session_date}</td>
                  <td>{r.entry_status}</td>
                  <td>{r.exit_status || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;