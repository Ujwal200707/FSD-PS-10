import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { ROLE_LABELS } from "../../constants/roles";
import { getRegisteredUsers, normalizeRole, setPasswordResetData } from "../../utils/auth";
import "./Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [step, setStep] = useState(1); // 1: email input, 2: success message
  const [resetTokenPreview, setResetTokenPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !role) {
      setError("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call to check if user exists
    setTimeout(() => {
      const registeredUsers = getRegisteredUsers();
      const normalizedEmail = email.trim().toLowerCase();
      const user = registeredUsers.find(
        (u) => u.email === normalizedEmail && normalizeRole(u.role) === normalizeRole(role)
      );

      if (!user) {
        setError("No account found with this email and role combination.");
        setLoading(false);
        return;
      }

      // Generate reset token and store temporarily
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const resetData = {
        email: normalizedEmail,
        role,
        token: resetToken,
        expires: Date.now() + (15 * 60 * 1000) // 15 minutes
      };

      setPasswordResetData(resetData);
      setResetTokenPreview(resetToken);

      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const handleResend = () => {
    setStep(1);
    setEmail("");
    setRole("");
    setResetTokenPreview("");
    setError("");
  };

  return (
    <div className="auth-page">
      {/* Left Side - Hero */}
      <div
        className="auth-left"
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "40px",
          color: "#fff",
        }}
      >
        <div style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          fontSize: "2rem",
          fontWeight: "bold",
          color: "#ffd700"
        }}>
          EduLMS
        </div>
        <div style={{ textAlign: "center", maxWidth: "400px", zIndex: 2 }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "20px" }}>
            Reset Password
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, lineHeight: "1.6", marginBottom: "30px" }}>
            {step === 1
              ? "Enter your email address and we'll send you a link to reset your password."
              : "Check your email for password reset instructions."
            }
          </p>
          <div style={{
            background: "rgba(255,255,255,0.1)",
            padding: "20px",
            borderRadius: "15px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
              {step === 1 ? "Secure Password Recovery" : "Email Sent Successfully"}
            </h3>
            <p style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: "1.5" }}>
              {step === 1
                ? "Your account security is our top priority. We'll help you regain access safely."
                : "We've sent a secure reset link to your email. The link will expire in 15 minutes."
              }
            </p>
          </div>
        </div>
        {/* Background decoration */}
        <div style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "200px",
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          filter: "blur(40px)"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "20%",
          left: "15%",
          width: "150px",
          height: "150px",
          background: "rgba(255,215,0,0.2)",
          borderRadius: "50%",
          filter: "blur(30px)"
        }}></div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right" style={{ background: "#f8f9fa", padding: "40px" }}>
        <div
          className="auth-card shadow-sm card"
          style={{
            maxWidth: "420px",
            width: "100%",
            padding: "40px",
            borderRadius: "15px",
            background: "#fff",
            border: "none",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
          }}
        >
          {step === 1 ? (
            <>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <h3 className="fw-bold mb-2" style={{ color: "#333", fontSize: "1.8rem" }}>
                  Forgot Password
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  Enter your email and role to receive reset instructions
                </p>
              </div>

              {error && (
                <div
                  className="mb-3"
                  style={{
                    backgroundColor: "#fee",
                    color: "#c33",
                    padding: "12px 15px",
                    borderRadius: "8px",
                    fontWeight: "500",
                    fontSize: "0.95rem",
                    border: "1px solid #fcc",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                  }}
                >
                  <FaExclamationTriangle />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control mb-3"
                    style={{
                      fontSize: "1rem",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      transition: "border-color 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                    required
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                    Account Type
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="form-select mb-3"
                    style={{
                      fontSize: "1rem",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      color: role ? "#000" : "#888",
                      transition: "border-color 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#667eea"}
                    onBlur={(e) => e.target.style.borderColor = "#ddd"}
                    required
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    {roles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-100 mb-3"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    padding: "11px 14px",
                    minHeight: "46px",
                    borderRadius: "10px",
                    background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    transition: "all 0.3s ease",
                    transform: "translateY(0)",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 5px 15px rgba(102, 126, 234, 0.4)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm" role="status"></div>
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <FaEnvelope />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    color: "#667eea",
                    textDecoration: "none",
                    background: "transparent",
                    border: "none",
                    fontSize: "0.9rem",
                    cursor: "pointer"
                  }}
                >
                  <FaArrowLeft className="me-1" />
                  Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: "30px" }}>
                <div style={{
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px auto"
                }}>
                  <FaCheckCircle style={{ color: "#fff", fontSize: "2rem" }} />
                </div>
                <h3 className="fw-bold mb-2" style={{ color: "#333", fontSize: "1.8rem" }}>
                  Check Your Email
                </h3>
                <p style={{ color: "#666", fontSize: "0.9rem" }}>
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
              </div>

              <div style={{
                background: "#f0f9ff",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #3b82f6",
                marginBottom: "20px"
              }}>
                <h5 style={{ color: "#1e40af", marginBottom: "10px" }}>
                  What happens next?
                </h5>
                <ul style={{ color: "#374151", fontSize: "0.9rem", margin: 0, paddingLeft: "20px" }}>
                  <li>Click the reset link in your email</li>
                  <li>Create a new secure password</li>
                  <li>Return to login with your new password</li>
                  <li>The reset link expires in 15 minutes</li>
                </ul>
              </div>

              <div style={{
                background: "#fef3c7",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #f59e0b",
                marginBottom: "20px"
              }}>
                <p style={{ color: "#92400e", fontSize: "0.9rem", margin: 0 }}>
                  <strong>Didn't receive the email?</strong> Check your spam folder or try again.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={() => navigate(`/reset-password?token=${resetTokenPreview}`)}
                  className="btn me-2"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "500"
                  }}
                >
                  Continue to Reset
                </button>
                <button
                  onClick={handleResend}
                  className="btn me-2"
                  style={{
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "500"
                  }}
                >
                  Try Different Email
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "500"
                  }}
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;