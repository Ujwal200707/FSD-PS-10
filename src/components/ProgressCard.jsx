import React from "react";
import { FaCheckCircle, FaClock } from "react-icons/fa";
import "./ProgressCard.css";

const ProgressCard = ({ course, progress }) => {
  if (!progress) return null;

  const percentage = ((progress.completedLessons / progress.totalLessons) * 100).toFixed(0);
  const isCompleted = progress.completedLessons === progress.totalLessons;

  return (
    <div className="progress-card">
      <div className="progress-card-header">
        <h4>{course?.title}</h4>
        {isCompleted && <FaCheckCircle className="completed-icon" />}
      </div>

      <div className="progress-bar-wrapper">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="progress-text">{percentage}%</span>
      </div>

      <div className="progress-stats">
        <div className="stat">
          <FaClock className="icon" />
          <span>
            {progress.completedLessons} / {progress.totalLessons} Lessons
          </span>
        </div>
        <div className="stat">
          <span className="badge" style={{ background: isCompleted ? "#22c55e" : "#f59e0b" }}>
            {isCompleted ? "Completed" : "In Progress"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;
