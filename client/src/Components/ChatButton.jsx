import React from "react";
import { CiChat1 } from "react-icons/ci";

const ChatButton = ({ toggleChat, unreadCount }) => {
  return (
    <div className="text-center">
      <button className="btn text-white" onClick={toggleChat}>
        <span>
          <CiChat1 />
        </span>{" "}
        <br />
        <span>Chat</span>
        {unreadCount > 0 && (
          <div className="unread-badge">{unreadCount}</div>
        )}
      </button>
    </div>
  );
};

export default ChatButton;
