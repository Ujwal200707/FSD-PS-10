import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import { ALL_ROLES } from "../../constants/roles";
import {
  getRegisteredUsers,
  setRegisteredUsers,
} from "../../utils/auth";
import { register as apiRegister } from "../../services/auth.js";

const roles = ALL_ROLES;

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const confirm = form.confirm;
    const role = form.role;

    if (!email || !password || !confirm || !role) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const users = getRegisteredUsers();

      const nameFromEmail = email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const username = nameFromEmail.replace(/\s+/g, "_").toLowerCase();

      console.log("Calling backend API...");

      // ✅ MAIN API CALL
      const resp = await apiRegister({
        username,
        email,
        password,
        role,
      });

      console.log("API response:", resp);

      const createdUser = resp;
      // normalize role for frontend (backend returns roles set)
      const primaryRole = createdUser.role
        || (Array.isArray(createdUser.roles) && createdUser.roles[0])
        || (createdUser.roles && Object.values(createdUser.roles)[0])
        || role;
      createdUser.role = String(primaryRole).toLowerCase();

      setRegisteredUsers([...users, createdUser]);
      setSuccess(true);

    } catch (err) {
      console.error("API ERROR:", err);
      // fallback: persist locally so user can log in locally
      const newUser = {
        id: String(Date.now()),
        email,
        name: nameFromEmail,
        password,
        role,
      };
      setRegisteredUsers([...users, newUser]);
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessRedirect = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="auth-page">
      <section className="auth-left">
        <div className="auth-panel">
          <h1>Join EDULMS</h1>
          <p>Create your account and start with a role-specific workspace.</p>
        </div>
      </section>

      <section className="auth-right">
        <form className="auth-card" onSubmit={onSubmit}>
          <h2>Create Account</h2>

          {success ? (
            <>
              <div className="auth-success">
                User created successfully! You can now login.
              </div>
              <button
                type="button"
                className="auth-btn"
                onClick={handleSuccessRedirect}
              >
                Go to Login
              </button>
            </>
          ) : (
            <>
              {error && <div className="auth-error">{error}</div>}

              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setField("confirm", e.target.value)}
                />
              </div>

              <div className="auth-field">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                >
                  <option value="">Select role</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="auth-btn"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Account"}
              </button>
            </>
          )}

          <p style={{ marginTop: 12 }}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Register;