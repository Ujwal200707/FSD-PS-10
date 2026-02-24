import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBook,
  FaChartLine,
  FaChevronDown,
  FaLinkedin,
  FaLock,
  FaPlay,
  FaShieldHalved,
  FaUsers,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { getCurrentUser } from "@utils/auth";
import "./Home.css";

const navItems = [
  { id: "features", label: "Features" },
  { id: "roles", label: "Roles" },
  { id: "statistics", label: "Statistics" },
  { id: "cta", label: "Contact" },
];

const featureCards = [
  {
    icon: <FaShieldHalved />,
    title: "Role-Based Access",
    description: "Granular permissions for institutional governance and secure operations.",
  },
  {
    icon: <FaBook />,
    title: "Course Management",
    description: "Create, organize, and deliver learning journeys with reusable content blocks.",
  },
  {
    icon: <FaChartLine />,
    title: "Analytics Dashboard",
    description: "Track engagement, performance, and adoption with actionable visual insights.",
  },
  {
    icon: <FaLock />,
    title: "Secure Authentication",
    description: "Protected sessions, password recovery, and trusted access controls.",
  },
];

const roleCards = [
  {
    title: "Admin",
    description: "Govern users, roles, reporting, and platform compliance from one control center.",
  },
  {
    title: "Instructor",
    description: "Publish courses, grade submissions, and monitor learner outcomes efficiently.",
  },
  {
    title: "Student",
    description: "Enroll, submit assignments, review progress, and stay informed with notifications.",
  },
  {
    title: "Content Creator",
    description: "Build multimedia lessons and collaborate with instructors to maintain quality.",
  },
];

const trustStats = [
  { value: "10,000+", label: "Students" },
  { value: "500+", label: "Courses" },
  { value: "120+", label: "Instructors" },
  { value: "99.9%", label: "Uptime" },
];

const rolePills = [
  { key: "admin", label: "Admin" },
  { key: "teacher", label: "Instructor" },
  { key: "student", label: "Student" },
  { key: "content", label: "Content Creator" },
];

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("features");
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      const roleHomeMap = {
        admin: "/admin",
        teacher: "/instructor",
        student: "/student",
        content: "/content-creator",
      };
      navigate(roleHomeMap[currentUser.role] || "/student", { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);

      const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);
      const current = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 140 && rect.bottom >= 140;
      });
      if (current?.id) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="home-premium">
      <header className={`home-nav ${scrolled ? "solid" : ""}`}>
        <div className="home-container nav-shell">
          <div className="brand-wrap">
            <div className="brand-mark">E</div>
            <h1 className="brand-text">EduLMS</h1>
          </div>

          <nav className="menu-links" aria-label="Main navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`menu-link ${activeSection === item.id ? "active" : ""}`}
                onClick={() => scrollToSection(item.id)}
              >
                {item.label}
              </button>
            ))}
            <Link to="/login" className="menu-login">
              Login
            </Link>
            <Link to="/login" className="btn-nav-primary">
              Sign in Securely
            </Link>
          </nav>
        </div>
      </header>

      <section className="hero-section">
        <div className="home-container hero-grid">
          <div className="hero-copy">
            <p className="hero-tag">Enterprise-ready learning platform</p>
            <h2>Transform Online Education with EduLMS</h2>
            <p className="hero-subtitle">
              Deliver secure, scalable, and measurable learning experiences for institutions,
              corporate academies, and training organizations.
            </p>

            <div className="hero-buttons">
              <Link to="/login" className="btn-main btn-primary-main">
                Get Started <FaArrowRight />
              </Link>
              <button
                type="button"
                className="btn-main btn-secondary-main"
                onClick={() => scrollToSection("features")}
              >
                <FaPlay /> Watch Demo
              </button>
            </div>

            <div className="role-pill-row">
              {rolePills.map((role) => (
                <Link
                  key={role.key}
                  to={`/register?role=${role.key}`}
                  className="role-pill"
                >
                  {role.label}
                </Link>
              ))}
            </div>

            <button
              type="button"
              className="learn-link"
              onClick={() => scrollToSection("features")}
            >
              Learn More <FaChevronDown />
            </button>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="mockup-shell">
              <div className="mockup-header">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="mockup-body">
                <div className="mockup-card">
                  <h4>Platform Analytics</h4>
                  <p>Course completion rate improved by 24% this quarter.</p>
                </div>
                <div className="mockup-row">
                  <div className="mockup-mini">Active Courses: 512</div>
                  <div className="mockup-mini">Live Learners: 3,208</div>
                </div>
              </div>
            </div>
            <div className="floating-card card-a">Instructor Productivity +31%</div>
            <div className="floating-card card-b">Assessment Automation Enabled</div>
          </div>
        </div>
      </section>

      <section id="features" className="section-white">
        <div className="home-container">
          <h3 className="section-title">Built for Institutional Learning Operations</h3>
          <p className="section-subtitle">
            A robust platform architecture that supports governance, pedagogy, and growth.
          </p>
          <div className="feature-grid-premium">
            {featureCards.map((feature) => (
              <article key={feature.title} className="soft-card feature-card-premium">
                <div className="icon-badge">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="section-light">
        <div className="home-container">
          <h3 className="section-title">Role-Based Workspaces</h3>
          <div className="roles-grid">
            {roleCards.map((role) => (
              <article key={role.title} className="soft-card role-card">
                <h4>{role.title}</h4>
                <p>{role.description}</p>
                <Link to="/login" className="explore-link">
                  Explore Dashboard <FaArrowRight />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="statistics" className="section-white">
        <div className="home-container">
          <div className="stats-grid-premium">
            {trustStats.map((stat) => (
              <article key={stat.label} className="soft-card stat-card-premium">
                <h4>{stat.value}</h4>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="cta" className="cta-section">
        <div className="home-container cta-box">
          <h3>Ready to Elevate Your Learning Experience?</h3>
          <p>Launch secure, measurable, and engaging learning workflows with EduLMS.</p>
          <div className="cta-actions">
            <Link to="/register" className="btn-main btn-primary-main">
              Create Account
            </Link>
            <Link to="/login" className="btn-main btn-secondary-main cta-secondary">
              Login
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-container footer-grid">
          <div>
            <div className="brand-wrap footer-brand">
              <div className="brand-mark">E</div>
              <h4 className="brand-text">EduLMS</h4>
            </div>
            <p className="footer-copy">Professional LMS infrastructure for institutions and enterprise training.</p>
          </div>

          <div>
            <h5>Quick Links</h5>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          <div>
            <h5>Contact</h5>
            <p>support@edulms.io</p>
            <p>+1 (800) 555-0123</p>
          </div>

          <div>
            <h5>Connect</h5>
            <div className="social-row">
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="#" aria-label="X"><FaXTwitter /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>
        </div>

        <div className="home-container footer-bottom">
          <p>© 2026 EduLMS. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;