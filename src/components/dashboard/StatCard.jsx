import React from "react";
import PropTypes from "prop-types";
import tinycolor from "tinycolor2";

const isLightColor = (hex = "#ffffff") => {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean.padEnd(6, "f").slice(0, 6);

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
};

const StatCard = ({ title, value, icon, color = "#ffffff", subtitle, loading, error }) => {
  const textColor = isLightColor(color) ? "#111827" : "#ffffff";
  const subtitleColor = isLightColor(color) ? "#6b7280" : "#d1d5db";

  // Base styles
  const cardStyle = {
    backgroundColor: color,
    color: textColor,
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.12)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 140,
    maxWidth: 320,
    userSelect: "none",
    fontFamily: "'Inter', sans-serif",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
  };

  const iconWrapperStyle = {
    fontSize: 24,
    marginRight: 14,
    display: "flex",
    alignItems: "center",
  };

  const titleStyle = {
    margin: 0,
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: 0.3,
  };

  const valueStyle = {
    margin: 0,
    fontWeight: 700,
    fontSize: 36,
    lineHeight: 1.1,
  };

  const subtitleStyle = {
    marginTop: 10,
    color: subtitleColor,
    fontSize: 14,
    fontWeight: 500,
  };

  const statusStyle = {
    fontSize: 20,
    fontWeight: 600,
    color: error ? "#dc2626" : textColor,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  // Simple loading and error icons using Unicode symbols
  const loadingIcon = (
    <span role="img" aria-label="loading" style={{ animation: "spin 1s linear infinite" }}>
      ⏳
    </span>
  );
  const errorIcon = <span role="img" aria-label="error">⚠️</span>;

  return (
    <div
      className="stat-card"
      style={cardStyle}
      tabIndex={0}
      aria-live="polite"
      aria-busy={loading}
    >
      <div style={headerStyle}>
        {icon && <span style={iconWrapperStyle}>{icon}</span>}
        <h6 style={titleStyle}>{title}</h6>
      </div>

      {loading ? (
        <div style={statusStyle}>
          {loadingIcon} Loading...
        </div>
      ) : error ? (
        <div style={statusStyle}>
          {errorIcon} Error
        </div>
      ) : (
        <h2 style={valueStyle}>{value}</h2>
      )}

      {subtitle && <small style={subtitleStyle}>{subtitle}</small>}

      {/* Add simple CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg);}
          to { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.node,
  color: PropTypes.string,
  subtitle: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

export default StatCard;