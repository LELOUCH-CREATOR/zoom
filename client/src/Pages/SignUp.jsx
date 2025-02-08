import React, { useState } from 'react';
import { FaApple, FaGoogle, FaFacebook } from 'react-icons/fa';
import '../assets/CSS/SignUp.css';
import { FiCheckCircle, FiChevronLeft } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import zoom from '../assets/zoom__logo.png';
import { auth } from '../firebaseConfig'; 
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Import Firebase auth methods

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Error signing up:', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in with Google:', user);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <div className="signup-container">
      <div className='d-flex bg-secondary-subtle px-3 mx-0 gap-3 top--section'>
        <img src={zoom} alt='' />
        <p>Zoom Workplace</p>
      </div>
      <h2 className="text-center my-2">Let's Get Started</h2>
      <div className="signup-content py-2 mx-auto">
        <div className="left-side mx-3 bg-white p-2 shadow">
          <h4>Create your free Basic account</h4>
          <ul>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Unlimited meetings for up to 40 minutes and 100 participants each</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Automated captions to help make meetings more inclusive</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Secure, HD-quality audio and video</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> 3 editable whiteboards</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Team Chat for collaboration, file sharing, and more</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Zoom Mail and Calendar in the Zoom app</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Notes for creating and sharing editable documents</li>
            <li><span className='ticks me-3'><FiCheckCircle/></span> Screen sharing, virtual backgrounds, breakout rooms, and local recording</li>
          </ul>
        </div>
        
        <div className="right-side bg-white px-3">
          <form onSubmit={handleSubmit}>
            <div className="form-group my-2">
              <label htmlFor="name">Name</label>
              <input type="text" className="form-control" id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group my-2">
              <label htmlFor="email">Email address</label>
              <input type="email" className="form-control" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group my-2">
              <label htmlFor="password">Password</label>
              <input type="password" className="form-control" id="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary w-100 my-2">Continue</button>
            <p>By proceeding, I agree to Zoom's Privacy Statement and Terms of Service.</p>
          </form>

          <div className="text-center">
            <p>Or sign up with:</p>
            <div className="social-login-buttons d-flex justify-content-around my-2">
              <button className="btn" onClick={handleGoogleSignIn}><FaGoogle className="social-icon" size={20} title="Sign up with Google" /></button>
              <button className="btn"><FaFacebook className="social-icon" size={20} title="Sign up with Facebook" /></button>
              <button className="btn"><FaApple className="social-icon" size={20} title="Sign up with Apple" /></button>
            </div>
          </div>
          <p className="text-center text-muted mt-2">
            Zoom is protected by reCAPTCHA and the Privacy Policy and Terms of Service apply.
          </p>
        </div>
      </div>
      <div className='d-flex btm my-3 mx-3 px-3 justify-content-between'>
        <Link to='/'><p><FiChevronLeft/> Back</p></Link>
        <p>Already have an account? <Link to='/signin'><span className='text-primary cursor-pointer'>Sign in</span></Link></p>
      </div>
    </div>
  );
};

export default SignUp;
