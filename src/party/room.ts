import type * as Party from "partykit/server";
import type { GameState } from "../types/Game.types";

export default class GameRoom implements Party.Server {
  constructor(readonly room: Party.Room) {}

  // Store game state in memory
  gameState: GameState = {
    board: Array(6).fill(Array(7).fill(null)),
    playerTurn: "PLAYER 1",
    player1Score: 0,
    player2Score: 0,
    winner: "",
    time: 30,
    lastGameWinner: null,
  };

  // Handle new WebSocket connections
  onConnect(conn: Party.Connection) {
    // Send current game state to new player
    conn.send(
      JSON.stringify({
        type: "GAME_STATE_UPDATE",
        payload: this.gameState,
      }),
    );
  }

  // Handle incoming messages
  async onMessage(message: string, sender: Party.Connection) {
    const data = JSON.parse(message);

    switch (data.type) {
      case "MOVE":
        // Update game state with the new move
        this.handleMove(data.payload);
        // Broadcast the move to all other players
        this.room.broadcast(message, [sender.id]);
        break;

      case "GAME_STATE_UPDATE":
        // Update the game state
        this.gameState = data.payload;
        // Broadcast new state to all players
        this.room.broadcast(message);
        break;

      case "SYNC_REQUEST":
        // Send current game state to requesting player
        sender.send(
          JSON.stringify({
            type: "SYNC_RESPONSE",
            payload: this.gameState,
          }),
        );
        break;
    }
  }

  private handleMove(moveData: { row: number; col: number; player: 1 | 2 }) {
    const { row, col, player } = moveData;

    // Update the board
    const newBoard = this.gameState.board.map((row) => [...row]);
    newBoard[row][col] = player === 1 ? "PLAYER 1" : "PLAYER 2";

    // Update game state
    this.gameState = {
      ...this.gameState,
      board: newBoard,
      playerTurn: player === 1 ? "PLAYER 2" : "PLAYER 1",
    };
  }

  // Handle disconnections
  onClose(conn: Party.Connection) {
    // Notify other players
    this.room.broadcast(
      JSON.stringify({
        type: "PLAYER_LEFT",
        payload: { id: conn.id },
      }),
      [conn.id],
    );
  }
}
