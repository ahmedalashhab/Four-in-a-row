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
  // Initialize empty board with null values explicitly
  const board = Array(6)
    .fill(null)
    .map(() => Array(7).fill(null));

  // If boardData is already a 2D array, normalize it to ensure no undefined or empty values
  if (
    Array.isArray(boardData) &&
    boardData.length === 6 &&
    boardData.every((row) => Array.isArray(row) && row.length === 7)
  ) {
    return boardData.map((row: (string | null | undefined)[]) =>
      Array(7)
        .fill(null)
        .map((_, index) => {
          const cell = row[index];
          return cell === undefined || cell === "" ? null : cell;
        }),
    );
  }

  // If boardData is an object (Firebase format), reconstruct the board
  if (boardData && typeof boardData === "object") {
    Object.entries(boardData).forEach(([rowIndex, rowData]) => {
      if (rowData && typeof rowData === "object") {
        Object.entries(rowData as Record<string, string>).forEach(
          ([colIndex, value]) => {
            const row = parseInt(rowIndex);
            const col = parseInt(colIndex);
            if (!isNaN(row) && !isNaN(col) && row < 6 && col < 7) {
              board[row][col] = value || null;
            }
          },
        );
      }
    });
  }

  // Ensure all positions have explicit null values
  return board.map((row) =>
    row.map((cell) => (cell === undefined || cell === "" ? null : cell)),
  );
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
      lastMove: {
        row: -1,
        col: -1,
        player: 1,
        timestamp: Date.now(),
      },
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
            now - typedRoom.lastMove.timestamp > inactiveThreshold ||
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
    const roomRef = ref(database, `rooms/${roomId}`);

    try {
      await runTransaction(roomRef, (currentData) => {
        if (!currentData) {
          throw new Error("Room not found");
        }

        const room = currentData as GameRoom;

        if (room.currentTurn !== playerNumber) {
          return;
        }

        // Convert and ensure no undefined values
        let currentBoard = convertBoardToArray(room.board);

        // Make the move
        currentBoard[row][col] = `PLAYER ${playerNumber}`;

        // Create storage object, only storing non-null values
        const boardForStorage: Record<string, Record<string, string>> = {};

        currentBoard.forEach((rowArray, rowIndex) => {
          const nonNullCells: Record<string, string> = {};

          rowArray.forEach((cell, colIndex) => {
            if (cell !== null && cell !== undefined) {
              nonNullCells[colIndex.toString()] = cell;
            }
          });

          if (Object.keys(nonNullCells).length > 0) {
            boardForStorage[rowIndex.toString()] = nonNullCells;
          }
        });

        return {
          ...room,
          board: boardForStorage,
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
