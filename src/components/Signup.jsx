import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: OTP & Password
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please enter your name and email.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("Backend API URL not configured. Please add VITE_API_URL to your Vercel Environment Variables.");
      }

      const requestUrl = `${apiUrl}/auth/send-otp/`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", {
          url: requestUrl,
          status: response.status,
          contentType,
          bodySample: text.substring(0, 200)
        });
        throw new Error(`Server returned non-JSON response (${response.status}). This usually means the API URL is incorrect.`);
      }

      const result = await response.json();

      if (response.ok) {
        setMessage("Verification code sent to your email.");
        setStep(2);
      } else {
        setError(result.error || "Failed to send verification code.");
      }
    } catch (err) {
      console.error("Signup OTP context:", {
        apiUrl: import.meta.env.VITE_API_URL,
        error: err
      });
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.otp.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("Backend API URL is not configured.");
      }

      const requestUrl = `${apiUrl}/auth/register/`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
        }),
      });

      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", {
          url: requestUrl,
          status: response.status,
          contentType,
          bodySample: text.substring(0, 200)
        });
        throw new Error(`Server returned non-JSON response (${response.status}). This usually means the API URL is incorrect.`);
      }

      const result = await response.json();

      if (response.ok) {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        // Backend returns error object from serializer
        const errorMsg = result.error || 
                         (result.username ? `Username: ${result.username}` : null) ||
                         (result.email ? `Email: ${result.email}` : null) ||
                         (result.non_field_errors ? result.non_field_errors[0] : null) ||
                         "Registration failed.";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Signup register context:", {
        apiUrl: import.meta.env.VITE_API_URL,
        error: err
      });
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-wrapper" style={{ maxWidth: '1000px' }}>
        <div className="login-left-section">
          <div className="logo-section">
            <div className="logo-badge">
              <div className="logo-badge-dot" />
              <span>Join Us</span>
            </div>
            <h1>Create Account</h1>
            <p>Join the professional exam community today</p>
          </div>
          
          <div className="features-list">
            {["Free Access to Quizzes", "Track Your Progress", "Secure Verification"].map((f) => (
              <div className="feature-item" key={f}>
                <div className="feature-check">
                  <svg viewBox="0 0 12 12"><polyline points="1.5,6 4.5,9 10.5,3" /></svg>
                </div>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="login-right-section">
          <div className="login-form-container">
            <h2>{step === 1 ? "Sign Up" : "Finish Registration"}</h2>
            <p className="login-subtitle">
              {step === 1 
                ? "Enter your details to get started" 
                : "Verify your email and set a password"}
            </p>

            {error && <div className="error-card" style={{ marginBottom: '20px' }}>{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={step === 1 ? handleSendOtp : handleRegister}>
              {step === 1 ? (
                <>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="name"
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="name@university.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Verification Code</label>
                    <input
                      name="otp"
                      type="text"
                      maxLength={6}
                      className="form-control form-control-lg text-center"
                      style={{ letterSpacing: '0.4em' }}
                      placeholder="000000"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      name="password"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn-login-primary"
                disabled={loading}
              >
                {loading ? "Processing..." : (step === 1 ? "Send Code" : "Create Account")}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <span 
                className="btn-header-link" 
                style={{ cursor: 'pointer', fontSize: '13px' }}
                onClick={() => navigate("/")}
              >
                Already have an account? Sign in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
