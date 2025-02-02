import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../Components/socket';
import zoom from '../assets/zoom__logo.png';
import '../assets/CSS/Home.css';
import { MediaStreamContext } from '../context/MediaStreamContext';
import { usePeer } from '../context/PeerContext';

const JoinMeeting = () => {
  const [meetingId, setMeetingId] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [rememberName, setRememberName] = useState(false);
  const [noAudio, setNoAudio] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const navigate = useNavigate();
  const { getMediaStream } = useContext(MediaStreamContext);
  const { createPeerInstance } = usePeer();

  const handleJoinRoom = (peerInstance) => {
    if (!meetingId || !peerInstance || !peerInstance.id) {
      alert('Please enter a valid room ID and ensure Peer ID is available.');
      return;
    }
  
    socket.emit('joinRoom', { meetingId, peerId: peerInstance.id, userName });

    socket.emit('userJoined', { meetingId, userId: peerInstance.id, userName });

    navigate(`/room/${meetingId}?userName=${userName}&noAudio=${noAudio}&noVideo=${noVideo}`);
  };
  

  const handleJoin = async () => {
    if (!meetingId.trim() || !userName.trim()) {
      alert('Please fill out all fields.');
      return;
    }
  
    if (rememberName) {
      localStorage.setItem('userName', userName);
    }
  
    socket.emit('setUsername', userName);
  
    await getMediaStream(noAudio, noVideo);
  
    try {
      const peerInstance = await createPeerInstance();
  
      if (!peerInstance.id) {
        alert('Peer ID is not available. Please try again.');
        return;
      }
  
      handleJoinRoom(peerInstance);
    } catch (error) {
      console.error('Error creating Peer instance:', error);
      alert('An error occurred while connecting to the peer server. Please try again.');
    }
  };
  
  const handleNavigateDashboard = () => {
    navigate('/dashboard');
  }
  

  return (
    <div className='mt-0'>
      <div className='d-flex bg-secondary-subtle px-3 mx-0 gap-3 top--section'>
        <img src={zoom} alt='Zoom Logo' />
        <p>Zoom Workplace</p>
      </div>
      <div className='mx-auto mt-5 joining'>
        <h2>Join a Meeting</h2>
        <div className='form-group'>
          <label htmlFor='meetingId'>Meeting ID</label>
          <input
            type='text'
            className='form-control'
            id='meetingId'
            placeholder='Enter Meeting ID'
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
          />
        </div>
        <div className='form-group'>
          <label htmlFor='userName'>Your Name</label>
          <input
            type='text'
            className='form-control'
            id='userName'
            placeholder='Enter Your Name'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className='form-check'>
          <input
            type='checkbox'
            className='form-check-input'
            id='rememberName'
            checked={rememberName}
            onChange={() => setRememberName(prev => !prev)}
          />
          <label className='form-check-label' htmlFor='rememberName'>
            Remember my name for future meetings
          </label>
        </div>
        <div className='form-check'>
          <input
            type='checkbox'
            className='form-check-input'
            id='noAudio'
            checked={noAudio}
            onChange={() => setNoAudio(prev => !prev)}
          />
          <label className='form-check-label' htmlFor='noAudio'>
            Don’t connect to audio
          </label>
        </div>
        <div className='form-check'>
          <input
            type='checkbox'
            className='form-check-input'
            id='noVideo'
            checked={noVideo}
            onChange={() => setNoVideo(prev => !prev)}
          />
          <label className='form-check-label' htmlFor='noVideo'>
            Don’t connect to video
          </label>
        </div>
        <button className="btn btn-primary" onClick={handleJoin}>
          Join Meeting
        </button>
      </div>
      <button className='ms-5 mt-5 btn bg-black text-white' onClick={handleNavigateDashboard}>Back</button>
    </div>
  );
};

export default JoinMeeting;


