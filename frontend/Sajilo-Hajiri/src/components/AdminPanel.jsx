import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../Helper/Csrf_token";
import { toast } from 'react-toastify';

export default function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [assignments, setAssignments] = useState([]);


  // Form states
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [editMode, setEditMode] = useState({
    class: null,
    subject: null,
    teacher: null,
    student: null
  });

  const [formData, setFormData] = useState({
    // Class form
    className: '', year: '', semester: '', department: '',
    // Subject form
    subjectName: '', subjectCode: '',
    // Teacher/Student assignment
    teacherId: '', classId: '', subjectId: '',
    studentId: '', enrollClassId: '',
    // User forms
    userName: '', userEmail: '', userRole: 'student', userPassword: ''
  });

  // Helper functions
  const getCSRFToken = () => {
    return document.cookie.split("; ").find(row => row.startsWith("csrftoken="))?.split("=")[1] || "";
  };

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      className: '', year: '', semester: '', department: '',
      subjectName: '', subjectCode: '',
      teacherId: '', classId: '', subjectId: '',
      studentId: '', enrollClassId: '',
      userName: '', userEmail: '', userRole: 'student', userPassword: ''
    });
    setEditMode({
      class: null,
      subject: null,
      teacher: null,
      student: null
    });
  };

  // Data fetching
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [
        statsRes, usersRes, teachersRes,
        studentsRes, classesRes, subjectsRes,
        enrollmentsRes, assignmentsRes
      ] = await Promise.all([
        authFetch("/api/admin/stats/"),
        authFetch("/api/admin/users/"),
        fetch('/api/teachers/'),
        fetch('/api/students/'),
        fetch('/api/classes/'),
        fetch('/api/subjects/'),
        fetch('/api/enrollments/'),
        fetch('/api/assignments/')
      ]);

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setTeachers(await teachersRes.json());
      setStudents(await studentsRes.json());
      setClasses(await classesRes.json());
      setSubjects(await subjectsRes.json());
      setEnrollments(await enrollmentsRes.json());
      setAssignments(await assignmentsRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD Operations
  const handleSubmit = async (endpoint, data, method = 'POST', successMessage) => {
    try {
      const res = await authFetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success(successMessage);
      fetchAllData();
      resetForm();
      return await res.json();
    } catch (err) {
      toast.error(`Operation failed: ${err.message}`);
      throw err;
    }
  };

  // Class CRUD
  const handleClassSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.className || !formData.year || !formData.semester || !formData.department) {
      toast.error("Please fill all class fields");
      return;
    }

    try {
      const payload = {
        name: formData.className,
        year: formData.year,
        semester: formData.semester,
        department: formData.department
      };

      const response = await authFetch("/api/classes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class");
      }

      toast.success("Class created successfully!");

      // Refresh classes list
      const classesRes = await fetch("/api/classes/");
      setClasses(await classesRes.json());

      // Reset form
      setFormData(prev => ({
        ...prev,
        className: "",
        year: "",
        semester: "",
        department: ""
      }));

    } catch (err) {
      toast.error(`Class creation failed: ${err.message}`);
      console.error("Class creation error:", err);
    }
  };

  const editClass = (classItem) => {
    setFormData({
      ...formData,
      className: classItem.name,
      year: classItem.year,
      semester: classItem.semester,
      department: classItem.department
    });

    setEditMode({
      ...editMode,
      class: classItem.id
    });

    document.getElementById('class-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteClass = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      await handleSubmit(`/api/classes/${id}/`, {}, 'DELETE', 'Class deleted successfully!');
    }
  };



  // User CRUD
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.userName,
      email: formData.userEmail,
      role: formData.userRole,
      password: formData.userPassword
    };

    if (editMode.user) {
      await handleSubmit(`/api/admin/users/${editMode.user}/`, payload, 'PUT', 'User updated successfully!');
    } else {
      await handleSubmit('/api/admin/users/', payload, 'POST', 'User created successfully!');
    }
  };

  const editUser = (user) => {
    setEditMode({ ...editMode, user: user.id });
    setFormData({
      ...formData,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role
    });
  };

  const deleteUser = async (id) => {
    // Prevent deleting yourself
    if (id === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/admin/users/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchAdminData(); // Refresh your user list
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
      console.error('Delete error:', err);
    }
  };

  const deleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      await handleSubmit(`/api/assignments/${id}/`, {}, 'DELETE', 'Assignment removed successfully!');
    }
  };

  // Enrollment CRUD
  const handleEnrollStudent = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.studentId || !formData.enrollClassId) {
      toast.error("Please select both student and class");
      return;
    }

    try {
      const payload = {
        student: formData.studentId,
        enrolled_class: formData.enrollClassId
      };

      const response = await authFetch("/api/enrollments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enroll student");
      }

      toast.success("Student enrolled successfully!");

      // Refresh enrollments list
      const enrollmentsRes = await fetch("/api/enrollments/");
      setEnrollments(await enrollmentsRes.json());

      // Reset form
      setFormData(prev => ({
        ...prev,
        studentId: "",
        enrollClassId: ""
      }));

    } catch (err) {
      toast.error(`Enrollment failed: ${err.message}`);
      console.error("Enrollment error:", err);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.teacherId || !formData.classId || !formData.subjectId) {
      toast.error("Please select a teacher, class, and subject");
      return;
    }

    try {
      const response = await authFetch("/api/admin/assign-teacher/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          teacher: formData.teacherId,
          class_instance: formData.classId,
          subject: formData.subjectId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to assign teacher");
      }

      toast.success("Teacher assigned successfully!");

      // Refresh assignments list
      const assignmentsRes = await fetch("/api/assignments/");
      setAssignments(await assignmentsRes.json());

      // Reset form
      setFormData(prev => ({
        ...prev,
        teacherId: "",
        classId: "",
        subjectId: ""
      }));

    } catch (err) {
      toast.error(`Assignment failed: ${err.message}`);
      console.error("Assignment error:", err);
    }
  };

  const deleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to remove this enrollment?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/enrollments/${enrollmentId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete enrollment');
      }

      toast.success('Enrollment removed successfully');

      // Refresh enrollments list
      const enrollmentsRes = await fetch('/api/enrollments/');
      setEnrollments(await enrollmentsRes.json());

    } catch (err) {
      toast.error(`Failed to remove enrollment: ${err.message}`);
      console.error('Delete enrollment error:', err);
    }
  };

  // User management functions
  const handleUserAction = async (email, action) => {
    try {
      const response = await authFetch("/api/admin/approve-user/", {  // Use your existing endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({ email, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Action failed");
      }

      toast.success(`User ${action}d successfully`);

      // Refresh user list using your existing pending users endpoint
      const usersRes = await authFetch("/api/admin/pending-users/");
      setUsers(await usersRes.json());

    } catch (err) {
      toast.error(`Failed to ${action} user: ${err.message}`);
      console.error("Action error:", err);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();

    try {
      const response = await authFetch("/api/classes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          name: formData.className,
          year: formData.year,
          semester: formData.semester,
          department: formData.department
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class");
      }

      toast.success("Class created successfully!");

      // Refresh classes list
      const classesRes = await fetch("/api/classes/");
      setClasses(await classesRes.json());

      // Reset form
      resetForm();

    } catch (err) {
      toast.error(`Class creation failed: ${err.message}`);
      console.error("Class creation error:", err);
    }
  };

  // class update function
  const handleUpdateClass = async (e) => {
    e.preventDefault();

    if (!editMode.class) return;

    try {
      const response = await authFetch(`/api/classes/${editMode.class}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          name: formData.className,
          year: formData.year,
          semester: formData.semester,
          department: formData.department
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update class');
      }

      toast.success('Class updated successfully!');

      // Refresh classes list
      const classesRes = await fetch('/api/classes/');
      setClasses(await classesRes.json());

      // Reset form using your existing function
      resetForm();

    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
      console.error('Update class error:', err);
    }
  };

  const editSubject = (subject) => {
    // Set the form data to the subject being edited
    setFormData({
      ...formData,
      subjectName: subject.name,
      subjectCode: subject.code,
    });

    // Set edit mode with the subject ID
    setEditMode({
      ...editMode,
      subject: subject.id
    });

    // Scroll to the form for better UX
    document.getElementById('subject-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const deleteSubject = async (subjectId) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) {
      return;
    }

    try {
      const response = await authFetch(`/api/subjects/${subjectId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject');
      }

      toast.success('Subject deleted successfully');

      // Refresh subjects list
      const subjectsRes = await fetch('/api/subjects/');
      setSubjects(await subjectsRes.json());

    } catch (err) {
      toast.error(`Failed to delete subject: ${err.message}`);
      console.error('Delete subject error:', err);
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();

    if (!editMode.subject) return;

    try {
      const response = await authFetch(`/api/subjects/${editMode.subject}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          name: formData.subjectName,
          code: formData.subjectCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subject');
      }

      toast.success('Subject updated successfully!');

      // Refresh subjects list
      const subjectsRes = await fetch('/api/subjects/');
      setSubjects(await subjectsRes.json());

      // Use your existing resetForm function
      resetForm();

    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
      console.error('Update subject error:', err);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();

    try {
      const response = await authFetch("/api/subjects/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          name: formData.subjectName,
          code: formData.subjectCode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subject");
      }

      toast.success("Subject created successfully!");

      // Refresh subjects list
      const subjectsRes = await fetch("/api/subjects/");
      setSubjects(await subjectsRes.json());

      // Reset form
      setFormData({
        ...formData,
        subjectName: "",
        subjectCode: ""
      });

    } catch (err) {
      toast.error(`Subject creation failed: ${err.message}`);
      console.error("Subject creation error:", err);
    }
  };

  const sendFeedback = async () => {
    try {
      const response = await authFetch("/api/admin/send-feedback/", {  // Use your existing endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        body: JSON.stringify({
          email: selectedEmail,
          feedback: feedbackText
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Feedback sending failed");
      }

      toast.success("Feedback sent successfully!");
      setFeedbackText("");
      setSelectedEmail(null);

      // Refresh user list
      const usersRes = await authFetch("/api/admin/pending-users/");
      setUsers(await usersRes.json());

    } catch (err) {
      toast.error(`Failed to send feedback: ${err.message}`);
      console.error("Feedback error:", err);
    }
  };
  // Effects
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchAllData();
  }, [user, navigate]);

  if (isLoading) return <div className="main-content container  text-center">Loading...</div>;
  if (error) return <div className="main-content container  alert alert-danger">{error}</div>;

  return (
    <div className="main-content container ">
      <h1 className="mb-4">Admin Panel</h1>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
            onClick={() => setActiveTab('classes')}
          >
            Class Management
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Subject Management
          </button>
        </li>
      </ul>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-tab">
          <div className="row mb-4">
            {[
              { title: 'Total Users', value: stats.total_users, icon: '👥' },
              { title: 'Total Students', value: stats.total_students, icon: '🎓' },
              { title: 'Total Teachers', value: stats.total_teachers, icon: '👨‍🏫' },
              { title: 'Pending Approvals', value: users.filter(u => u.approval_status === 'pending').length, icon: '⏳' }
            ].map((stat, i) => (
              <div key={i} className="col-md-3 mb-3">
                <div className="card h-100">
                  <div className="card-body text-center">
                    <h2>{stat.icon}</h2>
                    <h5 className="card-title">{stat.title}</h5>
                    <p className="card-text display-6">{stat.value || 0}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Quick Assign Teacher</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAssignTeacher}>
                    <div className="mb-3">
                      <select
                        name="teacherId"
                        className="form-select"
                        onChange={handleChange}
                        required
                        value={formData.teacherId}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <select
                        name="classId"
                        className="form-select"
                        onChange={handleChange}
                        required
                        value={formData.classId}
                      >
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <select
                        name="subjectId"
                        className="form-select"
                        onChange={handleChange}
                        required
                        value={formData.subjectId}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                      Assign Teacher
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">Quick Enroll Student</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleEnrollStudent}>
                    <div className="mb-3">
                      <select
                        name="studentId"
                        className="form-select"
                        onChange={handleChange}
                        required
                        value={formData.studentId}
                      >
                        <option value="">Select Student</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <select
                        name="enrollClassId"
                        className="form-select"
                        onChange={handleChange}
                        required
                        value={formData.enrollClassId}
                      >
                        <option value="">Select Class</option>
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-success w-100">
                      Enroll Student
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Recent Teacher Assignments</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Teacher</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.slice(0, 5).map(assignment => {
                      const teacher = teachers.find(t => t.id === assignment.teacher);
                      const classItem = classes.find(c => c.id === assignment.class_instance);
                      const subject = subjects.find(s => s.id === assignment.subject);
                      return (
                        <tr key={assignment.id}>
                          <td>{teacher?.name || 'Unknown'}</td>
                          <td>{classItem?.name || 'Unknown'}</td>
                          <td>{subject?.name || 'Unknown'}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteAssignment(assignment.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Student Enrollments</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      <th>Enrolled On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.slice(0, 5).map(enrollment => {
                      const student = students.find(s => s.id === enrollment.student);
                      const classItem = classes.find(c => c.id === enrollment.enrolled_class);
                      return (
                        <tr key={enrollment.id}>
                          <td>{student?.name || 'Unknown'}</td>
                          <td>{classItem?.name || 'Unknown'}</td>
                          <td>{new Date(enrollment.enrolled_on).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteEnrollment(enrollment.id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="user-management-tab">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editMode.user ? 'Edit User' : 'Create New User'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleUserSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="userName"
                      className="form-control"
                      value={formData.userName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="userEmail"
                      className="form-control"
                      value={formData.userEmail}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <select
                      name="userRole"
                      className="form-select"
                      value={formData.userRole}
                      onChange={handleChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {!editMode.user && (
                    <div className="col-md-6">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        name="userPassword"
                        className="form-control"
                        value={formData.userPassword}
                        onChange={handleChange}
                        required={!editMode.user}
                        minLength="8"
                      />
                    </div>
                  )}
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      {editMode.user && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary">
                        {editMode.user ? 'Update User' : 'Create User'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">User List</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.roll_number}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${user.role === 'teacher' ? 'bg-info' :
                              user.role === 'admin' ? 'bg-danger' : 'bg-primary'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${user.approval_status === 'approved' ? 'bg-success' :
                              user.approval_status === 'unapproved' ? 'bg-danger' : 'bg-warning'
                            }`}>
                            {user.approval_status || 'pending'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => editUser(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this user?')) {
                                  deleteUser(user.id);
                                }
                              }}
                              disabled={user.id === user?.id} // Only if currentUser is available
                            >
                              Delete
                            </button>

                            {user.approval_status !== 'approved' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleUserAction(user.email, 'approve')}
                              >
                                Approve
                              </button>
                            )}
                            {user.approval_status !== 'unapproved' && (
                              <button
                                className="btn btn-sm btn-warning"
                                onClick={() => handleUserAction(user.email, 'unapprove')}
                              >
                                Unapprove
                              </button>
                            )}
                            <button
                              className={`btn btn-sm ${selectedEmail === user.email ? 'btn-secondary' : 'btn-info'
                                }`}
                              onClick={() => setSelectedEmail(
                                selectedEmail === user.email ? null : user.email
                              )}
                            >
                              {selectedEmail === user.email ? 'Cancel' : 'Feedback'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {selectedEmail && (
            <div className="card mt-4">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">Send Feedback to {selectedEmail}</h5>
              </div>
              <div className="card-body">
                <textarea
                  className="form-control mb-3"
                  rows="4"
                  placeholder="Enter your feedback here..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setFeedbackText("");
                      setSelectedEmail(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={sendFeedback}
                    disabled={!feedbackText.trim()}
                  >
                    Send Feedback
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Class Management Tab */}
      {activeTab === 'classes' && (
        <div className="class-management-tab">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editMode.class ? 'Edit Class' : 'Create New Class'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={editMode.class ? handleUpdateClass : handleCreateClass}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Class Name</label>
                    <input
                      type="text"
                      name="className"
                      className="form-control"
                      value={formData.className}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      name="year"
                      className="form-control"
                      value={formData.year}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Semester</label>
                    <input
                      type="number"
                      name="semester"
                      className="form-control"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      name="department"
                      className="form-control"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      {editMode.class && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary">
                        {editMode.class ? 'Update Class' : 'Create Class'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Class List</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Year</th>
                      <th>Semester</th>
                      <th>Department</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map(classItem => (
                      <tr key={classItem.id}>
                        <td>{classItem.name}</td>
                        <td>{classItem.year}</td>
                        <td>{classItem.semester}</td>
                        <td>{classItem.department}</td>
                        <td>
                          {enrollments.filter(e => e.enrolled_class === classItem.id).length}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => editClass(classItem)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteClass(classItem.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject Management Tab */}
      {activeTab === 'subjects' && (
        <div className="subject-management-tab">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">{editMode.subject ? 'Edit Subject' : 'Create New Subject'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={editMode.subject ? handleUpdateSubject : handleCreateSubject}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Subject Name</label>
                    <input
                      type="text"
                      name="subjectName"
                      className="form-control"
                      value={formData.subjectName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Subject Code</label>
                    <input
                      type="text"
                      name="subjectCode"
                      className="form-control"
                      value={formData.subjectCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-2">
                      {editMode.subject && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={resetForm}  // Use the existing reset function
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" className="btn btn-primary">
                        {editMode.subject ? 'Update Subject' : 'Create Subject'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Subject List</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Assigned Classes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map(subject => (
                      <tr key={subject.id}>
                        <td>{subject.name}</td>
                        <td>{subject.code}</td>
                        <td>
                          {assignments.filter(a => a.subject === subject.id).length}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => editSubject(subject)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteSubject(subject.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}