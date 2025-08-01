import React, { useEffect, useState } from 'react';

const PAGE_SIZE = 10;

function getPercentBadge(percent) {
  let color = 'secondary';
  if (percent >= 75) color = 'success';
  else if (percent >= 50) color = 'warning';
  else color = 'danger';
  return (
    <span className={`badge bg-${color} ms-2`} title={`Attendance: ${percent}%`}>
      {percent}%
    </span>
  );
}

function StudentRecords({ apiUrl, filtersConfig = [], title = 'Student Records' }) {
  const [filters, setFilters] = useState({});
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState({}); // { studentId: pageNum }
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const fetchRecords = async () => {
    setLoading(true);
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${apiUrl}?${query}`);
    const data = await res.json();
    setRecords(data);
    setLoading(false);
    setExpanded({}); // Collapse all on new filter
    setPage({}); // Reset pagination
  };

  const toggleExpand = studentId => {
    setExpanded(prev => ({ ...prev, [studentId]: !prev[studentId] }));
    setPage(prev => ({ ...prev, [studentId]: 1 })); // Start at page 1 when expanded
  };

  const handlePageChange = (studentId, newPage) => {
    setPage(prev => ({ ...prev, [studentId]: newPage }));
  };

  // Get attendance summary per subject
  const getAttendanceSummaryBySubject = attendance => {
    const summary = {};
    attendance.forEach(a => {
      // Support subject code if available
      const subj = a.subject_code ? `${a.subject} (${a.subject_code})` : a.subject || 'Unknown';
      if (!summary[subj]) summary[subj] = { present: 0, absent: 0, total: 0 };
      if (a.entry_status === 'present' || a.entry_status === 'manual-present') {
        summary[subj].present += 1;
      } else {
        summary[subj].absent += 1;
      }
      summary[subj].total += 1;
    });
    return summary;
  };

  // Student search filter
  const filteredRecords = records.filter(student => {
    if (!studentSearch.trim()) return true;
    const search = studentSearch.trim().toLowerCase();
    return (
      student.name?.toLowerCase().includes(search) ||
      student.roll_number?.toString().includes(search)
    );
  });

  return (
    <div className="container my-4">
      <h3>{title}</h3>
      <div className="row g-2 mb-3">
        {filtersConfig.map(f => (
          <div className="col-md-3" key={f.name}>
            {f.type === 'select' ? (
              <select className="form-select" name={f.name} onChange={handleChange}>
                <option value="">{f.label}</option>
                {f.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input className="form-control" type={f.type} name={f.name} placeholder={f.label} onChange={handleChange} />
            )}
          </div>
        ))}
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={fetchRecords} disabled={loading}>
            {loading ? 'Loading...' : 'Filter'}
          </button>
        </div>
      </div>
      <div className="row mb-2">
        <div className="col-md-4">
          <input
            className="form-control"
            type="text"
            placeholder="Search student by name or roll number..."
            value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll Number</th>
              <th>Summary</th>
              <th>Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr><td colSpan={4}>No records found.</td></tr>
            ) : (
              filteredRecords.map(student => {
                const summaryBySubject = getAttendanceSummaryBySubject(student.attendance);
                const sortedSubjects = Object.keys(summaryBySubject).sort();
                const totalPages = Math.ceil(student.attendance.length / PAGE_SIZE) || 1;
                const currentPage = page[student.student_id] || 1;
                const startIdx = (currentPage - 1) * PAGE_SIZE;
                const endIdx = startIdx + PAGE_SIZE;
                const pagedAttendance = student.attendance.slice(startIdx, endIdx);
                return (
                  <React.Fragment key={student.student_id}>
                    <tr>
                      <td>{student.name}</td>
                      <td>{student.roll_number}</td>
                      <td>
                        {sortedSubjects.length === 0 ? (
                          <span className="text-muted">No attendance</span>
                        ) : (
                          <ul className="list-unstyled mb-0">
                            {sortedSubjects.map(subj => {
                              const stats = summaryBySubject[subj];
                              const percent = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
                              return (
                                <li key={subj}>
                                  <span className="fw-bold" title="Subject">{subj}:</span>
                                  <span className="badge bg-success ms-2" title="Present Days">Present: {stats.present}</span>
                                  <span className="badge bg-danger ms-2" title="Absent Days">Absent: {stats.absent}</span>
                                  {getPercentBadge(percent)}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm btn-${expanded[student.student_id] ? 'secondary' : 'info'}`}
                          onClick={() => toggleExpand(student.student_id)}
                        >
                          {expanded[student.student_id] ? 'Hide' : 'Show'} Attendance
                        </button>
                      </td>
                    </tr>
                    {expanded[student.student_id] && (
                      <tr>
                        <td colSpan={4}>
                          {student.attendance.length === 0 ? (
                            <span className="text-muted">No attendance</span>
                          ) : (
                            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                              <table className="table table-sm">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Entry Status</th>
                                    <th>Exit Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pagedAttendance.map(a => (
                                    <tr key={a.id}>
                                      <td>{a.date}</td>
                                      <td>{a.subject_code ? `${a.subject} (${a.subject_code})` : a.subject}</td>
                                      <td>{a.entry_status}</td>
                                      <td>{a.exit_status}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <span>Page {currentPage} of {totalPages}</span>
                                <div>
                                  <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(student.student_id, currentPage - 1)}
                                  >Prev</button>
                                  <button
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(student.student_id, currentPage + 1)}
                                  >Next</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentRecords;
