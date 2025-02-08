import React, { useState } from "react";
import { FaWindowClose } from "react-icons/fa";

const EndMeetingComponent = ({ handleEndMeeting, handleLeaveRoom }) => {
  const [showEndModal, setShowEndModal] = useState(false);

  const handleEndClick = () => {
    setShowEndModal(!showEndModal);
  };

  const handleCancelEnd = () => {
    setShowEndModal(false);
  };

  return (
    <div className="text-center">
      <button className="btn text-danger" onClick={handleEndClick}>
        <span><FaWindowClose/></span> <br />
        End Meeting
      </button>

      {showEndModal && (
        <div className="leave-modal">
          
          <button className="btn btn-danger" onClick={handleEndMeeting}>
            End the Meeting
          </button>

          
          <button className="btn btn-warning" onClick={handleLeaveRoom}>
            Leave Meeting
          </button>
          <button className="btn btn-secondary" onClick={handleCancelEnd}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default EndMeetingComponent;
