import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email) {
      setError("Email context missing. Please try the recovery flow again.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiUrl}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, new_password: password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setError(result.error || "Failed to update password.");
      }
    } catch (err) {
      setError("An unexpected error occurred connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-wrapper" style={{ maxWidth: '500px', minHeight: 'auto' }}>
        <div className="login-right-section" style={{ flex: 1, padding: '48px' }}>
          <div className="login-form-container">
            <h2>Set New Password</h2>
            <p className="login-subtitle">Enter your new secure password below</p>

            {error && <div className="error-card" style={{ marginBottom: '20px' }}>{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    role="button"
                    tabIndex={0}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn-login-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>

            <button
              className="btn-header-link mt-4"
              style={{ width: '100%', textAlign: 'center', fontSize: '13px' }}
              onClick={() => navigate("/")}
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
