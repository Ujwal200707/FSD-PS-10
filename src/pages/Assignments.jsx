import React, { useRef, useState } from "react";
import Layout from "@components/layout/Layout";
import { FaUpload } from "react-icons/fa";
import { submitAssignment } from "../services/assignments";
import { getCurrentUser } from "@utils/auth";
import { getSubmissions } from "@utils/courses";
import "./Assignments.css";

const Assignments = () => {
  const currentUser = getCurrentUser();

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [submittedIds, setSubmittedIds] = useState([]);

  const fileInputRef = useRef(null);

  // ✅ FIXED ARRAY (COMMAs ADDED)
  const assignments = [
    { id: 1, title: "React Assignment", description: "Build a React App" },
    { id: 2, title: "Java Assignment", description: "Create Spring Boot API" },
    { id: 3, title: "Python Assignment", description: "Data Analysis with Pandas" },
    { id: 4, title: "Database Assignment", description: "Design a SQL Database" },
    { id: 5, title: "DevOps Assignment", description: "Set up CI/CD Pipeline" },
    { id: 6, title: "Mobile App Assignment", description: "Build a Flutter App" },
    { id: 7, title: "Machine Learning Assignment", description: "Train a ML Model" },
    { id: 8, title: "Cloud Computing Assignment", description: "Deploy on AWS" },
    { id: 9, title: "Cybersecurity Assignment", description: "Penetration Testing" },
    { id: 10, title: "UI/UX Design Assignment", description: "Design a User Interface" }
  ];

  const role = currentUser?.role ? String(currentUser.role).toLowerCase() : "student";

  // build submission counts per assignment (local storage / mock data)
  const submissions = getSubmissions();
  const submissionCounts = submissions.reduce((acc, s) => {
    const key = String(s.assignmentId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const handleUploadClick = (id) => {
    setSelectedAssignmentId(id);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage("");

      await submitAssignment(
        selectedAssignmentId,
        file,
        currentUser?.username
      );

      setSubmittedIds((prev) => [...prev, selectedAssignmentId]);
      setMessage("Submitted successfully ✅");

    } catch (err) {
      console.error(err);
      setMessage("Submission failed ❌");
    } finally {
      setUploading(false);
      setSelectedAssignmentId(null);
      e.target.value = "";
    }
  };

  return (
    <Layout>
      <div className="assignments-page">
        <h1>Assignments</h1>

        {message && <div className="alert">{message}</div>}

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="assignment-list">
          {assignments.map((a) => (
            <div key={a.id} className="assignment-card">
              <h3>{a.title}</h3>
              <p>{a.description}</p>

              {submittedIds.includes(a.id) ? (
                <span className="submitted">✔ Submitted</span>
              ) : (
                role === "student" ? (
                  <button
                    onClick={() => handleUploadClick(a.id)}
                    disabled={uploading}
                    className="submit-btn"
                  >
                    <FaUpload /> {uploading ? "Uploading..." : "Submit"}
                  </button>
                ) : (
                  <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>{(submissionCounts[String(a.id)] || 0) + ' submissions'}</div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Assignments;