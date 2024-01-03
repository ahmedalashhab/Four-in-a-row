import React from "react";
import { getRooms, joinRoom, Room } from "./Rooms";
import { RoomItem } from "./RoomItem";

const RoomList: React.FC = () => {
  const [rooms, setRooms] = React.useState<Room[]>([]);

  React.useEffect(() => {
    getRooms().then((fetchedRooms: React.SetStateAction<Room[]>) =>
      setRooms(fetchedRooms),
    );
  }, []);

  return (
    <div>
      <h1>Rooms:</h1>
      {rooms.map((room) => (
        <RoomItem
          key={room.id}
          id={room.id!}
          creator={room.creator}
          status={room.status}
          onJoin={() => joinRoom("userId", room.id!)}
        />
      ))}
    </div>
  );
};
