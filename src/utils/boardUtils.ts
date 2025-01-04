// Helper function to create a fresh board
export const createEmptyBoard = (): (string | null)[][] => {
  return Array(6)
    .fill(null)
    .map(() => Array(7).fill(0));
};

// Helper function to check if a move is valid
export const isValidMove = (
  board: (string | null)[][],
  col: number,
): boolean => {
  // Check if column is within bounds
  if (col < 0 || col >= 7) return false;

  // Check if the top cell in the column is empty
  return !board[0][col];
};

// Helper function to find the lowest empty row in a column
export const findLowestEmptyRow = (
  board: (string | null)[][],
  col: number,
): number => {
  for (let row = 5; row >= 0; row--) {
    if (!board[row][col]) {
      return row;
    }
  }
  return -1; // Column is full
};

// Helper function to check for a win
export const checkWin = (
  board: (string | null)[][],
  row: number,
  col: number,
  player: string,
): boolean => {
  // Check horizontal
  for (let c = 0; c <= 3; c++) {
    if (
      col >= c &&
      col < c + 4 &&
      board[row][c] === player &&
      board[row][c + 1] === player &&
      board[row][c + 2] === player &&
      board[row][c + 3] === player
    ) {
      return true;
    }
  }

  // Check vertical
  for (let r = 0; r <= 2; r++) {
    if (
      row >= r &&
      row < r + 4 &&
      board[r][col] === player &&
      board[r + 1][col] === player &&
      board[r + 2][col] === player &&
      board[r + 3][col] === player
    ) {
      return true;
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let r = 0; r <= 2; r++) {
    for (let c = 0; c <= 3; c++) {
      if (
        row >= r &&
        row < r + 4 &&
        col >= c &&
        col < c + 4 &&
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      ) {
        return true;
      }
    }
  }

  // Check diagonal (top-right to bottom-left)
  for (let r = 0; r <= 2; r++) {
    for (let c = 3; c < 7; c++) {
      if (
        row >= r &&
        row < r + 4 &&
        col <= c &&
        col > c - 4 &&
        board[r][c] === player &&
        board[r + 1][c - 1] === player &&
        board[r + 2][c - 2] === player &&
        board[r + 3][c - 3] === player
      ) {
        return true;
      }
    }
  }

  return false;
};

// Helper function to check if the board is full (draw)
export const isBoardFull = (board: (string | null)[][]): boolean => {
  return board[0].every((cell) => cell);
};

// Helper function to create a deep copy of the board
export const copyBoard = (board: (string | null)[][]): (string | null)[][] => {
  return board.map((row) => [...row]);
};
