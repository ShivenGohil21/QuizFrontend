import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./Login.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { factorId, challengeId: initialChallengeId, type, email } = location.state || {};

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [challengeId, setChallengeId] = useState(initialChallengeId || "");

  useEffect(() => {
    if (!type) {
      navigate("/");
    }
  }, [type, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error("Backend API URL not configured. Please add VITE_API_URL to your Vercel Environment Variables.");
      }
      
      const requestUrl = `${apiUrl}/auth/verify-otp/`;
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
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
        // Success - OTP verified via Django
        if (type === "recovery") {
          navigate("/reset-password", { state: { email } });
        } else {
          // Setting dashboard session info for frontend
          localStorage.setItem("quizUsername", email.split("@")[0]);
          localStorage.setItem("quizEmail", email);
          navigate("/main");
        }
      } else {
        setError(result.error || "Invalid verification code.");
      }
    } catch (err) {
      console.error("Verification context:", {
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
            <h2>{type === 'recovery' ? 'Verify Recovery' : 'Verify Email'}</h2>
            <p className="login-subtitle">
              {`Enter the 6-digit verification code sent to ${email || 'your email'}`}
            </p>

            {error && <div className="error-card" style={{ marginBottom: '20px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>6-Digit Code</label>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <input
                    type="text"
                    maxLength={6}
                    className="form-control form-control-lg"
                    style={{ letterSpacing: '0.6em', textAlign: 'center', fontSize: '24px', fontWeight: '700' }}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-login-primary"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            <button
              className="btn-header-link mt-4"
              style={{ width: '100%', textAlign: 'center', fontSize: '13px' }}
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
