import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== 'admin') {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
