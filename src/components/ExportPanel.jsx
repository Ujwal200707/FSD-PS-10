import React from "react";
import { FaDownload } from "react-icons/fa";
import "./ExportPanel.css";

const ExportPanel = ({ exports = [] }) => {
  return (
    <div className="export-panel">
      <h3>Export Data</h3>
      <div className="export-buttons">
        {exports.map((exp) => (
          <button
            key={exp.id}
            className="export-btn"
            onClick={exp.handler}
            title={exp.description}
          >
            <FaDownload />
            {exp.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExportPanel;
