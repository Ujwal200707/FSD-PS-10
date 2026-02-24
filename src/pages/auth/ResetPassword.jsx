import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationTriangle, FaLock } from "react-icons/fa";
import {
  clearPasswordResetData,
  getPasswordResetData,
  getRegisteredUsers,
  normalizeRole,
  setRegisteredUsers,
} from "../../utils/auth";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Validate token
    const resetData = getPasswordResetData() || {};

    if (!resetData.token || resetData.token !== token) {
      setError("Invalid or expired reset token. Please request a new password reset.");
      return;
    }

    if (Date.now() > resetData.expires) {
      setError("Reset link has expired. Please request a new password reset.");
      clearPasswordResetData();
      return;
    }

    setValidToken(true);
  }, [token]);

  const validatePassword = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return {
      minLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError("Password does not meet requirements");
      return;
    }

    setLoading(true);
    setError("");

    // Update user password
    setTimeout(() => {
      const resetData = getPasswordResetData() || {};
      const registeredUsers = getRegisteredUsers();

      const userIndex = registeredUsers.findIndex(
        (u) => u.email === resetData.email && normalizeRole(u.role) === normalizeRole(resetData.role)
      );

      if (userIndex !== -1) {
        registeredUsers[userIndex].password = password;
        setRegisteredUsers(registeredUsers);
        clearPasswordResetData();

        setSuccess(true);
        setLoading(false);

        // Auto redirect after success
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError("User not found. Please try again.");
        setLoading(false);
      }
    }, 2000);
  };

  if (!validToken && !error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <div
          className="shadow-sm card"
          style={{
            maxWidth: "420px",
            width: "100%",
            padding: "40px",
            borderRadius: "15px",
            background: "#fff",
            border: "none",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}
        >
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
          <h3 className="fw-bold mb-3" style={{ color: "#333" }}>
            Password Reset Successful!
          </h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Your password has been updated successfully. You will be redirected to the login page shortly.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn w-100"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              padding: "12px 0",
              borderRadius: "8px",
              fontWeight: "500"
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left Side - Hero */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        color: "#fff",
        position: "relative",
        overflow: "hidden"
      }}>
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
            Set New Password
          </h1>
          <p style={{ fontSize: "1.2rem", opacity: 0.9, lineHeight: "1.6", marginBottom: "30px" }}>
            Create a strong password to secure your account.
          </p>
          <div style={{
            background: "rgba(255,255,255,0.1)",
            padding: "20px",
            borderRadius: "15px",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
              Password Requirements
            </h3>
            <ul style={{ fontSize: "0.9rem", opacity: 0.8, lineHeight: "1.5", textAlign: "left", paddingLeft: "20px" }}>
              <li>At least 8 characters long</li>
              <li>One uppercase letter (A-Z)</li>
              <li>One lowercase letter (a-z)</li>
              <li>One number (0-9)</li>
              <li>One special character (!@#$%^&*)</li>
            </ul>
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
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        background: "#f8f9fa"
      }}>
        <div
          className="shadow-sm card"
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
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px auto"
            }}>
              <FaLock style={{ color: "#fff", fontSize: "1.5rem" }} />
            </div>
            <h3 className="fw-bold mb-2" style={{ color: "#333", fontSize: "1.8rem" }}>
              Reset Password
            </h3>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              Enter your new password below
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
                New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-control mb-2"
                  style={{
                    fontSize: "1rem",
                    padding: "12px 45px 12px 15px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", color: "#333", fontWeight: "500" }}>
                Confirm New Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control mb-2"
                  style={{
                    fontSize: "1rem",
                    padding: "12px 45px 12px 15px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    transition: "border-color 0.3s ease"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#667eea"}
                  onBlur={(e) => e.target.style.borderColor = "#ddd"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "1rem"
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Password strength indicator */}
            {password && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "8px" }}>
                  Password strength:
                </div>
                <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                  {Object.entries(validatePassword(password)).slice(0, 5).map(([key, valid]) => (
                    <div
                      key={key}
                      style={{
                        flex: 1,
                        height: "4px",
                        backgroundColor: valid ? "#10b981" : "#e5e7eb",
                        borderRadius: "2px"
                      }}
                    ></div>
                  ))}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {validatePassword(password).isValid ? "Strong password" : "Password must meet all requirements"}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn w-100 mb-3 fw-semibold"
              style={{
                fontSize: "1.1rem",
                padding: "14px 0",
                borderRadius: "8px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                transition: "all 0.3s ease",
                transform: "translateY(0)",
                cursor: loading ? "not-allowed" : "pointer"
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
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Updating Password...
                </>
              ) : (
                <>
                  <FaLock className="me-2" />
                  Update Password
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
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;