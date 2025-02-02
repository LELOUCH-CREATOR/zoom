import React,{useState} from "react";
const LeaveRoomComponent = ({ handleLeaveRoom }) => {
    const [showLeaveModal, setShowLeaveModal] = useState(false);
  
    const handleLeaveClick = () => {
      setShowLeaveModal(!showLeaveModal);
    };
  
    const handleCancelLeave = () => {
      setShowLeaveModal(false);
    };
  
    return (
      <div className="text-center">
        <button className="btn text-danger" onClick={handleLeaveClick}>
          Leave Room
        </button>
  
        {showLeaveModal && (
          <div className="leave-modal">
            <button className="btn btn-danger" onClick={handleLeaveRoom}>
              Leave The Meeting
            </button>
            <button className="btn btn-secondary" onClick={handleCancelLeave}>
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  };
  
  export default LeaveRoomComponent;