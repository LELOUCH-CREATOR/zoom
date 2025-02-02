import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { CiHeart } from 'react-icons/ci';

const EmojiPickerButton = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    if (emojiObject?.emoji) {
      onEmojiSelect(emojiObject.emoji);
    } else {
      console.error("Emoji object is invalid:", emojiObject);
    }
    setShowPicker(false);
  };

  return (
    <div className="position-relative">
      {showPicker && (
        <div
          style={{
            position: 'absolute',
            top: '-450px', 
            zIndex: 1000, 
            height:'10px'
          }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <button className="btn text-white" onClick={() => setShowPicker(!showPicker)}>
        {showPicker ? (
          <div>
            <span><CiHeart /></span> <br />React
          </div>
        ) : (
          <div>
            <span><CiHeart /></span> <br />React
          </div>
        )}
      </button>

      
    </div>
  );
};

export default EmojiPickerButton;

