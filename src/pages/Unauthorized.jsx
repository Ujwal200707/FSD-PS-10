import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #eef2ff 100%)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
          padding: "28px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, color: "#0f172a" }}>Access Restricted</h1>
        <p style={{ marginTop: "10px", color: "#475569" }}>
          You don’t have permission to view this page.
        </p>
        <div style={{ marginTop: "18px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/"
            style={{
              background: "#4f46e5",
              color: "#fff",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Go Home
          </Link>
          <Link
            to="/login"
            style={{
              background: "#e0e7ff",
              color: "#3730a3",
              textDecoration: "none",
              padding: "10px 14px",
              borderRadius: "10px",
              fontWeight: 700,
            }}
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
