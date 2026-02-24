import React, { useState, useMemo } from "react";
import { FaTimes, FaEnvelope, FaReply } from "react-icons/fa";
import "./MessageInbox.css";

const MessageInbox = ({ isOpen, onClose, messages = [], currentUserId = "" }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState("");

  const unreadMessages = useMemo(
    () => messages.filter((m) => !m.read),
    [messages]
  );

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      // Mark as read logic would go here
    }
  };

  const handleSendReply = () => {
    if (reply.trim()) {
      // Send reply logic would go here
      setReply("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="message-inbox-overlay" onClick={onClose}>
      <div className="message-inbox" onClick={(e) => e.stopPropagation()}>
        <div className="inbox-header">
          <h2>Messages</h2>
          <button className="inbox-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="inbox-container">
          <div className="inbox-list">
            {messages.length === 0 ? (
              <div className="inbox-empty">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`inbox-item ${selectedMessage?.id === msg.id ? "active" : ""} ${!msg.read ? "unread" : ""}`}
                  onClick={() => handleSelectMessage(msg)}
                >
                  <div className="inbox-item-header">
                    <strong>{msg.fromName}</strong>
                    <span className="inbox-date">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="inbox-item-subject">{msg.subject}</div>
                  {!msg.read && <div className="unread-badge"></div>}
                </div>
              ))
            )}
          </div>

          {selectedMessage && (
            <div className="inbox-detail">
              <div className="detail-header">
                <h3>{selectedMessage.subject}</h3>
                <p className="from-name">From: {selectedMessage.fromName}</p>
                <span className="detail-date">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="detail-body">
                <p>{selectedMessage.content}</p>
              </div>

              <div className="detail-reply">
                <textarea
                  placeholder="Write a reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows="3"
                />
                <button
                  className="reply-btn"
                  onClick={handleSendReply}
                  disabled={!reply.trim()}
                >
                  <FaReply /> Send Reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInbox;
