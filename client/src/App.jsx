import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard";
import JoinMeeting from "./Pages/JoinMeeting";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/Login";
import VideoChatRoom from "./Pages/Room";
import { MediaStreamProvider } from "./context/MediaStreamContext";
import { PeerProvider } from "./context/PeerContext";
import AuthRoute from "./Components/AuthRoute";
import ScheduleMeeting from "./Components/ScheduleMeeting";

const App = () => {
  return (
    <MediaStreamProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />

          {/* Protected Routes */}
          <Route path="dashboard" element={<AuthRoute element={<Dashboard />} />} />
          <Route
            path="room/:meetingId"
            element={
              <AuthRoute element={
                <PeerProvider>
                  <VideoChatRoom />
                </PeerProvider>
              } />
            }
          />
          <Route
            path="join-meeting"
            element={
              <AuthRoute element={
                <PeerProvider>
                  <JoinMeeting />
                </PeerProvider>
              } />
            }
          />
          <Route path="/schedule" element={<AuthRoute element={<ScheduleMeeting/>}/>}/>
        </Routes>
      </BrowserRouter>
    </MediaStreamProvider>
  );
};

export default App;

