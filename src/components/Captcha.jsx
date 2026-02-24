// src/components/Captcha.js
import React, { useEffect, useState, useCallback } from "react";

// Captcha component: generates a case-sensitive code and displays it
const Captcha = ({ onChange }) => {
  const [code, setCode] = useState("");

  // Generate a case-sensitive captcha (letters and numbers)
  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(result);
    if (onChange) onChange(result);
  }, [onChange]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  return (
    <div
      className="captcha-box"
      style={{
        userSelect: "none",
        backgroundColor: "#f3f4f6",
        fontWeight: "700",
        fontSize: "1.4rem",
        letterSpacing: "5px",
        padding: "12px 18px",
        borderRadius: "6px",
        marginBottom: "12px",
        textAlign: "center",
        fontFamily: "monospace",
        color: "#b91c1c",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        transition: "transform 0.1s ease-in-out",
      }}
      onClick={generateCaptcha}
      title="Click to refresh captcha"
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {code}
    </div>
  );
};

export default Captcha;
