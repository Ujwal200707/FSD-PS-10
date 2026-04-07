import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/auth";
import Captcha from "../../components/Captcha";
import "./Auth.css";
import { ALL_ROLES } from "../../constants/roles";
import { getRoleHome, setCurrentUser } from "../../utils/auth";

const roles = ALL_ROLES;

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
    captcha: "",
  });

  const [captchaCode, setCaptchaCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();
    const password = form.password;
    const role = form.role;
    const captcha = form.captcha.trim();

    // validation
    if (!email || !password || !role || !captcha) {
      setError("All fields are required.");
      return;
    }

    if (captcha !== captchaCode) {
      setError("Captcha is incorrect.");
      return;
    }

    setSubmitting(true);

    try {
      // ✅ CORRECT LOGIN (email-based)
      const res = await login({
        email,
        password
      });

      const user = res?.user || res;

      if (!user) throw new Error("Invalid response");

      // Determine primary role (backend returns `roles` array)
      const primaryRole = user.role
        || (Array.isArray(user.roles) && user.roles[0])
        || (user.roles && Object.values(user.roles)[0])
        || form.role
        || 'student';

      // normalize and attach for UI convenience
      user.role = String(primaryRole).toLowerCase();

      setCurrentUser(user);

      // role-based redirect
      navigate(getRoleHome(user.role), { replace: true });

    } catch (err) {
      console.error(err);

      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError("Login failed. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-left">
        <div className="auth-panel">
          <h1>Welcome Back</h1>
          <p>Sign in securely to continue your learning workflow.</p>
        </div>
      </section>

      <section className="auth-right">
        <form className="auth-card" onSubmit={onSubmit} noValidate>
          <h2>Sign In</h2>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* PASSWORD */}
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField("password", e.target.value)}
            />
          </div>

          {/* ROLE */}
          <div className="auth-field">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setField("role", e.target.value)}
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* CAPTCHA */}
          <div className="auth-field">
            <label>Captcha</label>
            <Captcha onChange={setCaptchaCode} />
            <input
              value={form.captcha}
              onChange={(e) => setField("captcha", e.target.value)}
              placeholder="Enter captcha"
            />
          </div>

          {/* BUTTON */}
          <button className="auth-btn" type="submit" disabled={submitting}>
            {submitting ? "Signing In..." : "Sign In"}
          </button>

          <p style={{ marginTop: 10 }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <p style={{ marginTop: 12 }}>
            New user? <Link to="/register">Create account</Link>
          </p>
        </form>
      </section>
    </div>
  );
}

export default Login;