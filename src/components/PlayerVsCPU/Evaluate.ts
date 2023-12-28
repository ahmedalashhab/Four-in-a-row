export function evaluate(
  board: (string | null)[][],
  difficulty: number,
): number {
  let score = 0;

  // Check horizontal streaks
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length - 3; col++) {
      const streak: Array<string | null> = [
        board[row][col],
        board[row][col + 1],
        board[row][col + 2],
        board[row][col + 3],
      ];

      score += evaluateStreak(streak, difficulty);
    }
  }

  // Check vertical streaks
  for (let row = 0; row < board.length - 3; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const streak: Array<string | null> = [
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col],
      ];

      score += evaluateStreak(streak, difficulty);
    }
  }

  // Check major diagonal streaks
  for (let row = 0; row < board.length - 3; row++) {
    for (let col = 0; col < board[0].length - 3; col++) {
      const streak: Array<string | null> = [
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3],
      ];

      score += evaluateStreak(streak, difficulty);
    }
  }

  // Check minor diagonal streaks
  for (let row = 0; row < board.length - 3; row++) {
    for (let col = 3; col < board[0].length; col++) {
      const streak: Array<string | null> = [
        board[row][col],
        board[row + 1][col - 1],
        board[row + 2][col - 2],
        board[row + 3][col - 3],
      ];

      score += evaluateStreak(streak, difficulty);
    }
  }

  return score;
}

function evaluateStreak(
  streak: Array<string | null>,
  difficulty: number,
  maxDifficulty: number = 5, // Max difficulty level
): number {
  let score = 0;

  const numAIPlayer = streak.filter((value) => value === "PLAYER 2").length;
  const numHumanPlayer = streak.filter((value) => value === "PLAYER 1").length;

  if (numAIPlayer === 4) {
    score += 100;
  } else if (numAIPlayer === 3 && numHumanPlayer === 0) {
    score += (difficulty * 2) / maxDifficulty; // Normalize difficulty
  } else if (numAIPlayer === 2 && numHumanPlayer === 0) {
    score += difficulty / maxDifficulty; // Normalize difficulty
  }

  if (numHumanPlayer === 4) {
    score -= 100;
  } else if (numHumanPlayer === 3 && numAIPlayer === 0) {
    score -= (difficulty * 2) / maxDifficulty; // Normalize difficulty
  } else if (numHumanPlayer === 2 && numAIPlayer === 0) {
    score -= difficulty / maxDifficulty; // Normalize difficulty
  }

  return score;
}
