/**
 * Export and reporting utilities
 */

export const generateCSV = (data, headers) => {
  if (!data || data.length === 0) {
    return "";
  }

  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const cell = row[header];
        const escaped = String(cell || "").replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

export const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportGradeReport = (grades, courseName = "Course") => {
  const headers = ["Student ID", "Student Name", "Assignment", "Grade", "Submitted At"];
  const data = grades.map((g) => ({
    "Student ID": g.studentId || "",
    "Student Name": g.studentName || "",
    Assignment: g.assignmentName || "",
    Grade: g.grade || 0,
    "Submitted At": g.submittedAt ? new Date(g.submittedAt).toLocaleDateString() : "",
  }));

  const csv = generateCSV(data, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `grades_${courseName}_${timestamp}.csv`);
};

export const exportUserReport = (users) => {
  const headers = ["User ID", "Email", "Name", "Role", "Status", "Enrolled Date"];
  const data = users.map((u) => ({
    "User ID": u.id || "",
    Email: u.email || "",
    Name: u.name || "",
    Role: u.role || "",
    Status: u.status || "Active",
    "Enrolled Date": u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
  }));

  const csv = generateCSV(data, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `users_${timestamp}.csv`);
};

export const exportEnrollmentReport = (enrollments) => {
  const headers = ["Student ID", "Student Name", "Course Name", "Enrolled Date", "Status", "Grade"];
  const data = enrollments.map((e) => ({
    "Student ID": e.studentId || "",
    "Student Name": e.studentName || "",
    "Course Name": e.courseName || "",
    "Enrolled Date": e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "",
    Status: e.status || "Active",
    Grade: e.grade || "Not Graded",
  }));

  const csv = generateCSV(data, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `enrollments_${timestamp}.csv`);
};

export const exportAssignmentReport = (assignments) => {
  const headers = ["Assignment ID", "Title", "Course", "Due Date", "Total Submissions", "Graded"];
  const data = assignments.map((a) => ({
    "Assignment ID": a.id || "",
    Title: a.title || "",
    Course: a.courseName || "",
    "Due Date": a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "",
    "Total Submissions": a.submissions || 0,
    Graded: a.graded || 0,
  }));

  const csv = generateCSV(data, headers);
  const timestamp = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `assignments_${timestamp}.csv`);
};

export const generateAnalyticsReport = (analytics) => {
  const report = {
    generatedAt: new Date().toISOString(),
    ...analytics,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `analytics_${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};
