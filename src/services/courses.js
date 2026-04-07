import API from './api';
import { getCurrentUser } from "../utils/auth";

export async function getAllCourses() {
  const res = await API.get('/courses');
  return res.data;
}

export async function createCourse(course) {
  const res = await API.post('/courses', course);
  return res.data;
}

export async function updateCourse(id, course) {
  const res = await API.put(`/courses/${id}`, course);
  return res.data;
}

export async function deleteCourse(id) {
  const res = await API.delete(`/courses/${id}`);
  return res.data;
}

export async function myCourses() {
  const current = getCurrentUser();
  const username = current?.username || current?.email || current?.name || '';
  const res = await API.get('/courses/mine' + (username ? `?instructorUsername=${encodeURIComponent(username)}` : ''));
  return res.data;
}
