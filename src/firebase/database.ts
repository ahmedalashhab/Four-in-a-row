import { get, onValue, ref, set, update } from "firebase/database";
import type { GamePlayer, GameRoom } from "../types/User.types";
import { database } from "./config/index";

export const gameService = {
  // Create a new game room
  async createRoom(hostPlayer: GamePlayer): Promise<string> {
    const roomId = Math.random().toString(36).substring(2, 8);
    const room: GameRoom = {
      id: roomId,
      players: [hostPlayer],
      currentTurn: 1,
      status: "waiting",
      winner: null,
      createdAt: Date.now(),
      lastMove: {
        row: -1,
        col: -1,
        player: 1,
        timestamp: Date.now(),
      },
      board: Array(6)
        .fill(null)
        .map(() => Array(7).fill(0)),
      time: 30,
    };

    await set(ref(database, `rooms/${roomId}`), room);
    return roomId;
  },

  // Join an existing room
  async joinRoom(roomId: string, player: GamePlayer): Promise<void> {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      throw new Error("Room not found");
    }

    const room = snapshot.val() as GameRoom;
    if (room.players.length >= 2) {
      throw new Error("Room is full");
    }

    // Initialize player with ready state as false
    const playerWithReady = {
      ...player,
      ready: false,
    };

    await update(roomRef, {
      players: [...room.players, playerWithReady],
      status: "waiting", // Keep as waiting until both players are ready
    });
  },

  // Listen to room changes
  onRoomUpdate(roomId: string, callback: (room: GameRoom) => void): () => void {
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as GameRoom);
      }
    });

    return unsubscribe;
  },

  // Make a move
  async makeMove(
    roomId: string,
    board: (string | null)[][],
    playerNumber: 1 | 2,
  ): Promise<void> {
    const roomRef = ref(database, `rooms/${roomId}`);
    await update(roomRef, {
      board,
      currentTurn: playerNumber === 1 ? 2 : 1,
      lastMove: Date.now(),
    });
  },

  // Update the updateGameState function to handle ready state updates
  async updateGameState(
    roomId: string,
    gameState: Partial<GameRoom>,
  ): Promise<void> {
    const roomRef = ref(database, `rooms/${roomId}`);

    // If updating player ready states, check if both players are ready
    if (gameState.players) {
      const allPlayersReady = gameState.players.every((player) => player.ready);
      if (allPlayersReady) {
        gameState.status = "playing";
      }
    }

    await update(roomRef, {
      ...gameState,
      lastMove: Date.now(),
    });
  },
};
