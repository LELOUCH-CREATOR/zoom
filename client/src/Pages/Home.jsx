import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/CSS/Home.css';
import zoom from '../assets/zoom__logo.png';
import zoom_text from '../assets/zoom_text-re.png';

const Home = () => {
  const navigate = useNavigate();

  const handleJoinMeetingClick = () => {
    navigate('/join-meeting');
  };

  const handleSignUpClick = () => {
    navigate('/signup');
  };


  return (
    <div className='home'>
      <div className='d-flex mx-3 gap-3 top--section'>
        <img src={zoom} alt='' />
        <p>Zoom Workplace</p>
      </div>
      <div className='bg-primary'>
        <div className='position-relative main--section align-items-center text-center'>
          <img className='img' src={zoom_text} alt='' />
          <p className='position-absolute work--place'>WorkPlace</p>
          <div className='bg-white btns mt-5 mx-auto py-4 text-center px-5'>
            <button className='btn--primary btn bg-primary my-3' onClick={handleJoinMeetingClick}>
              Join a meeting
            </button>
            <br />
            <button className='btn bt border border-secondary my-3' onClick={handleSignUpClick}>Sign up</button>
            <br />
            <button className='btn bt border border-secondary my-3'>Sign in</button>
            <br />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
