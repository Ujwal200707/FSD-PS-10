import React, { useState, useEffect } from "react";
import { FaGraduationCap, FaCalendarAlt, FaUsers, FaStar, FaPlay, FaCheckCircle } from "react-icons/fa";
import "./CourseCard.css";

const CourseCard = ({ course, onEnroll, isEnrolled, progress }) => {
  return (
    <div className="course-card">
      <div className="course-thumbnail">
        <span className="course-emoji">{course.thumbnail || "📚"}</span>
        <div className="course-badge">{course.level}</div>
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-instructor">{course.instructor}</p>
        <p className="course-description">{course.description}</p>

        <div className="course-meta">
          <span className="meta-item">
            <FaCalendarAlt /> {course.duration}
          </span>
          <span className="meta-item">
            <FaUsers /> {course.studentsEnrolled} enrolled
          </span>
          <span className="meta-item">
            <FaStar /> {course.rating}/5
          </span>
        </div>

        {isEnrolled && progress !== undefined && (
          <div className="course-progress">
            <div className="progress-label">
              <span>Progress</span>
              <span className="progress-percent">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        <div className="course-footer">
          <span className="course-price">{course.price}</span>
          {isEnrolled ? (
            <button className="btn-enrolled">
              <FaCheckCircle /> Enrolled
            </button>
          ) : (
            <button className="btn-enroll" onClick={() => onEnroll(course.id)}>
              <FaPlay /> Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
