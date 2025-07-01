import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <div className="main-content mt-5 container text-center py-5">
      <h1 className="display-4 text-danger">🚫 Access Denied</h1>
      <p className="lead mt-3">You don't have permission to view this page.</p>
      <Link to="/" className="btn btn-primary mt-4">
        ⬅️ Go Back Home
      </Link>
    </div>
  );
};

export default NotAuthorized;
