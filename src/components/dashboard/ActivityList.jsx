import React from "react";
import PropTypes from "prop-types";

// ActivityList: reusable component for recent activities
const ActivityList = ({ activities, loading, error, emptyText }) => {
  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : [];
  return (
    <div className="card shadow-sm p-4 mb-3" style={{ borderRadius: "12px" }}>
      <h5 className="mb-3 fw-semibold">Recent Activity</h5>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-danger">Error loading activity</div>
      ) : safeActivities.length > 0 ? (
        <ul className="list-group list-group-flush">
          {safeActivities.map((item, idx) => (
            <li key={idx} className="list-group-item d-flex justify-content-between">
              <span>{item.text}</span>
              <span className="text-muted" style={{ fontSize: "0.95rem" }}>{item.time}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted">{emptyText || "No recent activity."}</div>
      )}
    </div>
  );
};

ActivityList.propTypes = {
  activities: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.bool,
  emptyText: PropTypes.string,
};

export default ActivityList;
