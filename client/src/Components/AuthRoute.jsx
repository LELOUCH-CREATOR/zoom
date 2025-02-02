import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebaseConfig'; 

const AuthRoute = ({ element }) => {
  const user = auth.currentUser; 

  return user ? element : <Navigate to="/signin" />; 
};

export default AuthRoute;
