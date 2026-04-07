import API from './api';
import { getCurrentUser } from "../utils/auth";

export async function getAllAssignments() {
  const res = await API.get('/assignments');
  return res.data;
}

export async function createAssignment(payload) {
  const res = await API.post('/assignments', payload);
  return res.data;
}

// submitAssignment now includes studentUsername as a form field (from current user if available)
export async function submitAssignment(id, file, studentUsername) {
  const current = getCurrentUser();
  const username = studentUsername || current?.username || current?.email || current?.name || '';
  const form = new FormData();
  form.append('file', file);
  if (username) form.append('studentUsername', username);
  const res = await API.post(`/assignments/${id}/submit`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function gradeSubmission(subId, grade, feedback) {
  const res = await API.post(`/assignments/submission/${subId}/grade?grade=${grade}` + (feedback ? `&feedback=${encodeURIComponent(feedback)}` : ''));
  return res.data;
}

export async function getSubmissions(assignmentId) {
  const res = await API.get(`/assignments/${assignmentId}/submissions`);
  return res.data;
}
