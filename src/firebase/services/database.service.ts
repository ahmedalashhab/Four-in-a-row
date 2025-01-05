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
import { debugError, debugLog } from "../../utils/debug";
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
    debugLog("ROOMS", "Creating room with host", host);

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
      debugLog("ROOMS", "Room created successfully", roomId);
      return roomId;
    } catch (error) {
      debugError("ROOMS", "Error creating room", error);
      throw error;
    }
  },

  // Join an existing room
  async joinRoom(roomId: string, player: GamePlayer): Promise<void> {
    debugLog("ROOMS", "Starting join process", { roomId, player });

    const roomRef = ref(database, `rooms/${roomId}`);

    try {
      await runTransaction(roomRef, (currentData) => {
        if (!currentData) {
          throw new Error("Room not found");
        }

        const room = currentData as GameRoom;

        if (room.players.length === 2) {
          debugLog(
            "ROOMS",
            "Room already has 2 players, verifying player presence",
          );
          if (room.players.some((p) => p.uid === player.uid)) {
            return room;
          }
          throw new Error("Room is full");
        }

        const updatedRoom = {
          ...room,
          players: [...room.players, { ...player, ready: false }],
          lastMove: Date.now(),
        };

        debugLog("ROOMS", "Updating room with new player", {
          existingPlayers: room.players,
          newPlayer: player,
          finalPlayers: updatedRoom.players,
        });

        return updatedRoom;
      });

      const verifySnapshot = await get(roomRef);
      const verifiedRoom = verifySnapshot.val() as GameRoom;

      if (!verifiedRoom.players.some((p) => p.uid === player.uid)) {
        debugError("ROOMS", "Player join verification failed");
        throw new Error("Failed to join room - verification failed");
      }

      debugLog("ROOMS", "Successfully joined room, final state", verifiedRoom);
    } catch (error) {
      debugError("ROOMS", "Error joining room", error);
      throw error;
    }
  },

  // Update game state
  async updateGameState(
    roomId: string,
    gameState: Partial<GameRoom>,
  ): Promise<void> {
    debugLog("GAME", "Updating game state", { roomId, gameState });

    const roomRef = ref(database, `rooms/${roomId}`);

    try {
      await runTransaction(roomRef, (currentData) => {
        if (!currentData) throw new Error("Room not found");

        const room = currentData as GameRoom;
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

        debugLog("GAME", "New room state", updatedRoom);
        return updatedRoom;
      });
    } catch (error) {
      debugError("GAME", "Error updating game state", error);
      throw error;
    }
  },

  // Listen to room changes
  onRoomUpdate(roomId: string, callback: (room: GameRoom) => void): () => void {
    debugLog("ROOMS", "Setting up room listener for", roomId);

    const roomRef = ref(database, `rooms/${roomId}`);
    let previousPlayers: GamePlayer[] = [];

    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        const room: GameRoom = {
          ...roomData,
          board: convertBoardToArray(roomData.board),
        };

        if (previousPlayers.length > room.players.length) {
          debugLog("ROOMS", "Prevented potential player removal");
          room.players = previousPlayers;
        } else {
          previousPlayers = [...room.players];
        }

        debugLog("GAME", "Room update received with board", room.board);
        callback(room);
      }
    });

    return unsubscribe;
  },

  // Add rooms listing functionality
  onRoomsUpdate(callback: (rooms: GameRoom[]) => void): () => void {
    debugLog("ROOMS", "Setting up rooms listener...");

    const roomsRef = ref(database, "rooms");
    debugLog("ROOMS", "Database reference", roomsRef.toString());

    get(roomsRef)
      .then((snapshot) => {
        debugLog("ROOMS", "Initial database test - Data", snapshot.val());
      })
      .catch((error) => {
        debugError("ROOMS", "Initial database test failed", error);
      });

    const unsubscribe = onValue(
      roomsRef,
      (snapshot) => {
        debugLog("ROOMS", "Received database update event");

        if (!snapshot.exists()) {
          debugLog("ROOMS", "No rooms found in snapshot");
          callback([]);
          return;
        }

        try {
          const roomsData = snapshot.val();
          debugLog("ROOMS", "Raw rooms data", roomsData);

          const roomsArray = Object.entries(roomsData).map(([id, data]) => {
            debugLog("ROOMS", `Processing room ${id}`, data);
            return {
              ...(data as Omit<GameRoom, "id">),
              id,
            };
          });

          debugLog("ROOMS", "Converted rooms array", roomsArray);
          callback(roomsArray);
        } catch (error) {
          debugError("ROOMS", "Error processing rooms data", error);
          callback([]);
        }
      },
      (error) => {
        debugError("ROOMS", "Firebase listener error", error);
      },
    );

    return () => {
      debugLog("ROOMS", "Cleaning up rooms listener");
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

          if (
            typedRoom.players.length === 0 ||
            now - typedRoom.lastMove.timestamp > inactiveThreshold ||
            (typedRoom.status === "waiting" &&
              now - typedRoom.createdAt > inactiveThreshold)
          ) {
            debugLog("ROOMS", `Cleaning up inactive room: ${roomId}`);
            await remove(ref(database, `rooms/${roomId}`));
          }
        }
      }
    } catch (error) {
      debugError("ROOMS", "Error cleaning up inactive rooms", error);
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
          debugLog("ROOMS", `Removing empty room: ${roomId}`);
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
      debugError("ROOMS", `Error leaving room`, error);
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

        let currentBoard = convertBoardToArray(room.board);
        currentBoard[row][col] = `PLAYER ${playerNumber}`;

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

        debugLog("MOVES", "Making move", {
          roomId,
          row,
          col,
          playerNumber,
          newBoard: boardForStorage,
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
      debugError("MOVES", "Error making move", error);
      throw error;
    }
  },
};
