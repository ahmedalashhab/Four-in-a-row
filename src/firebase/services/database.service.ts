import {
  get,
  onValue,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from "firebase/database";
import type { GamePlayer, GameRoom } from "../../types/User.types";
import { database } from "../config/index";

function generateRoomId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to convert Firebase board object to 2D array
const convertBoardToArray = (boardData: any): (string | null)[][] => {
  // Initialize empty board
  const board = Array(6)
    .fill(null)
    .map(() => Array(7).fill(null));

  // If boardData is already an array, return it
  if (Array.isArray(boardData)) {
    return boardData;
  }

  // If boardData is an object, reconstruct the board
  if (boardData && typeof boardData === "object") {
    Object.entries(boardData).forEach(([rowIndex, row]) => {
      if (row && typeof row === "object" && !Array.isArray(row)) {
        // Type assertion to tell TypeScript that row is a valid object
        const rowObject = row as { [key: string]: string | null };
        Object.entries(rowObject).forEach(([colIndex, value]) => {
          board[parseInt(rowIndex)][parseInt(colIndex)] = value;
        });
      }
    });
  }

  return board;
};

export const gameService = {
  // Create a new game room
  async createRoom(host: GamePlayer): Promise<string> {
    console.log("🎮 [CREATE] Creating room with host:", host);

    const roomId = generateRoomId();
    const roomRef = ref(database, `rooms/${roomId}`);

    const room: GameRoom = {
      id: roomId,
      players: [{ ...host, ready: false }],
      currentTurn: 1,
      status: "waiting",
      winner: null,
      lastMove: Date.now(),
      createdAt: Date.now(),
      time: 30,
      board: Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
    };

    try {
      await set(roomRef, room);
      console.log("🎮 [CREATE] Room created successfully:", roomId);
      return roomId;
    } catch (error) {
      console.error("🔴 [CREATE] Error creating room:", error);
      throw error;
    }
  },

  // Join an existing room
  async joinRoom(roomId: string, player: GamePlayer): Promise<void> {
    console.log("🎮 [JOIN] Starting join process:", { roomId, player });

    const roomRef = ref(database, `rooms/${roomId}`);

    try {
      // Use transaction to ensure atomic updates and prevent overwrites
      await runTransaction(roomRef, (currentData) => {
        if (!currentData) {
          throw new Error("Room not found");
        }

        const room = currentData as GameRoom;

        // Important: Check if we already have the correct number of players
        if (room.players.length === 2) {
          console.log(
            "🎮 [JOIN] Room already has 2 players, verifying player presence",
          );
          // If the joining player is already in the room, don't modify anything
          if (room.players.some((p) => p.uid === player.uid)) {
            return room;
          }
          throw new Error("Room is full");
        }

        // Preserve existing players and add the new one
        const updatedRoom = {
          ...room,
          players: [...room.players, { ...player, ready: false }],
          lastMove: Date.now(),
        };

        console.log("🎮 [JOIN] Updating room with new player:", {
          existingPlayers: room.players,
          newPlayer: player,
          finalPlayers: updatedRoom.players,
        });

        return updatedRoom;
      });

      // Verify the update
      const verifySnapshot = await get(roomRef);
      const verifiedRoom = verifySnapshot.val() as GameRoom;

      if (!verifiedRoom.players.some((p) => p.uid === player.uid)) {
        console.error("🔴 [JOIN] Player join verification failed");
        throw new Error("Failed to join room - verification failed");
      }

      console.log(
        "🎮 [JOIN] Successfully joined room, final state:",
        verifiedRoom,
      );
    } catch (error) {
      console.error("🔴 [JOIN] Error joining room:", error);
      throw error;
    }
  },

  // Update game state
  async updateGameState(
    roomId: string,
    gameState: Partial<GameRoom>,
  ): Promise<void> {
    console.log("🎮 [UPDATE] Updating game state:", { roomId, gameState });

    const roomRef = ref(database, `rooms/${roomId}`);

    try {
      await runTransaction(roomRef, (currentData) => {
        if (!currentData) throw new Error("Room not found");

        const room = currentData as GameRoom;

        // Always ensure board is properly structured as 2D array
        const currentBoard = Array(6)
          .fill(null)
          .map((_, i) =>
            Array(7)
              .fill(null)
              .map((_, j) => room.board?.[i]?.[j] || null),
          );

        const updatedRoom = {
          ...room,
          ...gameState,
          board: gameState.board || currentBoard,
          lastMove: {
            row: -1,
            col: -1,
            player: gameState.currentTurn || room.currentTurn,
            timestamp: Date.now(),
          },
        };

        console.log("🎮 [UPDATE] New room state:", updatedRoom);
        return updatedRoom;
      });
    } catch (error) {
      console.error("🔴 [UPDATE] Error updating game state:", error);
      throw error;
    }
  },

  // Listen to room changes
  onRoomUpdate(roomId: string, callback: (room: GameRoom) => void): () => void {
    console.log("🎮 [LISTEN] Setting up room listener for:", roomId);

    const roomRef = ref(database, `rooms/${roomId}`);
    let previousPlayers: GamePlayer[] = [];

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();

        // Convert board data to proper 2D array
        const room: GameRoom = {
          ...roomData,
          board: convertBoardToArray(roomData.board),
        };

        // Protect against player removal
        if (previousPlayers.length > room.players.length) {
          console.warn("🚫 [LISTEN] Prevented potential player removal");
          room.players = previousPlayers;
        } else {
          previousPlayers = [...room.players];
        }

        console.log("🎮 [LISTEN] Room update received with board:", room.board);
        callback(room);
      }
    });

    return unsubscribe;
  },

  // Add rooms listing functionality
  onRoomsUpdate(callback: (rooms: GameRoom[]) => void): () => void {
    console.log("🔵 Setting up rooms listener...");

    const roomsRef = ref(database, "rooms");
    console.log("🔵 Database reference:", roomsRef.toString());

    // Test immediate database access
    get(roomsRef)
      .then((snapshot) => {
        console.log("🟢 Initial database test - Data:", snapshot.val());
      })
      .catch((error) => {
        console.error("🔴 Initial database test failed:", error);
      });

    const unsubscribe = onValue(
      roomsRef,
      (snapshot) => {
        console.log("🟡 Received database update event");

        if (!snapshot.exists()) {
          console.log("🟡 No rooms found in snapshot");
          callback([]);
          return;
        }

        try {
          const roomsData = snapshot.val();
          console.log("🟢 Raw rooms data:", roomsData);

          const roomsArray = Object.entries(roomsData).map(([id, data]) => {
            console.log(`🟢 Processing room ${id}:`, data);
            return {
              ...(data as Omit<GameRoom, "id">),
              id,
            };
          });

          console.log("🟢 Converted rooms array:", roomsArray);
          callback(roomsArray);
        } catch (error) {
          console.error("🔴 Error processing rooms data:", error);
          callback([]);
        }
      },
      (error) => {
        console.error("🔴 Firebase listener error:", error);
      },
    );

    return () => {
      console.log("🔵 Cleaning up rooms listener");
      unsubscribe();
    };
  },

  async cleanupInactiveRooms(): Promise<void> {
    try {
      const roomsRef = ref(database, "rooms");
      const snapshot = await get(roomsRef);

      if (snapshot.exists()) {
        const rooms = snapshot.val();
        const now = Date.now();
        const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

        for (const [roomId, room] of Object.entries(rooms)) {
          const typedRoom = room as GameRoom;

          // Remove rooms that are:
          // 1. Empty (no players)
          // 2. Inactive for more than 30 minutes
          // 3. In "waiting" status for more than 30 minutes
          if (
            typedRoom.players.length === 0 ||
            now - typedRoom.lastMove > inactiveThreshold ||
            (typedRoom.status === "waiting" &&
              now - typedRoom.createdAt > inactiveThreshold)
          ) {
            console.log(`Cleaning up inactive room: ${roomId}`);
            await remove(ref(database, `rooms/${roomId}`));
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up inactive rooms:", error);
    }
  },

  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (snapshot.exists()) {
        const room = snapshot.val() as GameRoom;
        const updatedPlayers = room.players.filter((p) => p.uid !== playerId);

        if (updatedPlayers.length === 0) {
          // If no players left, remove the room completely
          console.log(`Removing empty room: ${roomId}`);
          await remove(roomRef);
        } else {
          // Update the room with remaining players and reset game state
          await update(roomRef, {
            players: updatedPlayers,
            status: "waiting",
            currentTurn: 1,
            board: Array(6)
              .fill(null)
              .map(() => Array(7).fill(null)),
            winner: null,
            lastMove: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error);
      throw error;
    }
  },

  async makeMove(
    roomId: string,
    row: number,
    col: number,
    playerNumber: 1 | 2,
  ): Promise<void> {
    console.log("🎮 [MOVE] Making move:", { roomId, row, col, playerNumber });

    const roomRef = ref(database, `rooms/${roomId}`);

    try {
      await runTransaction(roomRef, (currentData) => {
        if (!currentData) throw new Error("Room not found");

        const room = currentData as GameRoom;

        // Validate turn
        if (room.currentTurn !== playerNumber) {
          console.log("🚫 [MOVE] Not player's turn");
          return;
        }

        // Initialize a new board if none exists or convert existing board
        let currentBoard: (string | null)[][];

        if (!room.board || !Array.isArray(room.board)) {
          // Create new board if none exists
          currentBoard = Array(6)
            .fill(null)
            .map(() => Array(7).fill(null));
        } else if (Array.isArray(room.board[0])) {
          // Board is already in correct format
          currentBoard = room.board.map((row) =>
            Array.isArray(row) ? [...row] : Array(7).fill(null),
          );
        } else {
          // Convert object format to array format
          currentBoard = Array(6)
            .fill(null)
            .map((_, i) =>
              Array(7)
                .fill(null)
                .map((_, j) => {
                  const rowData = room.board[i];
                  return rowData && rowData[j] ? rowData[j] : null;
                }),
            );
        }

        // Make the move
        currentBoard[row][col] = `PLAYER ${playerNumber}`;

        console.log("🎮 [MOVE] New board state:", currentBoard);

        return {
          ...room,
          board: currentBoard,
          currentTurn: playerNumber === 1 ? 2 : 1,
          lastMove: {
            row,
            col,
            player: playerNumber,
            timestamp: Date.now(),
          },
        };
      });
    } catch (error) {
      console.error("🔴 [MOVE] Error making move:", error);
      throw error;
    }
  },
};
