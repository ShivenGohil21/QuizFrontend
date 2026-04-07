import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("API URL not configured. Please check your environment variables.");
      }

      const response = await fetch(`${apiUrl}/auth/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success - OTP sent via Django
        navigate("/verify-otp", { state: { email, type: "login" } });
      } else {
        setError(result.error || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-wrapper">
        <div className="login-left-section">
          <div className="logo-section">
            <div className="logo-badge">
              <div className="logo-badge-dot" />
              <span>Professional Platform</span>
            </div>
            <h1>Exam Portal</h1>
            <p>Secure online examination system</p>
          </div>

          <div className="features-list">
            {[
              "Google Authenticator (2FA)",
              "Real-time Results Tracking",
              "Timed Professional Exams",
              "Secure Password Recovery",
            ].map((f) => (
              <div className="feature-item" key={f}>
                <div className="feature-check">
                  <svg viewBox="0 0 12 12">
                    <polyline points="1.5,6 4.5,9 10.5,3" />
                  </svg>
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-right-section">
          <div className="login-form-container">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account with your credentials</p>

            {error && <div className="error-card" style={{ marginBottom: '20px' }}>{error}</div>}

            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="name@university.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                <span
                  style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  className="btn-header-link"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot your password?
                </span>
                <span
                  style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  className="btn-header-link"
                  onClick={() => navigate("/signup")}
                >
                  Don't have an account? <strong style={{ color: '#3b82f6' }}>Sign Up</strong>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


