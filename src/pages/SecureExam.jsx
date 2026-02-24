import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@utils/auth";
import {
  detectSEBClient,
  getLatestSecureExamAttempt,
  getRandomizedExamQuestions,
  getSecureExamForStudent,
  logSecureExamActivity,
  startSecureExamAttempt,
  submitSecureExamAttempt,
  updateSecureExamAttemptAnswers,
} from "@utils/secureExam";
import "./SecureExam.css";

const formatTime = (seconds) => {
  const clamped = Math.max(0, seconds);
  const min = Math.floor(clamped / 60)
    .toString()
    .padStart(2, "0");
  const sec = (clamped % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
};

function SecureExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(), []);
  const studentId = user?.id;
  const isSEB = useMemo(() => detectSEBClient(), []);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [submittedAttempt, setSubmittedAttempt] = useState(null);

  useEffect(() => {
    if (!studentId) {
      navigate("/login", { replace: true });
      return;
    }

    const examData = getSecureExamForStudent(examId, studentId);
    if (!examData) {
      setStatusMessage("This secure exam is not assigned to your account.");
      return;
    }

    if (examData.enabledSEB && !isSEB) {
      setStatusMessage("Access Denied. Open this exam in Safe Exam Browser (SEB).");
      return;
    }

    const randomizedQuestions = getRandomizedExamQuestions({ exam: examData, studentId });
    const activeAttempt =
      getLatestSecureExamAttempt({ examId, studentId }) ||
      startSecureExamAttempt({
        examId,
        studentId,
        userAgent: navigator.userAgent,
        isSEB,
      });

    setExam(examData);
    setQuestions(randomizedQuestions);
    setAttempt(activeAttempt);
    setAnswers(activeAttempt.answers || {});

    const duration = Number(examData.durationMinutes || 60) * 60;
    const elapsed = Math.floor((Date.now() - new Date(activeAttempt.startedAt).getTime()) / 1000);
    setRemainingSeconds(Math.max(0, duration - elapsed));

    document.documentElement.requestFullscreen?.().catch(() => {});
  }, [examId, isSEB, navigate, studentId]);

  useEffect(() => {
    if (!attempt || !exam || submittedAttempt) return undefined;

    const interval = window.setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          const finalAttempt = submitSecureExamAttempt({
            attemptId: attempt.id,
            exam,
            reason: "time_expired",
          });
          setSubmittedAttempt(finalAttempt);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [attempt, exam, submittedAttempt]);

  useEffect(() => {
    if (!attempt || !exam || submittedAttempt) return undefined;

    const preventAction = (event) => {
      event.preventDefault();
    };

    const onCopyPaste = (event) => {
      event.preventDefault();
      logSecureExamActivity({
        attemptId: attempt.id,
        event: "copy_paste_blocked",
        details: event.type,
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        logSecureExamActivity({
          attemptId: attempt.id,
          event: "focus_lost",
          details: "Document hidden or tab switched",
        });

        if (exam.autoSubmitOnFocusLoss) {
          const finalAttempt = submitSecureExamAttempt({
            attemptId: attempt.id,
            exam,
            reason: "focus_lost",
          });
          setSubmittedAttempt(finalAttempt);
        }
      }
    };

    const onBlur = () => {
      logSecureExamActivity({
        attemptId: attempt.id,
        event: "window_blur",
        details: "Window lost focus",
      });
      if (exam.autoSubmitOnFocusLoss) {
        const finalAttempt = submitSecureExamAttempt({
          attemptId: attempt.id,
          exam,
          reason: "window_blur",
        });
        setSubmittedAttempt(finalAttempt);
      }
    };

    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("copy", onCopyPaste);
    document.addEventListener("cut", onCopyPaste);
    document.addEventListener("paste", onCopyPaste);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("copy", onCopyPaste);
      document.removeEventListener("cut", onCopyPaste);
      document.removeEventListener("paste", onCopyPaste);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [attempt, exam, submittedAttempt]);

  const handleAnswerChange = (questionId, optionIndex) => {
    if (!attempt || submittedAttempt) return;
    const nextAnswers = { ...answers, [questionId]: optionIndex };
    setAnswers(nextAnswers);
    const updated = updateSecureExamAttemptAnswers({
      attemptId: attempt.id,
      answers: { [questionId]: optionIndex },
    });
    if (updated) {
      setAttempt(updated);
    }
  };

  const handleSubmit = () => {
    if (!attempt || !exam || submittedAttempt) return;
    const confirmed = window.confirm("Submit exam now? You cannot re-enter after submission.");
    if (!confirmed) return;

    const finalAttempt = submitSecureExamAttempt({
      attemptId: attempt.id,
      exam,
      reason: "submitted",
    });
    setSubmittedAttempt(finalAttempt);
  };

  if (statusMessage) {
    return (
      <div className="secure-exam-denied">
        <h1>Secure Exam Access</h1>
        <p>{statusMessage}</p>
        <button onClick={() => navigate("/student")}>Return to Dashboard</button>
      </div>
    );
  }

  if (!exam || !attempt) {
    return (
      <div className="secure-exam-loading">
        <p>Loading secure exam environment...</p>
      </div>
    );
  }

  if (submittedAttempt) {
    return (
      <div className="secure-exam-submitted">
        <h1>Exam Submitted</h1>
        <p>Your exam has been securely submitted.</p>
        <p>
          Score: <strong>{submittedAttempt.score}%</strong>
        </p>
        <p>Submission reason: {submittedAttempt.submittedReason}</p>
        <button onClick={() => navigate("/student")}>Back to Dashboard</button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="secure-exam-root">
      <header className="secure-exam-header">
        <div>
          <h1>{exam.title}</h1>
          <p>{exam.description || "Secure university examination"}</p>
        </div>
        <div className="secure-exam-timer">Time Left: {formatTime(remainingSeconds)}</div>
      </header>

      <main className="secure-exam-body">
        <aside className="secure-exam-nav">
          <h3>Questions</h3>
          <div className="secure-exam-nav-grid">
            {questions.map((question, index) => {
              const answered = answers?.[question.id] !== undefined;
              return (
                <button
                  key={question.id}
                  className={`secure-exam-nav-item ${currentQuestionIndex === index ? "active" : ""} ${
                    answered ? "answered" : ""
                  }`}
                  onClick={() => setCurrentQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <button className="secure-submit-btn" onClick={handleSubmit}>
            Submit Exam
          </button>
        </aside>

        <section className="secure-exam-question-panel">
          <h2>
            Question {currentQuestionIndex + 1} of {questions.length}
          </h2>
          <p className="secure-question-text">{currentQuestion?.text}</p>

          <div className="secure-options">
            {(currentQuestion?.options || []).map((option, optionIndex) => (
              <label key={`${currentQuestion.id}-${optionIndex}`} className="secure-option-item">
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  checked={answers?.[currentQuestion.id] === optionIndex}
                  onChange={() => handleAnswerChange(currentQuestion.id, optionIndex)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className="secure-question-actions">
            <button
              onClick={() => setCurrentQuestionIndex((previous) => Math.max(0, previous - 1))}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentQuestionIndex((previous) => Math.min(questions.length - 1, previous + 1))
              }
              disabled={currentQuestionIndex === questions.length - 1}
            >
              Next
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SecureExam;
