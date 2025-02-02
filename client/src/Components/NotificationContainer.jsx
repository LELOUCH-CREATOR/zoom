import React, { useState, useImperativeHandle, forwardRef } from 'react';
import Notification from './Notification';

const NotificationContainer = forwardRef((props, ref) => {
  const [notifications, setNotifications] = useState([]);

  useImperativeHandle(ref, () => ({
    addNotification: (message) => {
      setNotifications((prev) => [...prev, message]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((msg) => msg !== message));
      }, 30000);
    }
  }));

  const removeNotification = (message) => {
    setNotifications((prev) => prev.filter((msg) => msg !== message));
  };

  return (
    <div>
      {notifications.map((message, index) => (
        <Notification key={index} message={message} onClose={() => removeNotification(message)} />
      ))}
    </div>
  );
});

export default NotificationContainer;
