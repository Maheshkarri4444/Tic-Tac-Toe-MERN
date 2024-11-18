import React, { createContext, useState, useContext } from 'react';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const [room, setRoom] = useState("");

  return (
    <RoomContext.Provider value={{ room, setRoom }}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook to use the Room context
export const useRoom = () => useContext(RoomContext);
