import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    if (!validateEmail(email)) {
      alert("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    alert(`Logged in with email: ${email}`);
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
              placeholder="Password (min 6 chars)"
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

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
