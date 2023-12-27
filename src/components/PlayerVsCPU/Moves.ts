export function isValidMove(board: (string | null)[][], col: number): boolean {
  // A move is valid if the top-most row is empty
  return board[0][col] === null;
}

export function makeMove(
  board: (string | null)[][],
  col: number,
  player: "PLAYER 1" | "PLAYER 2",
): (string | null)[][] {
  // Copy the board
  let newBoard = board.map((row) => [...row]);

  // From bottom to top
  for (let row = newBoard.length - 1; row >= 0; row--) {
    if (newBoard[row][col] === null) {
      newBoard[row][col] = player;
      break;
    }
  }

  return newBoard;
}

export function getNewStates(
  board: (string | null)[][],
  player: "PLAYER 1" | "PLAYER 2",
): Array<{
  state: (string | null)[][];
  rowIndex: number;
  columnIndex: number;
}> {
  let newStates: Array<{
    state: (string | null)[][];
    rowIndex: number;
    columnIndex: number;
  }> = [];

  for (let col = 0; col < board[0].length; col++) {
    if (isValidMove(board, col)) {
      // Generate a new state with the new move
      let newState = makeMove(board, col, player);
      // Find the rowIndex for the move just made
      let rowIndex = newState.findIndex((row) => row[col] === player);
      // Push new state along with the new move's position
      newStates.push({ state: newState, rowIndex, columnIndex: col });
    }
  }

  return newStates;
}
