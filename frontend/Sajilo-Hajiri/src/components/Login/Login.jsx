import React, { useState } from "react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

      const res = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Logged in successfully");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500); // Adjust delay if needed


        // You can store user info to localStorage or context if needed
        console.log("User data:", data.user);
        // e.g., localStorage.setItem("user", JSON.stringify(data.user));
      } else if (res.status === 403) {
        setMessage("⚠️ Your account is not approved yet.");
      } else if (res.status === 401) {
        setMessage("❌ Incorrect Username / Password");
      } else {
        setMessage("⚠️ " + (data.error || "Login failed. Please try again."));
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("❗ Something went wrong. Try again.");
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
