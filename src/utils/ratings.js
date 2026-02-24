/**
 * Course ratings and reviews
 */

const RATINGS_KEY = "lms_ratings";

export const createRating = ({
  id = String(Date.now()),
  courseId = "",
  studentId = "",
  studentName = "",
  stars = 5,
  feedback = "",
  createdAt = new Date().toISOString(),
}) => ({
  id,
  courseId,
  studentId,
  studentName,
  stars,
  feedback,
  createdAt,
});

export const getRatings = (filters = {}) => {
  try {
    let ratings = JSON.parse(localStorage.getItem(RATINGS_KEY) || "[]");
    
    if (filters.courseId) {
      ratings = ratings.filter((r) => r.courseId === filters.courseId);
    }
    if (filters.studentId) {
      ratings = ratings.filter((r) => r.studentId === filters.studentId);
    }
    
    return ratings;
  } catch {
    return [];
  }
};

export const saveRating = (ratingData) => {
  try {
    const all = JSON.parse(localStorage.getItem(RATINGS_KEY) || "[]");
    const exists = all.findIndex((r) => r.id === ratingData.id);
    
    if (exists >= 0) {
      all[exists] = ratingData;
    } else {
      all.push(ratingData);
    }
    
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
    return ratingData;
  } catch {
    return null;
  }
};

export const getAverageRating = (courseId) => {
  const ratings = getRatings({ courseId });
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

export const getRatingCount = (courseId) => {
  return getRatings({ courseId }).length;
};
