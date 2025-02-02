
import React from 'react';

const Notification = ({ message, onClose }) => {
  return (
    <div className="notification">
      <p>{message}</p>
      <button className='btn btn-primary' onClick={onClose}>Close</button>
    </div>
  );
};

export default Notification;
