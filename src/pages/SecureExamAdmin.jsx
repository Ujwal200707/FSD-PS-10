import React, { useMemo, useState } from "react";
import Layout from "@components/layout/Layout";
import { getCurrentUser } from "@utils/auth";
import { getAllUsers } from "@utils/admin";
import {
  assignSecureExam,
  createSebTemplateConfig,
  deleteSecureExam,
  getSecureExamAssignments,
  getSecureExamAttempts,
  getSecureExams,
  saveSecureExam,
  unassignSecureExam,
} from "@utils/secureExam";
import "./SecureExamAdmin.css";

const defaultQuestions = [
  {
    id: "q1",
    text: "What is the primary purpose of Safe Exam Browser in online exams?",
    options: [
      "Allow students to browse all websites",
      "Create a locked-down examination environment",
      "Enable social media sharing during exam",
      "Bypass LMS authentication",
    ],
    correctOptionIndex: 1,
  },
  {
    id: "q2",
    text: "Which action should be blocked in a secure SEB-enabled exam?",
    options: ["Answer selection", "Question navigation", "Copy-paste", "Exam submission"],
    correctOptionIndex: 2,
  },
  {
    id: "q3",
    text: "What should happen when exam timer reaches zero?",
    options: ["Pause exam", "Auto-save only", "Auto-submit exam", "Restart exam"],
    correctOptionIndex: 2,
  },
];

const downloadTextFile = (filename, content) => {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

function SecureExamAdmin() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [version, setVersion] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationMinutes: 60,
    exitPassword: "",
    sebConfigPassword: "",
    enabledSEB: true,
    autoSubmitOnFocusLoss: true,
  });

  const exams = useMemo(() => getSecureExams(), [version]);
  const students = useMemo(() => getAllUsers().filter((user) => user.role === "student"), [version]);
  const attempts = useMemo(() => getSecureExamAttempts(), [version]);

  const handleCreateExam = (event) => {
    event.preventDefault();
    if (!formData.title.trim()) return;

    const exam = saveSecureExam({
      title: formData.title.trim(),
      description: formData.description.trim(),
      durationMinutes: Number(formData.durationMinutes) || 60,
      enabledSEB: Boolean(formData.enabledSEB),
      autoSubmitOnFocusLoss: Boolean(formData.autoSubmitOnFocusLoss),
      exitPassword: formData.exitPassword,
      sebConfigPassword: formData.sebConfigPassword,
      questions: defaultQuestions.map((q, index) => ({ ...q, id: `${q.id}_${Date.now()}_${index}` })),
      createdBy: currentUser?.id || "admin",
    });

    const template = createSebTemplateConfig({
      examId: exam.id,
      lmsBaseUrl: window.location.origin,
      exitPassword: formData.exitPassword,
      configPassword: formData.sebConfigPassword,
    });

    saveSecureExam({
      ...exam,
      sebConfigFileName: `${exam.id}.seb.json`,
      sebConfigContent: JSON.stringify(template, null, 2),
      allowedUrl: `${window.location.origin}/secure-exam/${exam.id}`,
    });

    setFormData({
      title: "",
      description: "",
      durationMinutes: 60,
      exitPassword: "",
      sebConfigPassword: "",
      enabledSEB: true,
      autoSubmitOnFocusLoss: true,
    });
    setVersion((value) => value + 1);
  };

  const handleUploadConfig = async (event, exam) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const content = await file.text();
    saveSecureExam({
      ...exam,
      sebConfigFileName: file.name,
      sebConfigContent: content,
    });
    setVersion((value) => value + 1);
  };

  const handleAssignToggle = (examId, studentId, assigned) => {
    if (assigned) {
      unassignSecureExam({ examId, studentId });
    } else {
      assignSecureExam({ examId, studentId, assignedBy: currentUser?.id || "admin" });
    }
    setVersion((value) => value + 1);
  };

  const handleDeleteExam = (examId) => {
    deleteSecureExam(examId);
    setVersion((value) => value + 1);
  };

  return (
    <Layout pageTitle="Secure Exam Administration">
      <div className="secure-admin-page">
        <section className="secure-admin-section">
          <h2>Create SEB-Enabled Exam</h2>
          <form className="secure-admin-form" onSubmit={handleCreateExam}>
            <input
              type="text"
              placeholder="Exam title"
              value={formData.title}
              onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <textarea
              placeholder="Exam description"
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
            />
            <input
              type="number"
              min={5}
              max={300}
              value={formData.durationMinutes}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))
              }
              placeholder="Duration (minutes)"
            />
            <input
              type="text"
              placeholder="SEB exit password"
              value={formData.exitPassword}
              onChange={(event) => setFormData((prev) => ({ ...prev, exitPassword: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Optional SEB config password"
              value={formData.sebConfigPassword}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, sebConfigPassword: event.target.value }))
              }
            />
            <label>
              <input
                type="checkbox"
                checked={formData.enabledSEB}
                onChange={(event) => setFormData((prev) => ({ ...prev, enabledSEB: event.target.checked }))}
              />
              Enable SEB-only access
            </label>
            <label>
              <input
                type="checkbox"
                checked={formData.autoSubmitOnFocusLoss}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, autoSubmitOnFocusLoss: event.target.checked }))
                }
              />
              Auto-submit if focus/tab is lost
            </label>
            <button type="submit">Create Secure Exam</button>
          </form>
        </section>

        <section className="secure-admin-section">
          <h2>SEB Exams & Assignments</h2>
          <div className="secure-admin-exam-list">
            {exams.length === 0 && <p>No secure exams created yet.</p>}
            {exams.map((exam) => {
              const examAssignments = getSecureExamAssignments({ examId: exam.id });
              const examAttempts = attempts.filter((attempt) => attempt.examId === exam.id);

              return (
                <article key={exam.id} className="secure-admin-exam-card">
                  <div className="secure-admin-exam-header">
                    <div>
                      <h3>{exam.title}</h3>
                      <p>{exam.description || "No description"}</p>
                      <p className="secure-admin-meta">
                        URL: {window.location.origin}/secure-exam/{exam.id}
                      </p>
                    </div>
                    <div className="secure-admin-actions">
                      <button
                        onClick={() => {
                          const config = exam.sebConfigContent
                            ? exam.sebConfigContent
                            : JSON.stringify(
                                createSebTemplateConfig({
                                  examId: exam.id,
                                  lmsBaseUrl: window.location.origin,
                                  exitPassword: exam.exitPassword,
                                  configPassword: exam.sebConfigPassword,
                                }),
                                null,
                                2
                              );
                          downloadTextFile(exam.sebConfigFileName || `${exam.id}.seb.json`, config);
                        }}
                      >
                        Download SEB Config
                      </button>
                      <label className="upload-label">
                        Upload Config
                        <input type="file" accept=".json,.seb,.txt" onChange={(event) => handleUploadConfig(event, exam)} />
                      </label>
                      <button onClick={() => handleDeleteExam(exam.id)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="secure-admin-grid">
                    <div>
                      <h4>Assign to Students</h4>
                      <div className="secure-student-list">
                        {students.map((student) => {
                          const assigned = examAssignments.some((item) => item.studentId === student.id);
                          return (
                            <label key={`${exam.id}_${student.id}`}>
                              <input
                                type="checkbox"
                                checked={assigned}
                                onChange={() => handleAssignToggle(exam.id, student.id, assigned)}
                              />
                              {student.name} ({student.email})
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4>Attempt Monitoring</h4>
                      {examAttempts.length === 0 && <p>No attempt records yet.</p>}
                      {examAttempts.map((attempt) => {
                        const student = students.find((item) => item.id === attempt.studentId);
                        return (
                          <div key={attempt.id} className="secure-attempt-item">
                            <p>
                              <strong>{student?.name || attempt.studentId}</strong> · {attempt.status}
                            </p>
                            <p>Started: {new Date(attempt.startedAt).toLocaleString()}</p>
                            <p>Finished: {attempt.finishedAt ? new Date(attempt.finishedAt).toLocaleString() : "-"}</p>
                            <p>Score: {attempt.score !== null ? `${attempt.score}%` : "Pending"}</p>
                            <details>
                              <summary>Activity log</summary>
                              <ul>
                                {(attempt.activityLog || []).map((log, index) => (
                                  <li key={`${attempt.id}_${index}`}>
                                    {new Date(log.timestamp).toLocaleString()} · {log.event} · {log.details}
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default SecureExamAdmin;
