// src/components/Auth/ForgotPasswordForm.jsx
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authFetch } from '../../Helper/Csrf_token';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email.includes('@')) {
      toast.error("❗ Please enter a valid email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/api/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      toast.success("✅ Reset link sent to your email!");
      setEmail('');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h3>Forgot Password</h3>
      <form onSubmit={handleReset}>
        <input
          type="email"
          placeholder="Enter your registered email"
          className="form-control mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
