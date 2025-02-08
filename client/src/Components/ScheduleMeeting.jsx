import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const ScheduleMeeting = () => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const meetingsCollection = collection(db, "meetings");
        const meetingSnapshot = await getDocs(meetingsCollection);
        const meetingList = meetingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMeetings(meetingList); 
      } catch (error) {
        console.error("Error fetching meetings:", error.message);
      }
    };

    fetchMeetings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const docRef = await addDoc(collection(db, "meetings"), {
        title,
        date,
        time,
        meetingId,
        participants: [], 
      });

      console.log("Meeting scheduled successfully");

      
      const newMeeting = {
        id: docRef.id,
        title,
        date,
        time,
        meetingId, 
      };

      setMeetings((prevMeetings) => [...prevMeetings, newMeeting]);

      setTitle("");
      setDate("");
      setTime("");
      setMeetingId(""); 
    } catch (error) {
      console.error("Error scheduling meeting:", error.message);
    }
  };

  return (
    <div className="bg-primary text-white schedule py-3 px-5">
      <h1 className="text-center text-white">Meeting Schedules</h1>
      <form onSubmit={handleSubmit}>
        
          <div className="mx-2 border-0">
            <label>Title</label> <br />
            <input
              className="w-25 p-1 ml-2 rounded"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mx-2 border-0">
            <label>Meeting ID</label> <br />
            <input
              className="w-25 p-1 ml-2 rounded"
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              required
            />
          </div>
        
        
          <div className="mx-2 border-0">
            <label>Time</label> <br />
            <input
              className="w-25 p-2 ml-2 rounded"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="mx-2 border-0">
            <label>Date</label> <br />
            <input
              className="w-25 p-2 ml-2 rounded"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        

        <button className="btn p-1 bg-secondary w-25 my-3" type="submit">
          Schedule Meeting
        </button>
      </form>

      <h2 className="text-warning">Scheduled Meetings</h2>
      <ul className="list-group">
        {meetings.map((meeting) => (
          <li className="list-group-item" key={meeting.id}>
            <span className="mx-4 px-4">
              <strong>Title:</strong> {meeting.title}
            </span>
            <span className="mx-4 px-4">
              <strong>Date:</strong> {meeting.date}
            </span>
            <span className="mx-4 px-4">
              <strong>Time:</strong> {meeting.time}
            </span>
            <span className="mx-4 px-4">
              <strong>Meeting ID:</strong> {meeting.meetingId}
            </span>{" "}
            
          </li>
        ))}
      </ul>
      <button className="btn bg-black text-white mt-5" onClick={handleNavigate}>
        Back
      </button>
    </div>
  );
};

export default ScheduleMeeting;
