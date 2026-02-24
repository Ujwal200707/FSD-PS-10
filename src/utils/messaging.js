/**
 * Internal messaging system
 */

const MESSAGES_KEY = "lms_messages";

export const createMessage = ({
  id = String(Date.now()),
  fromId = "",
  fromName = "",
  toId = "",
  toName = "",
  subject = "",
  content = "",
  read = false,
  createdAt = new Date().toISOString(),
}) => ({
  id,
  fromId,
  fromName,
  toId,
  toName,
  subject,
  content,
  read,
  createdAt,
});

export const getMessages = (filters = {}) => {
  try {
    let messages = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
    
    if (filters.userId) {
      messages = messages.filter((m) => m.toId === filters.userId);
    }
    if (filters.conversationWith) {
      messages = messages.filter((m) => m.fromId === filters.conversationWith || m.toId === filters.conversationWith);
    }
    
    return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch {
    return [];
  }
};

export const sendMessage = (messageData) => {
  try {
    const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
    all.push(messageData);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
    return messageData;
  } catch {
    return null;
  }
};

export const markMessageAsRead = (messageId) => {
  try {
    const all = JSON.parse(localStorage.getItem(MESSAGES_KEY) || "[]");
    const msg = all.find((m) => m.id === messageId);
    if (msg) {
      msg.read = true;
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
    }
    return msg;
  } catch {
    return null;
  }
};

export const getUnreadCount = (userId) => {
  const messages = getMessages({ userId });
  return messages.filter((m) => !m.read).length;
};

export const getConversations = (userId) => {
  const messages = getMessages({ userId });
  const conversations = {};
  
  messages.forEach((msg) => {
    const otherUser = msg.fromId === userId ? msg.fromName : msg.toName;
    if (!conversations[otherUser]) {
      conversations[otherUser] = [];
    }
    conversations[otherUser].push(msg);
  });
  
  return conversations;
};
