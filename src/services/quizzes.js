import API from './api';
import { getCurrentUser } from "../utils/auth";

export async function createQuiz(payload) {
  const current = getCurrentUser();
  const createdBy = payload.createdBy || current?.username || current?.email || current?.name || '';
  const res = await API.post('/instructor/quiz' + (createdBy ? `?createdBy=${encodeURIComponent(createdBy)}` : ''), payload);
  return res.data;
}

export async function getQuiz(id) {
  const res = await API.get(`/student/quiz/${id}`);
  return res.data;
}

export async function attemptQuiz(id, answers) {
  const current = getCurrentUser();
  const student = current?.username || current?.email || current?.name || '';
  const res = await API.post(`/student/quiz/${id}/attempt` + (student ? `?studentUsername=${encodeURIComponent(student)}` : ''), answers);
  return res.data;
}

export async function getQuizSubmissions(id) {
  const res = await API.get(`/instructor/quiz/${id}/submissions`);
  return res.data;
}
