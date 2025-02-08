import React, { useEffect, useRef } from "react";
import { useContext } from "react";
import { MediaStreamContext } from "../context/MediaStreamContext";

const RemoteVideo = ({ peerId }) => {
  const { remoteStreams } = useContext(MediaStreamContext);
  const videoRef = useRef(null);

  useEffect(() => {
    const remoteStream = remoteStreams.get(peerId);
    if (remoteStream && videoRef.current) {
      videoRef.current.srcObject = remoteStream; 
    }
  }, [peerId, remoteStreams]);

  return <video ref={videoRef} autoPlay className="" style={{ height: "auto",width:"50px"}} />;
};

export default RemoteVideo;

