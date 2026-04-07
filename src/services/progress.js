import API from './api';
import { getCurrentUser } from "../utils/auth";

export async function saveProgress(progress) {
  const current = getCurrentUser();
  if (!progress.username) progress.username = current?.username || current?.email || current?.name || progress.username;
  const res = await API.post('/student/progress', progress);
  return res.data;
}

export async function myProgress() {
  const current = getCurrentUser();
  const username = current?.username || current?.email || current?.name || '';
  const res = await API.get('/student/progress/mine' + (username ? `?username=${encodeURIComponent(username)}` : ''));
  return res.data;
}

export async function courseAnalytics(courseId) {
  const res = await API.get(`/instructor/progress/${courseId}/analytics`);
  return res.data;
}
