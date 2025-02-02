import React, { useState, useRef } from "react";
import {SlCamrecorder} from 'react-icons/sl'

const MeetingRecorder = ({ localStreamRef, remoteStreams, onRecordingChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const startRecording = () => {
    const combinedStream = new MediaStream();
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => combinedStream.addTrack(track));
    }
    remoteStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => combinedStream.addTrack(track));
    });
    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
      mimeType: "video/webm; codecs=vp9",
    });
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
    onRecordingChange(true);
    console.log("Recording started");
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    onRecordingChange(false); 
    console.log("Recording stopped");
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "meeting-recording.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    };
  };

  return (
    <div>
      <button
        className="btn text-white"
        onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? <div><SlCamrecorder/><br />Stop Recording</div> : <div><SlCamrecorder/><br />Record</div>}
      </button>
    </div>
  );
};

export default MeetingRecorder;

