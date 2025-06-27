import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminPanel from "../AdminPanel";
import { authFetch } from "../../Helper/Csrf_token";

export default function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get CSRF token from cookies
  const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  // Redirect if user is not defined
  useEffect(() => {
  if (!user) {
    // Try to recover from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setData({ user: JSON.parse(savedUser) });
    } else {
      navigate('/login');
    }
  }
}, [user, navigate]);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const csrfToken = getCSRFToken();
        if (!csrfToken) {
          throw new Error('CSRF token not found');
        }

        const response = await authFetch("/api/dashboard/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",  // Required for session cookies
        });

        if (!response.ok) {
          if (response.status === 403) {
            // CSRF failure or session expired
            navigate('/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        
        const result = await response.json();
        setData(result);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (data) console.log("📦 Dashboard data:", data);
  }, [data]);


  // Loading and error states
  if (loading) return <div className="container mt-5"><p>Loading dashboard...</p></div>;
  if (error) return <div className="container mt-5 alert alert-danger">Error: {error}</div>;
  if (!data) return <div className="container mt-5"><p>No dashboard data found.</p></div>;
  if (!user) return null; // Already redirected

  // === Admin View ===
  if (user.role === "admin") {
    return (
      <AdminPanel
        stats={data.stats}
        users={data.stats?.pending_users || []}
        approveUser={async (email) => {
          try {
            const csrfToken = getCSRFToken();
            const response = await fetch("/api/approve-user/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify({ email }),
            });
            if (!response.ok) throw new Error('Approval failed');
            // Handle success
          } catch (err) {
            console.error("Approval error:", err);
          }
        }}
        // ... other AdminPanel props
      />
    );
  }

  if (user.role === "student") {
  if (data.student_data?.error) {
    return (
      <div className="container mt-5 alert alert-warning">
        ⚠️ {data.student_data.error}
      </div>
    );
  }
  

  return (
    <div className="container mt-5">
      <h3>Welcome, {user.name || user.username} 👨‍🎓</h3>
      <p>Class: {data.student_data.class}</p>
      <h5>Subjects:</h5>
      <ul>
        {data.student_data.subjects.map((subj, index) => (
          <li key={index}>{subj.name}</li>
        ))}
      </ul>
      <h5>Recent Attendance Records:</h5>
      <ul>
        {data.student_data.attendance.map((record, index) => (
          <li key={index}>
            {record.entry_time} — {record.entry_status}
          </li>
        ))}
      </ul>
    </div>
  );
}




  // ... rest of the component (Teacher and Student views) remains the same ...
}