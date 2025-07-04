// src/components/Auth/PasswordResetForm.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authFetch } from '../../Helper/Csrf_token';

const PasswordResetForm = () => {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const res = await fetch('/api/verify-token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: uidb64, token }),
        });

        if (!res.ok) throw new Error();
        setValid(true);
      } catch {
        toast.error("Invalid or expired link.");
        navigate('/login');
      }
    };
    checkToken();
  }, [uidb64, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.warning("🔒 Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch('/api/set-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: uidb64, token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      toast.success("✅ Password updated!");
      navigate('/login');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!valid) return null;

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h3>Set New Password</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          className="form-control mb-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-success w-100" disabled={submitting}>
          {submitting ? "Updating..." : "Set Password"}
        </button>
      </form>
    </div>
  );
};

export default PasswordResetForm;
