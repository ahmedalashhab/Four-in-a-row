import { getDatabase, ref, push, set, update, get } from "firebase/database";

const db = getDatabase();

type User = string;
type GameState = (string | null)[][];

export interface Room {
  id: string | null;
  creator: User;
  opponent: User | null;
  gameBoard: GameState;
  status: "waiting for player" | "in game" | User;
  winner: User | null;
}

export const createRoom = async (
  creator: User,
  gameInitialState: GameState,
): Promise<string> => {
  const roomListRef = ref(db, "rooms");
  const newRoomRef = push(roomListRef);
  const newRoomKey: string = newRoomRef.key as string;

  const room: Room = {
    id: newRoomKey,
    creator,
    gameBoard: gameInitialState,
    opponent: null,
    status: "waiting for player",
    winner: null,
  };

  await set(newRoomRef, room);

  return newRoomKey;
};

export const getRooms = async (): Promise<Room[]> => {
  const roomsSnapshot = await get(ref(db, "rooms"));
  const rooms = roomsSnapshot.val();
  return rooms ? Object.values(rooms) : [];
};

export const joinRoom = (player: User, roomId: string): Promise<void> => {
  return update(ref(db, `rooms/${roomId}`), {
    opponent: player,
    status: "in game",
  });
};

export const joinRoomByKey = async (
  player: User,
  roomKey: string,
): Promise<void> => {
  const roomSnapshot = await get(ref(db, "rooms/" + roomKey));
  const room = roomSnapshot.val() as Room;

  if (!room) {
    console.log("No such room exists.");
    return;
  }

  if (room.status === "waiting for player") {
    return update(ref(db, "rooms/" + roomKey), {
      opponent: player,
      status: "in game",
    });
  }
};
