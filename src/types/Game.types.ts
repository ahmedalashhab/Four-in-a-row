export interface GameState {
  board: (string | null)[][];
  playerTurn: string;
  player1Score: number;
  player2Score: number;
  winner: string;
  time: number;
  lastGameWinner: string | null;
  status?: "waiting" | "playing" | "finished";
}

export interface GameMove {
  row: number;
  col: number;
  player: number;
  timestamp?: number;
}

export interface GameStateUpdate {
  type:
    | "GAME_STATE_UPDATE"
    | "MOVE"
    | "SYNC_REQUEST"
    | "SYNC_RESPONSE"
    | "PLAYER_LEFT";
  payload: GameState | GameMove | { id: string };
}

export interface GamePlayer {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  playerNumber: 1 | 2;
  score: number;
  ready: boolean;
}

export interface LastMove {
  row: number;
  col: number;
  player: number;
  timestamp: number;
}

export interface GameRoom {
  id: string;
  players: GamePlayer[];
  currentTurn: number;
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  lastMove: LastMove;
  createdAt: number;
  time: number;
  board: (string | null)[][];
}
