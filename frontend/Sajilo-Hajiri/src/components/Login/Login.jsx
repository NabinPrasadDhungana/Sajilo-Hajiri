import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import Cookies from "js-cookie";
import { authFetch } from '../../Helper/Csrf_token';


export default function Login({ setCurrentUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Pre-fetch CSRF token when component mounts
  useEffect(() => {
    fetch('/api/csrf/', { credentials: 'include' });
  }, []);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("❗ Please fill all fields");
      return;
    }
    if (!validateEmail(email)) {
      setMessage("❗ Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setMessage("❗ Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const res = await authFetch("/api/login/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data.user); // <- this stores user in App
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000); // Adjust delay if needed


        // You can store user info to localStorage or context if needed
        console.log("User data:", data.user);
        // e.g., localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setMessage(
          res.status === 403 ? "⚠️ Your account is not approved yet." :
          res.status === 401 ? "❌ Incorrect Username / Password" :
          `⚠️ ${data.error || "Login failed. Please try again."}`
        );
      }
    } catch (error) {
      setMessage("❗ Something went wrong. Try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Redirect to forgot password page or show modal");
  };

  return (
    <div className="login-wrapper">
      <div className="login-form-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-with-icon">
            <span className="icon" role="img" aria-label="email">📧</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-with-icon">
            <span className="icon" role="img" aria-label="password">🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <div
            className={`alert mt-3 ${
              message.startsWith("✅")
                ? "alert-success"
                : message.startsWith("❌")
                ? "alert-danger"
                : "alert-warning"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
