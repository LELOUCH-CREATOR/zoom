import React, { useState } from 'react';
import { FaApple, FaGoogle, FaFacebook } from 'react-icons/fa';
import '../assets/CSS/SignIn.css';
import { Link, useNavigate } from 'react-router-dom';
import zoom from '../assets/zoom__logo.png';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'; // Import Firebase auth methods

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user);
      navigate('/dashboard'); 
    } catch (error) {
      console.error('Error signing in:', error.message);
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
    <div className="sign-in-container bg-white p-5 shadow mx-auto" style={{ maxWidth: '400px', borderRadius: '8px' }}>
      <div className='d-flex  px-3 mx-0 pb-3 gap-3 top--section'>
        <img src={zoom} alt='' />
        <p>Zoom Workplace</p>
      </div>
      <h2 className="text-center mb-4">Sign In</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            placeholder='Enter Your Email'
          />
        </div>

        <div className="mb-3">
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            placeholder='Enter Your Password'
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 mb-3">Sign In</button>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            checked={keepSignedIn}
            onChange={() => setKeepSignedIn(!keepSignedIn)}
            id="keep-signed-in"
          />
          <label className="form-check-label" htmlFor="keep-signed-in">Keep me signed in</label>
        </div>
      </form>

      <div className="text-center">
        <p>Or sign in with:</p>
        <div className="social-login-buttons d-flex justify-content-around my-2">
          <button className="btn" onClick={handleGoogleSignIn}><FaGoogle className="social-icon" size={20} title="Sign in with Google" /></button>
          <button className="btn"><FaFacebook className="social-icon" size={20} title="Sign in with Facebook" /></button>
          <button className="btn"><FaApple className="social-icon" size={20} title="Sign in with Apple" /></button>
        </div>
      </div>

      <div className='text-center my-3'>
        <p>Don't have an account? <Link to='/signup'><span className='text-primary cursor-pointer'>Sign up</span></Link></p>
      </div>
    </div>
  );
};

export default SignIn;
