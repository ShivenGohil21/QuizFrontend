import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
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
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email }),
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
        setMessage("A verification code has been sent to your email.");
        // Redirect to OTP verification with the correct type
        setTimeout(() => {
          navigate("/verify-otp", { state: { email, type: 'recovery' } });
        }, 2000);
      } else {
        setError(result.error || "Failed to send recovery code.");
      }
    } catch (err) {
      console.error("Forgot password context:", {
        apiUrl: import.meta.env.VITE_API_URL,
        error: err
      });
      setError(err.message || "An unexpected error occurred connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-page-wrapper" style={{ maxWidth: '500px', minHeight: 'auto' }}>
        <div className="login-right-section" style={{ flex: 1, padding: '48px' }}>
          <div className="login-form-container">
            <h2>Reset Password</h2>
            <p className="login-subtitle">Enter your email to receive a 6-digit verification code</p>

            {error && <div className="error-card" style={{ marginBottom: '20px' }}>{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-login-primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Verification Code"}
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

export default ForgotPassword;
