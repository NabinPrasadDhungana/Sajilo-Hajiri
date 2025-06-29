import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../Helper/Csrf_token';
import './Login.css';

const Login = ({ setCurrentUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ensure CSRF cookie is set
  useEffect(() => {
    fetch('/api/csrf/', { 
      credentials: 'include' 
    }).catch(err => {
      console.error('CSRF fetch error:', err);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authFetch('/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      // Handle successful login
      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      
      // Enhanced error messages based on your Django responses
      setMessage(
        error.message.includes('credentials') ? '❌ Invalid username or password' :
        error.message.includes('approved') ? '⚠️ Account not approved yet' :
        '❗ Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-with-icon">
            <span className="icon" role="img" aria-label="username">👤</span>
            <input
              type="text"
              name="username"
              placeholder="Email"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="input-with-icon">
            <span className="icon" role="img" aria-label="password">🔒</span>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={loading ? 'loading' : ''}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>

        {message && (
          <div className={`alert mt-3 ${
            message.startsWith('❌') ? 'alert-danger' :
            message.startsWith('⚠️') ? 'alert-warning' : 'alert-info'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;