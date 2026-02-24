import React, { useState, useEffect } from "react";
import { FaBell, FaCheckCircle, FaClock, FaExclamationCircle } from "react-icons/fa";
import { getNotifications, markNotificationAsRead } from "@utils/notifications";
import { getCurrentUser } from "@utils/auth";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      const notifs = getNotifications(currentUser.id);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    }
  }, [currentUser]);

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId);
    const updated = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter((n) => !n.read).length);
  };

  const getIconForType = (type) => {
    if (type === "assignment_due") return <FaClock style={{ color: "#f59e0b" }} />;
    if (type === "grade_posted") return <FaCheckCircle style={{ color: "#10b981" }} />;
    if (type === "announcement") return <FaExclamationCircle style={{ color: "#3b82f6" }} />;
    return <FaBell />;
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
          color: "#6b7280",
        }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            width: "320px",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>
              Notifications ({unreadCount} unread)
            </h4>
          </div>

          {notifications.length > 0 ? (
            <div>
              {notifications.slice(0, 5).map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    background: notif.read ? "transparent" : "#f9fafb",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = notif.read ? "transparent" : "#f9fafb")
                  }
                >
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ marginTop: "2px" }}>{getIconForType(notif.type)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600" }}>
                        {notif.title}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                        {notif.message}
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#9ca3af" }}>
                        {new Date(notif.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#3b82f6",
                          flexShrink: 0,
                        }}
                      ></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
              <p style={{ margin: 0 }}>No notifications yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
