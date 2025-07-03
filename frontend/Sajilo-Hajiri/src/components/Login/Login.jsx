import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../Helper/Csrf_token';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Login.css';

const Login = ({ setCurrentUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  useEffect(() => {
    fetch('/api/csrf/', { credentials: 'include' });

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail, remember: true }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    const { email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.warn("⚠️ Please enter a valid email");
      return false;
    }
    if (!forgotMode && (!password || password.length < 6)) {
      toast.warn("⚠️ Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const endpoint = forgotMode ? '/api/forgot-password/' : '/api/login/';
      const response = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      if (forgotMode) {
        toast.success("📩 Password reset instructions sent to your email");
        setForgotMode(false);
        return;
      }

      if (formData.remember) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setCurrentUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success("✅ Login successful");

      setTimeout(() => {
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      }, 1000);

    } catch (err) {
      toast.error(err.message.includes('credentials') ? "❌ Invalid credentials" : "❗ Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <ToastContainer position="top-right" autoClose={2500} />
      <div className="login-form-container">
        <h2>{forgotMode ? 'Forgot Password' : 'Login'}</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-with-icon">
            <span className="icon">📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {!forgotMode && (
            <div className="input-with-icon">
              <span className="icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          )}

          {!forgotMode && (
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                id="remember"
              />
              <label className="form-check-label" htmlFor="remember">
                Remember me
              </label>
            </div>
          )}

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? (forgotMode ? 'Sending...' : 'Logging in...') : (forgotMode ? 'Send Reset Link' : 'Login')}
          </button>
        </form>

        <div className="text-center mt-3">
          <button
            className="btn btn-link"
            onClick={() => setForgotMode((prev) => !prev)}
          >
            {forgotMode ? '← Back to Login' : 'Forgot Password?'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
