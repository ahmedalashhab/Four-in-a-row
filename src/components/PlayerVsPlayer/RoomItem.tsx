import React from "react";

interface RoomProps {
  id: string;
  creator: string;
  status: string;
  onJoin: () => void;
}

export const RoomItem: React.FC<RoomProps> = ({
  id,
  creator,
  status,
  onJoin,
}) => {
  return (
    <div>
      <h2>{`Room ID: ${id}`}</h2>
      <p>{`Creator: ${creator}`}</p>
      <p>{`Status: ${status}`}</p>
      <button onClick={onJoin}>Join Room</button>
    </div>
  );
};
