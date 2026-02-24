import React, { useState } from "react";
import { FaTimes, FaStar } from "react-icons/fa";
import "./RatingModal.css";

const RatingModal = ({ isOpen, courseId, courseTitle, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({
        courseId,
        rating,
        comment,
      });
      setRating(0);
      setComment("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h2>Rate Course</h2>
          <button className="rating-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rating-modal-body">
          <p className="rating-course-title">{courseTitle}</p>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`rating-star ${
                  star <= (hoveredRating || rating) ? "active" : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <FaStar />
              </button>
            ))}
          </div>

          <p className="rating-value">{rating > 0 ? `${rating} Star${rating > 1 ? "s" : ""} ` : ""}</p>

          <textarea
            className="rating-comment"
            placeholder="Share your feedback (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
          />
        </div>

        <div className="rating-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
