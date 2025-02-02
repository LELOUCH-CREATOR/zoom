import React from "react";
import {AiOutlineSend} from 'react-icons/ai'

const MessageInput = ({ message, setMessage, sendMessage }) => {
  return (
    <div className="input-group mb-3">
      <input
        type="text"
        className="form-control"
        placeholder="Type here"
        value={message}  
        onChange={(e) => setMessage(e.target.value)}  
      />
      <button className="btn btn-primary " onClick={sendMessage}>
        <AiOutlineSend/>
      </button>
    </div>
  );
};

export default React.memo(MessageInput);
