// components/PublicRoute.jsx
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    // // Redirect approved users to dashboard
    // if (user.approval_status === 'approved') {
    return <Navigate to="/dashboard" replace />;
    // }
    // Redirect pending/unapproved users to pending dashboard or status page
    // return <Navigate to="/pending-status" replace />;
  }

  return children;
};

export default PublicRoute;
