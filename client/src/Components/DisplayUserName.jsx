import { useEffect, useState } from "react";

const DisplayNameComponent = ({ usersInRoom, admins, peer }) => {
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const displayUserName = () => {
      const currentUser = usersInRoom.find(user => user.id === peer?.id);
      let userNameToDisplay;
      if (admins.size === 0 && usersInRoom.length > 0) {
        const randomUser = usersInRoom[Math.floor(Math.random() * usersInRoom.length)];
        userNameToDisplay = randomUser ? randomUser.name : "No Users Available";
      } else {
        userNameToDisplay = currentUser ? currentUser.name : "User";
      }

      setDisplayName(userNameToDisplay);
    };

    displayUserName();
  }, [usersInRoom, admins, peer]); 

  return (
    <div>
      <h1>{displayName}</h1>
    </div>
  );
};

export default DisplayNameComponent;

