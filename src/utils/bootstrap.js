/**
 * Bootstrap sample data for LMS
 */

import { saveCourse, saveAssignment, enrollStudent } from "./courses";
import { saveUser } from "./admin";
import { createNotification, addNotification } from "./notifications";

export const clearClientStorageForFreshBoot = () => {
  // Only clear specific LMS keys, not the entire localStorage
  // This preserves user data between sessions but clears login state
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('lms_') || key === 'currentUser')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const initializeSampleData = () => {
  // Check if already initialized
  const initialized = localStorage.getItem("lms_data_initialized");
  if (initialized) return;

  // Create sample users
  const sampleUsers = [
    {
      id: "u1",
      email: "sarah.johnson@edulms.com",
      name: "Dr. Sarah Johnson",
      password: "password123",
      role: "teacher",
      status: "active",
      joinDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      department: "Computer Science",
    },
    {
      id: "u2",
      email: "michael.chen@edulms.com",
      name: "Prof. Michael Chen",
      password: "password123",
      role: "teacher",
      status: "active",
      joinDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      department: "Data Science",
    },
    {
      id: "u3",
      email: "emma.davis@edulms.com",
      name: "Emma Davis",
      password: "password123",
      role: "content",
      status: "active",
      joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      department: "Curriculum",
    },
    {
      id: "u4",
      email: "alice@edulms.com",
      name: "Alice Johnson",
      password: "password123",
      role: "student",
      status: "active",
      joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "u5",
      email: "bob@edulms.com",
      name: "Bob Smith",
      password: "password123",
      role: "student",
      status: "active",
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "u0",
      email: "admin@edulms.com",
      name: "Admin User",
      password: "password123",
      role: "admin",
      status: "active",
      joinDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      department: "Administration",
    },
  ];

  sampleUsers.forEach((user) => saveUser(user));

  // Create sample courses
  const sampleCourses = [
    {
      id: "c1",
      title: "React Fundamentals",
      description: "Learn the basics of React.js and build modern web applications.",
      instructor: "Dr. Sarah Johnson",
      instructorId: "u1",
      category: "Web Development",
      level: "Beginner",
      duration: "8 weeks",
      price: "Free",
      thumbnail: "⚛️",
      studentsEnrolled: 45,
      rating: 4.8,
      reviews: 120,
      status: "Active",
      modules: [
        { id: 1, title: "Getting Started with React", lessons: 5 },
        { id: 2, title: "Components and Props", lessons: 6 },
        { id: 3, title: "State and Lifecycle", lessons: 7 },
      ],
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c2",
      title: "Python for Data Science",
      description: "Master Python programming concepts for data analysis and visualization.",
      instructor: "Prof. Michael Chen",
      instructorId: "u2",
      category: "Data Science",
      level: "Intermediate",
      duration: "12 weeks",
      price: "Free",
      thumbnail: "🐍",
      studentsEnrolled: 32,
      rating: 4.9,
      reviews: 95,
      status: "Active",
      modules: [
        { id: 1, title: "Python Basics", lessons: 8 },
        { id: 2, title: "NumPy and Pandas", lessons: 10 },
        { id: 3, title: "Data Visualization", lessons: 7 },
      ],
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c3",
      title: "UI/UX Design Principles",
      description: "Learn essential UI/UX design principles and create user-centered designs.",
      instructor: "Dr. Sarah Johnson",
      instructorId: "u1",
      category: "Design",
      level: "Intermediate",
      duration: "6 weeks",
      price: "Free",
      thumbnail: "🎨",
      studentsEnrolled: 28,
      rating: 4.7,
      reviews: 82,
      status: "Active",
      modules: [
        { id: 1, title: "Design Fundamentals", lessons: 6 },
        { id: 2, title: "User Research", lessons: 5 },
        { id: 3, title: "Prototyping", lessons: 5 },
      ],
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "c4",
      title: "Web Development Bootcamp",
      description: "Comprehensive course covering HTML, CSS, JavaScript, and modern frameworks.",
      instructor: "Prof. Michael Chen",
      instructorId: "u2",
      category: "Web Development",
      level: "Beginner",
      duration: "16 weeks",
      price: "Free",
      thumbnail: "💻",
      studentsEnrolled: 67,
      rating: 4.6,
      reviews: 156,
      status: "Active",
      modules: [
        { id: 1, title: "HTML Fundamentals", lessons: 8 },
        { id: 2, title: "CSS Styling", lessons: 10 },
        { id: 3, title: "JavaScript Basics", lessons: 12 },
      ],
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  sampleCourses.forEach((course) => saveCourse(course));

  // Create sample assignments
  const sampleAssignments = [
    {
      id: "a1",
      courseId: "c1",
      title: "Build a Simple React Component",
      description: "Create a reusable React component with props and state management.",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 100,
      status: "Active",
    },
    {
      id: "a2",
      courseId: "c1",
      title: "React Hooks Practice",
      description: "Practice using various React hooks in a project.",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 100,
      status: "Active",
    },
    {
      id: "a3",
      courseId: "c2",
      title: "Data Analysis with Pandas",
      description: "Perform data cleaning and analysis using Pandas.",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 100,
      status: "Active",
    },
    {
      id: "a4",
      courseId: "c3",
      title: "Design a Mobile App Interface",
      description: "Create wireframes and mockups for a mobile application.",
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      points: 150,
      status: "Active",
    },
  ];

  sampleAssignments.forEach((assignment) => saveAssignment(assignment));

  // Enroll students in courses
  enrollStudent("c1", "u4", "alice@edulms.com");
  enrollStudent("c1", "u5", "bob@edulms.com");
  enrollStudent("c2", "u4", "alice@edulms.com");
  enrollStudent("c3", "u5", "bob@edulms.com");

  // Create sample notifications
  const sampleNotifications = [
    {
      type: "announcement",
      title: "New Course Available",
      message: "Check out the new Web Development Bootcamp course!",
      sender: "System",
    },
    {
      type: "assignment_due",
      title: "Assignment Due Soon",
      message: "Your React Component assignment is due in 7 days",
      sender: "Dr. Sarah Johnson",
    },
    {
      type: "course_update",
      title: "Course Updated",
      message: "React Fundamentals has new content this week",
      sender: "Dr. Sarah Johnson",
    },
  ];

  sampleNotifications.forEach((notif) => {
    addNotification("u4", createNotification(notif));
  });

  // Mark as initialized
  localStorage.setItem("lms_data_initialized", "true");
};
