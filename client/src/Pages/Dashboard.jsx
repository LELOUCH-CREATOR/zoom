import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo, faPlus, faCalendarAlt, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import '../assets/CSS/Dashboard.css'
import { useNavigate } from "react-router-dom";
import socket from '../Components/socket';

const Dashboard = () => {
  const [meetingId, setMeetingId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMeetingId, setShowMeetingId] = useState(false);
  const navigate = useNavigate();

  const handleNewMeeting = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/generate-meeting-id');
      const data = await response.json();
      setMeetingId(data.meetingId);
      setCopied(false);
      setShowMeetingId(true);
  
      socket.emit("createRoom", data.meetingId);
  
      setTimeout(() => {
        setShowMeetingId(false);
        setCopied(false);
      }, 10000);
    } catch (error) {
      console.error('Error generating meeting ID:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(meetingId);
    setCopied(true);

    // Hide the "Copied to clipboard" message after 10 seconds
    setTimeout(() => {
      setCopied(false);
    }, 10000);
  };

  const handleJoinMeeting = () => {
    navigate('/join-meeting');
  };
  
  const handleScheduleMeeting = () => {
    navigate('/schedule');
  }

  return (
    <div className="dashboard-container">
      <div className="row">
        <div className="col">
          <div className="dashboard-item new-meeting" onClick={handleNewMeeting}>
            <FontAwesomeIcon icon={faVideo} className="icon" />
            <p>New Meeting</p>
          </div>
        </div>
        <div className="col" onClick={handleJoinMeeting}>
          <div className="dashboard-item bg-primary">
            <FontAwesomeIcon icon={faPlus} className="icon" />
            <p>Join Meeting</p>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div onClick={handleScheduleMeeting} className="dashboard-item bg-primary">
            <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
            <p>Schedule Meeting</p>
          </div>
        </div>
        <div className="col">
          <div className="dashboard-item bg-primary">
            <FontAwesomeIcon icon={faArrowUp} className="icon" />
            <p>Share Screen</p>
          </div>
        </div>
      </div>

      {showMeetingId && (
        <div className="meeting-id-section">
          <p className="text-white">Meeting ID: {meetingId}</p>
          <button onClick={handleCopy}>Copy Meeting ID</button>
          {copied && <span className="text-white">Copied to clipboard!</span>}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
