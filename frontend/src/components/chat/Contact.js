import { useState, useEffect } from "react";

import { getUser } from "../../services/ChatService";
import UserLayout from "../layouts/UserLayout";

export default function Contact({ chatRoom, onlineUsersId, currentUser, users }) {
  const [contact, setContact] = useState();

  useEffect(() => {
    if (!chatRoom?.members) return;
    
    const contactId = chatRoom.members.find(
      (member) => member !== currentUser.uid
    );

    // Optimized: If we have the users array, find the contact in memory instead of calling the API
    if (users && users.length > 0) {
      const foundUser = users.find((u) => u.uid === contactId);
      if (foundUser) {
        setContact(foundUser);
        return;
      }
    }

    const fetchData = async () => {
      try {
        const res = await getUser(contactId);
        setContact(res);
      } catch (err) {
        console.error("Error fetching contact:", err);
      }
    };

    fetchData();
  }, [chatRoom, currentUser, users]);

  return <UserLayout user={contact} onlineUsersId={onlineUsersId} />;
}
