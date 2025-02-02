import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiMic, FiMicOff } from "react-icons/fi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { FaWindowClose } from "react-icons/fa";
import {
  IoPeopleOutline,
  IoVideocamOutline,
  IoVideocamOffOutline,
} from "react-icons/io5";
import { CiChat1 } from "react-icons/ci";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import socket from "../Components/socket";
import MessageInput from "../Components/MessageInput";
import RemoteVideo from "../Components/Video";
import MeetingRecorder from "../Components/MeetingRecorder";
import { MediaStreamContext } from "../context/MediaStreamContext";
import NotificationContainer from "../Components/NotificationContainer";
import EmojiPickerButton from "../Components/EmojiPicker";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/CSS/MeetingRec.css";
import { usePeer } from "../context/PeerContext";
import "../assets/CSS/VideoChatRoom.css";
import LeaveRoomComponent from "../Components/LeaveRoom";
import EndMeetingComponent from "../Components/EndMeetingComponent";
import DisplayUserName from "../Components/DisplayUserName";
import DisplayNameComponent from "../Components/DisplayUserName";

function VideoChatRoom() {
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMessage, setRecordingMessage] = useState("");
  const [emojiReactions, setEmojiReactions] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [admins, setAdmins] = useState(new Set());
  const [adminPannel, setAdminPannel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [sharedScreenStream, setSharedScreenStream] = useState(null);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userName = params.get("userName");
  const { meetingId } = useParams();

  const {
    localStreamRef,
    remoteStreams,
    addRemoteStream,
    removeRemoteStream,
    cleanupLocalStream,
  } = useContext(MediaStreamContext);
  const { peer } = usePeer();
  const localVideoRef = useRef(null);
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!peer || !peer.id) {
      console.log("PeerJS instance not available or ID not ready");
      setLoading(true);
      return;
    }

    console.log("Peer instance available:", peer.id);
    setLoading(false);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        setIsVideoEnabled(videoTrack?.enabled ?? true);
        setIsAudioEnabled(audioTrack?.enabled ?? true);
      })
      .catch((err) => {
        console.error("Error getting local media:", err);
      });
  }, [peer?.id]);

  useEffect(() => {
    const handleRoomUsers = (users) => {
      setUsersInRoom(users);
      const currentUser = users.find((user) => user.id === peer.id);
      if (currentUser) {
        setIsAdmin(currentUser.isAdmin);
      }
      setShowParticipants(users);
    };
    const handleChatMessage = (message) => {
      if (!message.recipient || message.recipient === userName) {
        setMessages((prevMessages) => [...prevMessages, message]);
        if (!showChat) {
          setUnreadCount((prevCount) => prevCount + 1);
        }
      }
    };

    socket.on("roomUsers", handleRoomUsers);
    socket.on("chatMessage", handleChatMessage);

    return () => {
      socket.off("roomUsers", handleRoomUsers);
      socket.off("chatMessage", handleChatMessage);
    };
  }, [peer.id, meetingId, userName, showChat]);

  useEffect(() => {
    socket.on("userJoined", ({ peerId }) => {
      if (!peerId) {
        console.error("Received undefined peerId for user join event");
        return;
      }

      if (!localStreamRef.current) {
        console.error("No local stream available");
        return;
      }

      console.log(`User with peerId ${peerId} joined`);
      const call = peer.call(peerId, localStreamRef.current);
      call.on("stream", (remoteStream) => {
        if (remoteStream) {
          console.log(`Received remote stream from ${peerId}`);
          addRemoteStream(peerId, remoteStream);
        } else {
          console.error(`No remote stream for peerId: ${peerId}`);
        }
      });
    });

    return () => {
      socket.off("userJoined");
    };
  }, [peer, meetingId, localStreamRef]);

  useEffect(() => {
    const handleUserLeft = ({ peerId }) => {
      console.log(`User with peerId ${peerId} left the room`);
      removeRemoteStream(peerId);
    };
    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-left", handleUserLeft);
    };
  }, [socket, removeRemoteStream]);

  useEffect(() => {
    const clearMessageAfterDelay = () => {
      
      setTimeout(() => {
        setRecordingMessage(""); 
      }, 20000); 
    };

    socket.on("recordingStarted", ({ message }) => {
      setIsRecording(true);
      setRecordingMessage(message);
      clearMessageAfterDelay(); 
    });

    socket.on("recordingStopped", ({ message }) => {
      setIsRecording(false);
      setRecordingMessage(message);
      clearMessageAfterDelay(); 
    });

    return () => {
      socket.off("recordingStarted");
      socket.off("recordingStopped");
    };
  }, []);

  const handleSendMessage = (recipient) => {
    if (messageInput.trim()) {
      const message = {
        text: messageInput,
        meetingId,
        user: userName,
        recipient: recipient, 
      };
      socket.emit("chatMessage", message);
      setMessageInput("");
    }
  };

  const toggleMedia = (mediaType) => {
    if (mediaType === "video") {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const track = videoTracks[0];
        track.enabled = !track.enabled;
        setIsVideoEnabled(track.enabled);

        socket.emit("userMediaStatus", {
          meetingId,
          username: userName,
          isAudioEnabled,
          isVideoEnabled: track.enabled,
        });
      }
    } else if (mediaType === "audio") {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        track.enabled = !track.enabled;
        setIsAudioEnabled(track.enabled);

        socket.emit("userMediaStatus", {
          meetingId,
          username: userName,
          isAudioEnabled: track.enabled,
          isVideoEnabled,
        });
      }
    }
  };

  useEffect(() => {
    socket.on("muteMedia", ({ userId, mediaType }) => {
      console.log(`${userId} has muted their ${mediaType}`);
    });

    socket.on("unmuteMedia", ({ userId, mediaType }) => {
      console.log(`${userId} has unmuted their ${mediaType}`);
    });

    return () => {
      socket.off("muteMedia");
      socket.off("unmuteMedia");
    };
  }, []);

  const handleToggleVideo = () => toggleMedia("video");
  const handleToggleAudio = () => toggleMedia("audio");

  const handleSendEmoji = (emoji) => {
    
    if (emoji === undefined) {
      console.error("Emoji is undefined!");
      return;
    }

    const reaction = { emoji, user: userName, meetingId };
    console.log("Sending reaction:", reaction);

    socket.emit("sendEmoji", reaction);

    setUsersInRoom((prevUsers) =>
      prevUsers.map((user) =>
        user.name === userName ? { ...user, emoji } : user
      )
    );
  };

  
  const handleRemoveEmoji = (userName) => {
    
    const reaction = { emoji: "", user: userName, meetingId };
    console.log("Removing reaction:", reaction);

    socket.emit("sendEmoji", reaction);

    setUsersInRoom((prevUsers) =>
      prevUsers.map((user) =>
        user.name === userName ? { ...user, emoji: "" } : user
      )
    );
  };

  useEffect(() => {
    socket.on("receiveEmoji", (reaction) => {
      console.log("Emoji received:", reaction);
      setUsersInRoom((prevUsers) =>
        prevUsers.map((user) =>
          user.username === reaction.user
            ? { ...user, emoji: reaction.emoji }
            : user
        )
      );
    });

    return () => {
      socket.off("receiveEmoji");
    };
  }, [socket]);

  useEffect(() => {
    socket.on(
      "userMediaStatus",
      ({ username, isAudioEnabled, isVideoEnabled }) => {
        setUsersInRoom((prevUsers) =>
          prevUsers.map((user) =>
            user.name === username
              ? { ...user, isAudioEnabled, isVideoEnabled }
              : user
          )
        );
      }
    );

    return () => {
      socket.off("userMediaStatus");
    };
  }, []);

  useEffect(() => {
    socket.on("screenShared", (data) => {
      if (notificationRef.current) {
        notificationRef.current.addNotification(
          `${data.username}  shared the screen.`
        );
      }
    });

    return () => {
      socket.off("screenShared");
    };
  }, []);

  // useEffect(() => {
  //   socket.on("screenShared", (data) => {
  //     if (notificationRef.current) {
  //       notificationRef.current.addNotification(
  //         `${data.username} shared the screen.`
  //       );
  //     }

  //     // If the shared screen is from a peer, add the stream to the component
  //     if (data.peerId !== peer.id) {
  //       setSharedScreenStream(data.screenStream);
  //     }
  //   });

  //   return () => {
  //     socket.off("screenShared");
  //   };
  // }, [peer]);

  useEffect(() => {
    socket.on("adminPromoted", (peerId) => {
      setIsAdmin(true);
      console.log("You are now an admin!");
    });

    return () => {
      socket.off("adminPromoted");
    };
  }, []);

  useEffect(() => {
    socket.on("receiveEmoji", (reaction) => {
      setUsersInRoom((prevUsers) =>
        prevUsers.map((user) =>
          user.username === reaction.user
            ? { ...user, emoji: reaction.emoji }
            : user
        )
      );
    });

    return () => {
      socket.off("receiveEmoji");
    };
  }, []);

  const handleLeaveRoom = () => {
    if (meetingId) {
      socket.emit("leaveRoom", meetingId);
      cleanupLocalStream();
      navigate("/");
    }
  };

  const shareScreenWithPeers = (screenStream) => {
    socket.emit("shareScreen", { meetingId });

    usersInRoom.forEach((user) => {
      if (user.peerId !== peer.id) {
        const call = peer.call(user.peerId, screenStream);
        call.on("stream", (remoteStream) => {
          addRemoteStream(user.peerId, remoteStream);
        });
      }
    });
  };

  // const shareScreenWithPeers = (screenStream) => {
  //   socket.emit("shareScreen", { meetingId, peerId: peer.id, screenStream });

  //   usersInRoom.forEach((user) => {
  //     if (user.peerId !== peer.id) {
  //       const call = peer.call(user.peerId, screenStream);
  //       call.on("stream", (remoteStream) => {
  //         addRemoteStream(user.peerId, remoteStream);
  //       });
  //     }
  //   });
  // };

  const handleShareScreen = async () => {
    if (isScreenSharing) {
      handleStopScreenShare();
    } else {
      try {
        
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true, 
        });

        const webcamTrack = localStreamRef.current.getVideoTracks()[0];
        const audioTracks = localStreamRef.current.getAudioTracks();

        
        if (webcamTrack) {
          webcamTrack.stop();
          localStreamRef.current.removeTrack(webcamTrack);
        }

        
        audioTracks.forEach((track) => {
          track.stop();
          localStreamRef.current.removeTrack(track);
        });

        
        screenStream.getTracks().forEach((track) => {
          localStreamRef.current.addTrack(track);
        });

        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        
        shareScreenWithPeers(screenStream);
        setIsScreenSharing(true);

        
        socket.emit("userSharedScreen", { meetingId, username: userName });

        screenStream.getVideoTracks()[0].onended = () => {
          handleStopScreenShare();
        };

        socket.emit("startSharingScreen", { meetingId });
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  };

  const getWebcamStream = async () => {
    try {
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return webcamStream;
    } catch (error) {
      console.error("Error accessing webcam:", error);
      throw error;
    }
  };

  const handleStopScreenShare = async () => {
    try {
      const webcamStream = await getWebcamStream();
      const screenTrack = localStreamRef.current.getVideoTracks()[0];
      if (screenTrack) {
        screenTrack.stop();
        localStreamRef.current.removeTrack(screenTrack);
      }

      localStreamRef.current.addTrack(webcamStream.getVideoTracks()[0]);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      shareScreenWithPeers(webcamStream);

      socket.emit("stopSharingScreen", { meetingId });
      setIsScreenSharing(false);
    } catch (error) {
      console.error("Error stopping screen sharing:", error);
    }
  };

  // const handleStopScreenShare = () => {
  //   setIsScreenSharing(false);
  //   setSharedScreenStream(null);
  //   socket.emit("stopSharingScreen", { meetingId });
  // };

  const handleRecordingChange = (isRecording) => {
    setIsRecording(isRecording);

    if (isRecording) {
      
      socket.emit("startRecording", { meetingId });
    } else {
      
      socket.emit("stopRecording", { meetingId });
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    setShowParticipants(false);
    if (!showChat) {
      setUnreadCount(0);
    }
  };

  const toggleParticipants = () => {
    setShowChat(false); 
    setShowParticipants((prev) => !prev); 
  };

  const toggleAdimPanel = () => {
    setAdminPannel(!adminPannel);
  };

  const handlePromoteUser = (userId) => {
    if (admins.has(userId)) {
      console.warn(`User with ID ${userId} is already an admin.`);
      return;
    }

    socket.emit("promoteAdmin", { userId, meetingId }); 
    setAdmins((prev) => new Set(prev).add(userId)); 
  };

  const handleDemoteUser = (userId) => {
    socket.emit("demoteAdmin", { userId, meetingId });
  };

  const handleRemoveUser = (userId) => {
    socket.emit("removeUser", { userId, meetingId });
    console.log(`User ${userId} has been removed from the meeting.`);
  };

  useEffect(() => {
    socket.on("userRemoved", ({ userId }) => {
      console.log(`User ${userId} was removed from the meeting.`);
      setShowParticipants((prev) =>
        prev.filter((participant) => participant.id !== userId)
      );
    });

    return () => {
      socket.off("userRemoved");
    };
  }, []);

  const handleEndMeeting = () => {
    socket.emit("endMeeting", { meetingId });
    navigate("/");
  };

  useEffect(() => {
    socket.on("meetingEnded", () => {
      alert("The meeting has ended.");
      navigate("/");
    });

    return () => {
      socket.off("meetingEnded");
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  

  return (
    <div className="bg-dark main--container mb-0 pb-2 text-center text-white">
      <div className="row row--container my-0 py-0">
        <div className="col-1"></div>
        <div
          className={`col-${
            showParticipants || showChat ? "9" : "10"
          } middle--container`}>
          <div className="  position-relative justify-content-between">
            <div>
              {recordingMessage && (
                <div className="recording-notification">
                  <span className="blinking-dot"></span> {recordingMessage}
                </div>
              )}
            </div>
            <div>
              <NotificationContainer ref={notificationRef} />
            </div>
            <div className="position-absolute center--class">
              <DisplayNameComponent
                usersInRoom={usersInRoom}
                admins={admins}
                peer={peer}
              />
              {/* <DisplayNameComponent
  usersInRoom={usersInRoom}
  admins={admins}
  peer={peer}
  sharedScreenStream={sharedScreenStream}
/> */}
            </div>
          </div>
        </div>

        <div
          className={`col-${
            showParticipants || showChat
              ? "2 mx-0 px-0 position-relative bg-black"
              : "1"
          }`}>
          {/* If participants are shown */}
          {showParticipants ? (
            <div className="participants-list-container h-100">
              <ul className="list-group  mb-3 border-0">
                {usersInRoom.map((user, index) => (
                  <li
                    key={index}
                    className="list-group-item border-0 d-flex bg-black text-white justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="mx-1">
                        {user.name}
                        {user.isAdmin && (
                          <span className="text-danger">(admin)</span>
                        )}
                      </span>

                      {/* Audio Status */}
                      {user.isAudioEnabled ? (
                        <FiMic className="mx-1" title="Audio On" />
                      ) : (
                        <FiMicOff className="mx-1" title="Audio Off" />
                      )}

                      {/* Video Status */}
                      {user.isVideoEnabled ? (
                        <IoVideocamOutline
                          className="mx-0 px-0"
                          title="Video On"
                        />
                      ) : (
                        <IoVideocamOffOutline
                          className="mx-0 px-0"
                          title="Video Off"
                        />
                      )}

                      {/* User Emoji */}
                      {user.emoji && (
                        <span
                          className="user-emoji mx-1"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleRemoveEmoji(user.name)}
                          title="Click to remove reaction">
                          {user.emoji}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : showChat ? (
            <div className="participants-list-container text-start position-relative h-100">
              <div className="messages--cont">
                {messages.map((msg, index) => (
                  <div key={index} className="my-0 py-0 px-2">
                    {msg.system ? (
                      <em>{msg.text}</em>
                    ) : (
                      <span>
                        {msg.user}: {msg.text}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Select a recipient from participants */}
              <div className="position-absolute send--msg">
                <label htmlFor="recipientSelect" className="text-primary">
                  Send message to:
                </label>
                <select
                  id="recipientSelect"
                  className="form-select mb-2"
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}>
                  <option value="">Everyone</option>
                  {usersInRoom.map((participant, index) => (
                    <option key={index} value={participant.name}>
                      {participant.name}
                    </option>
                  ))}
                </select>

                {/* Message Input */}
                <MessageInput
                  message={messageInput}
                  setMessage={setMessageInput}
                  sendMessage={() => handleSendMessage(selectedRecipient)} // Pass selected recipient
                />
              </div>
            </div>
          ) : (
            // Show Remote Videos by default
            <div>
              {Array.from(remoteStreams.keys()).map((peerId) => (
                <RemoteVideo key={peerId} peerId={peerId} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="bottom--container text-white position-relative px-5  bg-black d-flex align-items-center justify-content-between">
        <div className="d-flex me-0 pe-0">
          <div className="text-center">
            <button className="btn text-white" onClick={handleToggleAudio}>
              {isAudioEnabled ? (
                <div>
                  <span>
                    <FiMicOff />
                  </span>
                  <br />
                  <span>Audio</span>
                </div>
              ) : (
                <div>
                  <span>
                    <FiMic />
                  </span>
                  <br />
                  <span>Audio</span>
                </div>
              )}
            </button>
          </div>
          <div className="text-center">
            <button className="btn text-white" onClick={handleToggleVideo}>
              {isVideoEnabled ? (
                <div>
                  <span>
                    <IoVideocamOffOutline />
                  </span>
                  <br />
                  <span>Video</span>
                </div>
              ) : (
                <div>
                  <span>
                    <IoVideocamOutline />
                  </span>
                  <br />
                  <span>Video</span>
                </div>
              )}
            </button>
          </div>
        </div>
        <div className="d-flex middle-container justify-content-between gap-4 mx-0 px-0 ">
          <div className="text-center position-relative">
            <button className="btn text-white" onClick={toggleParticipants}>
              <span>
                <IoPeopleOutline />
                <span className="ms-1">{usersInRoom.length}</span>
              </span>
              <br />
              <span>Participants</span>
            </button>
          </div>

          <div className="text-center">
            <button className="btn text-white" onClick={toggleChat}>
              <span>
                <CiChat1 />
              </span>
              {unreadCount > 0 && (
                <span className="badge bg-danger rounded-pill">
                  {unreadCount}
                </span>
              )}
              <br />
              <span>Chat</span>
            </button>
          </div>

          <div className="text-center position-relative">
            <EmojiPickerButton onEmojiSelect={handleSendEmoji} />
          </div>
          <div className="text-center">
            <button className="btn text-white" onClick={handleShareScreen}>
              {isScreenSharing ? (
                <div>
                  <FaRegArrowAltCircleUp />
                  <br />
                  Stop Share
                </div>
              ) : (
                <div>
                  <FaRegArrowAltCircleUp />
                  <br />
                  Share
                </div>
              )}
            </button>
          </div>
          <div className="text-center">
            <MeetingRecorder
              localStreamRef={localStreamRef}
              remoteStreams={remoteStreams}
              onRecordingChange={handleRecordingChange}
            />
          </div>
          <div className="text-center ">
            {isAdmin && (
              <button className="btn text-white" onClick={toggleAdimPanel}>
                <MdOutlineAdminPanelSettings /> <br /> Admin Tools
              </button>
            )}
            {adminPannel && (
              <div className="admin-modal">
                <button
                  className="btn text-white d-flex jusify-content-start"
                  onClick={() => setAdminPannel(false)}>
                  <FaWindowClose />
                </button>
                <ul className="position-absolute text-start list-group bg-black text-white">
                  {usersInRoom.map((participant) => (
                    <li
                      key={participant.id}
                      className="text-white bg-black my-0 py-0 list-group-item border-0">
                      <span className="text-danger">{participant.name}</span>
                      <br />
                      {participant.isAdmin ? ( // Check isAdmin directly from participant
                        <>
                          <span>(admin)</span> <br />
                          <button
                            className="btn text-white custom-hover"
                            onClick={() => handleDemoteUser(participant.id)}>
                            Make Guest
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn text-white custom-hover"
                          onClick={() => handlePromoteUser(participant.id)}>
                          Make Admin
                        </button>
                      )}

                      {!participant.isAdmin && (
                        <button
                          className="btn text-white custom-hover"
                          onClick={() => handleRemoveUser(participant.id)}>
                          Remove User
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="d-flex last-col ms-0 me-5 pe-5 ps-0">
          {isAdmin ? (
            <EndMeetingComponent
              handleLeaveRoom={handleLeaveRoom}
              handleEndMeeting={handleEndMeeting}
            />
          ) : (
            <LeaveRoomComponent handleLeaveRoom={handleLeaveRoom} />
          )}
        </div>
      </div>
    </div>
  );
}

export default VideoChatRoom;
