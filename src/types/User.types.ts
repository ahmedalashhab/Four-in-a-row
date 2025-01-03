export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface GamePlayer extends User {
  playerNumber: 1 | 2;
  score: number;
  ready?: boolean;
}

interface LastMove {
  row: number;
  col: number;
  player: 1 | 2;
  timestamp: number;
}

export interface GameRoom {
  id: string;
  players: GamePlayer[];
  currentTurn: 1 | 2;
  status: "waiting" | "playing" | "finished";
  winner: string | null;
  createdAt: number;
  lastMove: LastMove;
  board: (string | null)[][];
  time: number;
}
