import API from './api';
import { getCurrentUser } from "../utils/auth";

export async function uploadContent({ courseId, title, type, file, url, uploadedBy }) {
  const current = getCurrentUser();
  const username = uploadedBy || current?.username || current?.email || current?.name || '';
  const form = new FormData();
  form.append('courseId', courseId);
  form.append('title', title);
  form.append('type', type);
  if (file) form.append('file', file);
  if (url) form.append('url', url);
  if (username) form.append('uploadedBy', username);
  const res = await API.post('/instructor/content', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
}

export async function getCourseContent(courseId) {
  const res = await API.get(`/instructor/content/course/${courseId}`);
  return res.data;
}
