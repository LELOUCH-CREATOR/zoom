import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import socket from './socket';
import { MdOutlineAdminPanelSettings } from "react-icons/md";

const AdminTools = () => {
  const { admins, participants } = useAdmin();
  const [showAdminTools, setShowAdminTools] = useState(false);

  useEffect(() => {
    console.log('Admins:', admins);
    console.log('Participants:', participants);
  }, [admins, participants]); 

  const toggleAdminTools = () => {
    setShowAdminTools(!showAdminTools);
  };

  const handleMuteAudio = (userId) => {
    socket.emit('muteAudio', { userId });
  };

  const handleMuteVideo = (userId) => {
    socket.emit('muteVideo', { userId });
  };

  const handleRemoveUser = (userId) => {
    socket.emit('removeUser', { userId });
  };

  const handlePromoteUser = (userId) => {
    socket.emit('promoteUser', { userId });
  };

  const handleEndMeeting = () => {
    socket.emit('endMeeting');
  };

  return (
    <div className="admin-tools">
      <button className='btn text-white' onClick={toggleAdminTools}>
        <MdOutlineAdminPanelSettings /> <br /> Admin Tools
      </button>

      {showAdminTools && (
        <ul className='position-absolute text-start list-group bg-dark text-white admin-modal'>
          {participants.map((participant) => (
            <li key={participant.id} className='text-white bg-dark my-0 py-0 list-group-item border-0'>
              <span className='text-danger'>{participant.name}</span> <br />
              <button className='btn text-white custom-hover' onClick={() => handleMuteAudio(participant.id)}>Mute Audio</button> <br />
              <button  className='btn text-white custom-hover' onClick={() => handleMuteVideo(participant.id)}>Mute Video</button> <br />
              <button  className='btn text-white custom-hover' onClick={() => handleRemoveUser(participant.id)}>Remove User</button> <br />
              {admins.includes(participant.id) ? (
                <span> (Admin)</span>
              ) : (
                <button  className='btn text-white custom-hover' onClick={() => handlePromoteUser(participant.id)}>Make Admin</button>
              )}
            </li>
          ))}

          <li className='text-white bg-dark list-group-item my-0 py-0 border-0'>
            <button className='btn text-white custom-hover' onClick={handleEndMeeting}>End Meeting</button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default AdminTools;
