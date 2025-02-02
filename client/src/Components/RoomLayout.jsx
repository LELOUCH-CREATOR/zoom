import React from "react";

const RoomLayout = () => {
  return (
    <div className="bg-dark text-venter text-white">
      <div className="row">
        <div className="col-2"></div>
        <div className="col-8">
          <div className="top--container d-flex justify-content-between">
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
          </div>
          <div className="middle--container "></div>
          <div className="bottom--container bg-black d-flex align-items-center justify-content-between">
            <div className="text-center">
              <button  onClick={handleToggleAudio}>
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
            <button  onClick={handleShareScreen}>
            {isScreenSharing ? <div><span><IoVideocamOffOutline/></span><br /><span>Video</span></div> 
            : <div><span><IoVideocamOutline/></span><br /><span>Video</span></div>}
          </button>
            </div>
            <div className="text-center">
            <button>
            <span><IoPeopleOutline/></span><br /><span>Participants</span>
          </button>
            </div>
            <div className="text-center">
                <button>
                    <span><CiChat1/></span> <br /><span>Chat</span>
                </button>
            </div>
            <div className="text-center">
            <EmojiPickerButton onEmojiSelect={handleSendEmoji} />
            </div>
            <div className="text-center">
            <button className="" onClick={handleShareScreen}>
            {isScreenSharing ? <div><FaRegArrowAltCircleUp/><br />Share</div> : <div><FaRegArrowAltCircleUp/><br />Stop Share</div>}
          </button>
            </div>
            <div className="text-center">
            <MeetingRecorder
            localStreamRef={localStreamRef}
            remoteStreams={remoteStreams}
            onRecordingChange={handleRecordingChange}
          />
            </div>
            <div className="text-center">
            <button className="text-danger" onClick={handleLeaveRoom}>
            Leave Room
          </button>
            </div>
          </div>
        </div>
        <div className="col-2"><div className="col-md-6">
          {Array.from(remoteStreams.keys()).map((peerId) => (
            <RemoteVideo key={peerId} peerId={peerId} />
          ))}
        </div></div>
      </div>
    </div>
  );
};

export default RoomLayout;
