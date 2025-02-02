import React, { createContext, useRef, useState } from 'react';

export const MediaStreamContext = createContext();


export const MediaStreamProvider = ({ children }) => {
  const localStreamRef = useRef(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());

  const addRemoteStream = (peerId, remoteStream) => {
    setRemoteStreams((prevStreams) => {
      const updatedStreams = new Map(prevStreams);
      updatedStreams.set(peerId, remoteStream);
      return updatedStreams;
    });
  };

  const removeRemoteStream = (peerId) => {
    setRemoteStreams((prevStreams) => {
      const updatedStreams = new Map(prevStreams);
      updatedStreams.delete(peerId);
      return updatedStreams;
    });
  };

  const cleanupLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null; 
    }
  };

  const getMediaStream = async (noAudio, noVideo) => {
    const constraints = {
      audio: !noAudio,
      video: !noVideo,
    };
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  return (
    <MediaStreamContext.Provider
      value={{
        localStreamRef,
        remoteStreams,
        setRemoteStreams,
        addRemoteStream,
        removeRemoteStream,
        getMediaStream,
        cleanupLocalStream, 
      }}
    >
      {children}
    </MediaStreamContext.Provider>
  );
};