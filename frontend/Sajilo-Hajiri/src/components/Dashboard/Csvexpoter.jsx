// CSVExporter.js
import React from 'react';
import { CSVLink } from 'react-csv';

function CSVExporter({ records = [], filename = 'attendance_export.csv' }) {
  // Flatten each student's attendance into a single row per session
  console.log(records)
  const flattenedData = records.flatMap(student =>
    student.attendance.map(a => ({
      name: student.name,
      roll_number: student.roll_number,
      date: a.date,
      subject: a.subject_code ? `${a.subject} (${a.subject_code})` : a.subject,
      entry_status: a.entry_status,
      exit_status: a.exit_status,
    }))
  );

  const headers = [
    { label: 'Name', key: 'name' },
    { label: 'Roll Number', key: 'roll_number' },
    { label: 'Date', key: 'date' },
    { label: 'Subject', key: 'subject' },
    { label: 'Entry Status', key: 'entry_status' },
    { label: 'Exit Status', key: 'exit_status' },
  ];

  if (flattenedData.length === 0) return null;

  return (
    <div className="mb-3">
      <CSVLink
        data={flattenedData}
        headers={headers}
        filename={filename}
        className="btn btn-outline-success"
      >
        📥 Export Attendance CSV
      </CSVLink>
    </div>
  );
}

export default CSVExporter;
