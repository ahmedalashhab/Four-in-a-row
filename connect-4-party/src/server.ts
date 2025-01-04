import type * as Party from "partykit/server";

interface Player {
  id: string;
  score: number;
}

interface GameState {
  board: (string | null)[][]; // null for empty, "PLAYER 1" or "PLAYER 2" for filled
  playerTurn: string; // "PLAYER 1" or "PLAYER 2"
  winner: string | null; // null, "PLAYER 1", or "PLAYER 2"
  player1Score: number;
  player2Score: number;
  time: number;
  lastGameWinner: string | null;
}

interface GameRoom {
  id: string;
  players: Player[];
  gameState: GameState;
  lastActivity: number;
}

interface ServerMessage {
  type:
    | "CREATE_ROOM"
    | "JOIN_ROOM"
    | "MAKE_MOVE"
    | "GAME_STATE_UPDATE"
    | "UPDATE_SCORE"
    | "DESTROY_ROOM";
  payload: any;
}

const INITIAL_GAME_STATE: GameState = {
  board: Array(6)
    .fill(null)
    .map(() => Array(7).fill(null)),
  playerTurn: "PLAYER 1",
  winner: null,
  player1Score: 0,
  player2Score: 0,
  time: 30,
  lastGameWinner: null,
};

export default class Server implements Party.Server {
  private rooms: Map<string, GameRoom> = new Map();
  private readonly CLEANUP_INTERVAL = 1000 * 60 * 30; // 30 minutes

  constructor(readonly room: Party.Room) {
    console.log(`[Server] Initializing server for room ${room.id}`);
    // Cleanup inactive rooms periodically
    setInterval(() => this.cleanupInactiveRooms(), this.CLEANUP_INTERVAL);
  }

  private log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][Room: ${this.room.id}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  private cleanupInactiveRooms() {
    const now = Date.now();
    let cleanedCount = 0;

    this.log(`Starting cleanup of inactive rooms`);
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastActivity > this.CLEANUP_INTERVAL) {
        this.rooms.delete(roomId);
        cleanedCount++;
        this.log(`Cleaned up inactive room`, {
          roomId,
          lastActivity: new Date(room.lastActivity).toISOString(),
        });
      }
    }
    this.log(`Cleanup complete`, {
      cleanedCount,
      remainingRooms: this.rooms.size,
    });
  }

  private checkForWin(
    board: (string | null)[][],
    row: number,
    col: number,
    player: string,
  ): boolean {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal right
      [1, -1], // diagonal left
    ];

    for (const [dx, dy] of directions) {
      let count = 0;
      // Check in both directions
      for (let i = -3; i <= 3; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;

        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++;
          if (count === 4) return true;
        } else {
          count = 0;
        }
      }
    }
    return false;
  }

  private isDraw(board: (string | null)[][]): boolean {
    return board[0].every((cell) => !cell);
  }

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    this.log(`New connection established`, {
      connectionId: conn.id,
      userAgent: ctx.request.headers.get("user-agent"),
    });

    const roomState = this.rooms.get(this.room.id);
    if (roomState) {
      conn.send(
        JSON.stringify({
          type: "GAME_STATE_UPDATE",
          payload: roomState.gameState,
        }),
      );
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    try {
      const data = JSON.parse(message) as ServerMessage;
      this.log(`Received message`, { type: data.type, senderId: sender.id });

      switch (data.type) {
        case "CREATE_ROOM": {
          const roomId = this.room.id;
          this.log(`Creating new room`, { roomId });

          this.rooms.set(roomId, {
            id: roomId,
            players: [{ id: sender.id, score: 0 }],
            gameState: { ...INITIAL_GAME_STATE },
            lastActivity: Date.now(),
          });

          this.room.broadcast(
            JSON.stringify({
              type: "ROOM_CREATED",
              payload: { roomId },
            }),
          );
          break;
        }

        case "JOIN_ROOM": {
          const room = this.rooms.get(this.room.id);
          this.log(`Join room request`, {
            roomId: this.room.id,
            playerId: sender.id,
          });

          if (room && room.players.length < 2) {
            room.players.push({ id: sender.id, score: 0 });
            room.lastActivity = Date.now();
            this.rooms.set(this.room.id, room);

            this.room.broadcast(
              JSON.stringify({
                type: "PLAYER_JOINED",
                payload: { roomId: this.room.id, playerId: sender.id },
              }),
            );

            // Send current game state to the new player
            sender.send(
              JSON.stringify({
                type: "GAME_STATE_UPDATE",
                payload: room.gameState,
              }),
            );
          }
          break;
        }

        case "MAKE_MOVE": {
          const room = this.rooms.get(this.room.id);
          const { row, col, player } = data.payload;

          this.log(`Processing move`, {
            roomId: this.room.id,
            player,
            row,
            col,
          });

          if (
            room &&
            room.gameState.playerTurn === player &&
            !room.gameState.winner
          ) {
            // Update the board
            const newBoard = room.gameState.board.map((r) => [...r]);
            newBoard[row][col] = player;

            // Check for win
            const isWin = this.checkForWin(newBoard, row, col, player);
            const isDraw = this.isDraw(newBoard);

            // Update game state
            const newGameState: GameState = {
              ...room.gameState,
              board: newBoard,
              playerTurn: player === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1",
              winner: isWin ? player : isDraw ? "DRAW" : null,
              player1Score:
                isWin && player === "PLAYER 1"
                  ? room.gameState.player1Score + 1
                  : room.gameState.player1Score,
              player2Score:
                isWin && player === "PLAYER 2"
                  ? room.gameState.player2Score + 1
                  : room.gameState.player2Score,
              lastGameWinner: isWin ? player : room.gameState.lastGameWinner,
            };

            room.gameState = newGameState;
            room.lastActivity = Date.now();
            this.rooms.set(this.room.id, room);

            this.log(`Move processed`, {
              newState: newGameState,
              isWin,
              isDraw,
            });

            // Broadcast the updated state to all players
            this.room.broadcast(
              JSON.stringify({
                type: "GAME_STATE_UPDATE",
                payload: newGameState,
              }),
            );
          } else {
            this.log(`Invalid move`, {
              reason: !room
                ? "Room not found"
                : room.gameState.winner
                  ? "Game already won"
                  : "Not player's turn",
            });
          }
          break;
        }

        case "GAME_STATE_UPDATE": {
          const room = this.rooms.get(this.room.id);
          if (room) {
            room.gameState = data.payload;
            room.lastActivity = Date.now();
            this.rooms.set(this.room.id, room);
            this.room.broadcast(
              JSON.stringify({
                type: "GAME_STATE_UPDATE",
                payload: room.gameState,
              }),
            );
          }
          break;
        }

        case "DESTROY_ROOM": {
          if (this.rooms.has(this.room.id)) {
            this.rooms.delete(this.room.id);
            this.room.broadcast(
              JSON.stringify({
                type: "ROOM_DESTROYED",
                payload: { roomId: this.room.id },
              }),
            );
          }
          break;
        }
      }
    } catch (error) {
      this.log(`Error processing message`, {
        error: error instanceof Error ? error.message : "Unknown error",
        rawMessage: message,
      });
    }
  }

  onClose(conn: Party.Connection) {
    this.log(`Connection closing`, { connectionId: conn.id });

    const room = this.rooms.get(this.room.id);
    if (room) {
      room.players = room.players.filter((p) => p.id !== conn.id);
      room.lastActivity = Date.now();

      if (room.players.length === 0) {
        this.rooms.delete(this.room.id);
      } else {
        this.rooms.set(this.room.id, room);
      }

      this.room.broadcast(
        JSON.stringify({
          type: "PLAYER_LEFT",
          payload: { playerId: conn.id },
        }),
      );
    }
  }
}
