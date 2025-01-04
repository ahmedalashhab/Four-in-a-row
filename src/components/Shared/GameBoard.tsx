import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import board_black from "../../assets/images/board-layer-black-large.svg";
import board_white from "../../assets/images/board-layer-white-large.svg";
import counter_red from "../../assets/images/counter-red-large.svg";
import counter_yellow from "../../assets/images/counter-yellow-large.svg";
import marker_red from "../../assets/images/marker-red.svg";
import marker_yellow from "../../assets/images/marker-yellow.svg";
import { gameService } from "../../firebase";
import type { GameMove, GameRoom } from "../../types/Game.types";
import { evaluate } from "../PlayerVsCPU/Evaluate";
import { getNewStates, isValidMove, makeMove } from "../PlayerVsCPU/Moves";
import { Player } from "./Player";
import { Turn } from "./Turn";

interface GameBoardProps {
  winner: string;
  setWinner: (winner: string) => void;
  setGameBoard: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
  gameBoard: (string | null)[][];
  player2Score: number;
  setPlayer2Score: (score: number | ((prev: number) => number)) => void;
  player1Score: number;
  setPlayer1Score: (score: number | ((prev: number) => number)) => void;
  time: number;
  setTime: (time: number) => void;
  playerTurn: string;
  setPlayerTurn: (turn: string | ((prev: string) => string)) => void;
  resetGame: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  cpuMode: boolean;
  difficulty: number;
  setLastGameWinner: (winner: string | null) => void;
  lastGameWinner: string | null;
  roomId: string | null;
  setRoomId: (roomId: string | null) => void;
  onMove?: (row: number, col: number) => void;
  isHost?: boolean;
  canMove?: boolean;
  playerNumber?: 1 | 2;
  online?: boolean;
  onlineOpponentReady?: boolean;
  setOnlineOpponentReady?: (ready: boolean) => void;
  gameRoom?: GameRoom;
  setCanMove?: (canMove: boolean) => void;
  winningPositions: Array<[number, number]>;
  setWinningPositions: (positions: Array<[number, number]>) => void;
}

// Add this type for move messages
interface MoveMessage {
  type: "MOVE";
  row: number;
  col: number;
  player: number;
}

// Add createEmptyBoard at the top with other helper functions
const createEmptyBoard = () =>
  Array(6)
    .fill(null)
    .map(() => Array(7).fill(null));

const ensureValidBoard = (board: any): (string | null)[][] => {
  if (!board || !Array.isArray(board)) {
    return Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));
  }

  if (Array.isArray(board[0])) {
    return board.map((row) =>
      Array.isArray(row) ? [...row] : Array(7).fill(null),
    );
  }

  return Array(6)
    .fill(null)
    .map((_, i) =>
      Array(7)
        .fill(null)
        .map((_, j) => {
          const rowData = board[i];
          return rowData && rowData[j] ? rowData[j] : null;
        }),
    );
};

// Add these constants at the top of the file
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

// Add this helper function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const GameBoard = ({
  winner,
  setWinner,
  setGameBoard,
  gameBoard,
  player2Score,
  setPlayer2Score,
  player1Score,
  setPlayer1Score,
  time,
  setTime,
  playerTurn,
  setPlayerTurn,
  resetGame,
  open,
  setOpen,
  cpuMode,
  difficulty,
  setLastGameWinner,
  lastGameWinner,
  roomId,
  setRoomId,
  onMove,
  isHost,
  canMove,
  playerNumber,
  online = false,
  onlineOpponentReady,
  setOnlineOpponentReady,
  gameRoom,
  setCanMove,
  winningPositions,
  setWinningPositions,
}: GameBoardProps) => {
  if (!gameBoard || !Array.isArray(gameBoard)) {
    console.error("Invalid gameBoard:", gameBoard);
    return null;
  }

  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [counterZIndex, setCounterZIndex] = useState<number>(10);
  const [counterStutter, setCounterStutter] = useState<boolean>(false);

  type BoardState = (string | null)[][];

  const checkForWin = (
    gameBoard: (string | null)[][],
    rowIndex: number,
    columnIndex: number,
  ): boolean => {
    const directions = [
      { x: 0, y: -1 }, // vertical
      { x: 1, y: 0 }, // horizontal
      { x: 1, y: -1 }, // diagonal from bottom-left to top-right
      { x: 1, y: 1 }, // diagonal from top-left to bottom-right
    ];

    for (let direction of directions) {
      let counter = 0;
      for (let i = -3; i <= 3; i++) {
        const x = columnIndex + i * direction.x;
        const y = rowIndex + i * direction.y;

        if (
          x >= 0 &&
          x < gameBoard[0].length &&
          y >= 0 &&
          y < gameBoard.length &&
          gameBoard[y][x] === gameBoard[rowIndex][columnIndex]
        ) {
          counter++;
          if (counter === 4) {
            return true;
          }
        } else {
          counter = 0;
        }
      }
    }

    return false;
  };

  const findEmptyCellInColumn = (
    columnIndex: number,
    board: (string | null)[][],
  ): number | null => {
    if (!board) return null;
    for (let rowIndex = board.length - 1; rowIndex >= 0; rowIndex--) {
      if (board[rowIndex][columnIndex] === null) {
        return rowIndex;
      }
    }
    return null;
  };

  // Add a move queue to handle rapid moves
  const [moveQueue, setMoveQueue] = useState<GameMove[]>([]);

  // Add mounted ref to track component lifecycle
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Modify the useEffect that processes the move queue
  useEffect(() => {
    if (!isMounted.current || moveQueue.length === 0) return;

    const move = moveQueue[0];

    if (isMounted.current) {
      setGameBoard((prevBoard) => {
        if (!prevBoard) return createEmptyBoard();
        const newBoard = prevBoard.map((row) => [...row]);
        newBoard[move.row][move.col] = `PLAYER ${move.player}`;
        return newBoard;
      });

      setPlayerTurn(`PLAYER ${move.player === 1 ? 2 : 1}`);
      setMoveQueue((prevQueue) => prevQueue.slice(1));
    }
  }, [moveQueue]);

  // Ensure we always have a valid local board
  const [localBoard, setLocalBoard] = useState<(string | null)[][]>(() =>
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
  );

  // Keep track of last processed move to prevent duplicates
  const lastProcessedMove = useRef<string | null>(null);

  // Handle incoming moves from Firebase
  useEffect(() => {
    if (!online || !gameRoom?.lastMove) {
      console.log("🎮 [BOARD] Skipping move update:", {
        online,
        hasLastMove: !!gameRoom?.lastMove,
      });
      return;
    }

    const { row, col, player } = gameRoom.lastMove;
    const moveKey = `${row}-${col}-${player}`;

    console.log("🎮 [BOARD] Processing move:", {
      moveKey,
      lastProcessed: lastProcessedMove.current,
      currentBoard: localBoard,
    });

    if (lastProcessedMove.current === moveKey) {
      console.log("🎮 [BOARD] Move already processed, skipping");
      return;
    }

    if (row === -1 || col === -1) {
      console.log("🎮 [BOARD] Invalid move coordinates, skipping");
      return;
    }

    setLocalBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      newBoard[row][col] = `PLAYER ${player}`;
      console.log("🎮 [BOARD] Updated local board:", newBoard);
      return newBoard;
    });

    lastProcessedMove.current = moveKey;
    setPlayerTurn(`PLAYER ${player === 1 ? 2 : 1}`);
  }, [gameRoom?.lastMove, online]);

  // Add this state
  const [pendingMoves, setPendingMoves] = useState<{ [key: string]: boolean }>(
    {},
  );

  // Modify the dropCounter function
  const dropCounter = async (columnIndex: number) => {
    if (online && !canMove) {
      console.log("🚫 Cannot move: not your turn");
      return;
    }

    if (winner || isProcessingMove) {
      return;
    }

    setIsProcessingMove(true);

    try {
      const rowIndex = findEmptyCellInColumn(columnIndex, gameBoard);
      if (rowIndex === null) {
        setIsProcessingMove(false);
        return;
      }

      if (online && roomId && playerNumber) {
        // Ensure roomId is not null and playerNumber is properly typed
        await handleMove(roomId, rowIndex, columnIndex, playerNumber as 1 | 2);
      } else {
        // Offline game logic
        if (onMove) {
          onMove(rowIndex, columnIndex);
        }
      }
    } catch (error) {
      console.error("Error making move:", error);
    } finally {
      setIsProcessingMove(false);
    }
  };

  // listen for keydown events and open modal if escape is pressed
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "Escape") {
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const gameBoardWhiteHover = (j: number | null): void => {
    setHoveredColumn(j);
  };

  function isTerminal(node: {
    state: BoardState;
    rowIndex: number;
    columnIndex: number;
  }): boolean {
    // check if this state is a win for the current player
    if (checkForWin(node.state, node.rowIndex, node.columnIndex)) {
      return true;
    }

    // check if the board state is a draw
    // i.e., if there are no nulls left in the board (all cells are filled)
    if (!node.state.some((row) => row.includes(null))) {
      return true;
    }

    // if we haven't returned by now, the game isn't over
    return false;
  }

  function minimax(
    node: { state: BoardState; rowIndex: number; columnIndex: number },
    depth: number,
    maximizingPlayer: boolean,
    difficulty: number,
  ): number {
    // adjust depth based on difficulty
    let adjustedDepth = Math.ceil((depth * difficulty) / 5); // or maybe something else?

    if (adjustedDepth === 0 || isTerminal(node)) {
      return evaluate(node.state, difficulty);
    }

    if (maximizingPlayer) {
      let value = -Number.MAX_VALUE;
      const newStates = getNewStates(node.state, "PLAYER 2");
      newStates.forEach((child: any) => {
        let score = minimax(child, depth - 1, false, difficulty); // switch to minimizing
        value = Math.max(value, score);
      });

      return value;
    } else {
      let value = Number.MAX_VALUE;
      const newStates = getNewStates(node.state, "PLAYER 1");
      newStates.forEach((child: any) => {
        let score = minimax(child, depth - 1, true, difficulty); // switch to maximizing
        value = Math.min(value, score);
      });

      return value;
    }
  }

  useEffect(() => {
    // whenever gameBoard changes, update the local board
    setLocalBoard(gameBoard);
    // check if the gameBoard is completely empty
    if (gameBoard.every((row) => row.every((cell) => cell === null))) {
      setWinner("");
    }
  }, [gameBoard]);

  const renderGameBoard = (): JSX.Element => {
    if (!localBoard) {
      console.error("No valid board state");
      return <div>Loading game board...</div>;
    }

    return (
      <>
        <div className="absolute z-50 flex lg:ml-2 lg:mt-2 lg:pl-0">
          {localBoard[0].map((cell, j) => (
            <div
              key={j}
              className="relative flex flex-col items-center mb-4 cursor-pointer lg:mb-8"
              onMouseEnter={() => !winner && gameBoardWhiteHover(j)}
              onMouseLeave={() => !winner && gameBoardWhiteHover(null)}
              onClick={() => {
                if (
                  !winner &&
                  (!cpuMode || playerTurn === "PLAYER 1") &&
                  (!online || canMove)
                ) {
                  dropCounter(j);
                }
              }}
            >
              {hoveredColumn === j &&
                !isPhone &&
                ((cpuMode && playerTurn === "PLAYER 1") || !cpuMode) && (
                  <img
                    src={playerTurn === "PLAYER 1" ? marker_red : marker_yellow}
                    alt="marker"
                    className={`lg:w-[3.5rem] w-[2rem] lg:h-auto select-none z-50 absolute top-0 lg:translate-y-[-4.5rem] 
                  translate-y-[-3rem] lg:mr-1`}
                  />
                )}
              {localBoard.map((row: any, i) => (
                <div
                  key={i}
                  className="lg:w-[4.6rem] lg:h-[4.6rem] select-none sm:w-[5.25rem] sm:h-[5.25rem] md:w-[5.8rem]
                  md:h-[5.8rem] w-[3.1rem] h-[3.1rem] pl-[4px] lg:pl-0"
                >
                  {row[j] === "PLAYER 1" ? (
                    <motion.img
                      src={counter_red}
                      alt="counter"
                      className={`lg:w-[4rem] sm:w-[4.6rem] md:w-[4.8rem] w-[2.5rem] 
                        select-none absolute h-auto z-[-1]
                        ${
                          winningPositions.some(
                            ([row, col]) => row === i && col === j,
                          )
                            ? "animate-winning-counter"
                            : ""
                        }`}
                      initial={{ y: -700 }}
                      animate={{ y: 0 }}
                      onAnimationStart={() => {
                        setCounterZIndex(0);
                      }}
                      onAnimationComplete={() => {
                        setCounterZIndex(50);
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 1,
                      }}
                    />
                  ) : row[j] === "PLAYER 2" ? (
                    <motion.img
                      src={counter_yellow}
                      alt="counter"
                      className={`lg:w-[4rem] sm:w-[4.6rem] md:w-[4.8rem] w-[2.5rem] 
                        select-none absolute h-auto z-[-1]
                        ${
                          winningPositions.some(
                            ([row, col]) => row === i && col === j,
                          )
                            ? "animate-winning-counter"
                            : ""
                        }`}
                      initial={{ y: -700 }}
                      animate={{ y: 0 }}
                      onAnimationStart={() => {
                        setCounterZIndex(0);
                      }}
                      onAnimationComplete={() => {
                        setCounterZIndex(50);
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 1,
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  };

  function isDraw(board: (string | null)[][]): boolean {
    // Check if any column in the board has empty spaces
    for (let col = 0; col < board[0].length; col++) {
      // Check if the top cell in this column is empty
      if (board[0][col] === null) {
        return false; // Found an empty space, game is not a draw
      }
    }

    // If we get here, all columns are full
    return true;
  }

  function getBestMove(board: (string | null)[][], depth: number): number {
    let bestValue = -Number.MAX_VALUE; // Initialize bestValue
    let moves: any[] = [];

    for (let col = 0; col < board[0].length; col++) {
      if (isValidMove(board, col)) {
        let tempBoard = makeMove(board, col, "PLAYER 2"); // Assume the AI is 'PLAYER 2'
        let tempRowIndex = tempBoard.findIndex(
          (row) => row[col] === "PLAYER 2",
        );
        let boardState = {
          state: tempBoard,
          rowIndex: tempRowIndex,
          columnIndex: col,
        };
        let moveValue = minimax(boardState, depth - 1, false, difficulty); // calculate value of this move

        // if this move's value is greater than the current bestValue, update bestValue and bestMove
        if (moveValue > bestValue) {
          bestValue = moveValue;
          moves = [col];
        } else if (moveValue === bestValue) {
          moves.push(col);
        }
      }
    }

    // Choose a random move among the best moves
    let finalMove = moves[Math.floor(Math.random() * moves.length)];

    return finalMove; // This is the column that AI would like to drop its piece
  }

  // random number beween 1 and 5
  const randomWaitTime = Math.floor(Math.random() * 5) + 1;

  useEffect(() => {
    // whenever player 1 plays, wait 1 second before player 2 plays
    // this is to prevent a stutter when the minimax algorithm is calculating the best move
    setTimeout(() => {
      setCounterStutter(!counterStutter);
    }, randomWaitTime * 1000);
  }, [playerTurn, winner]);

  useEffect(() => {
    if (cpuMode && playerTurn === "PLAYER 2" && !winner) {
      let bestMove = getBestMove(localBoard, difficulty);
      let randomColumn = Math.floor(Math.random() * 7);
      // wait 1 second before dropping the counter
      difficulty === 0 ? dropCounter(randomColumn) : dropCounter(bestMove);
    }
    isDraw(localBoard) && setWinner("NOBODY");
  }, [counterStutter]);

  const isPhone = window.innerWidth < 821;

  // Function to check for win condition
  const checkWin = (
    board: (string | null)[][],
    row: number,
    col: number,
  ): boolean => {
    const currentPlayer = board[row][col];
    if (!currentPlayer) return false;

    // Check horizontal
    let count = 0;
    for (let c = 0; c < 7; c++) {
      if (board[row][c] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
    }

    // Check vertical
    count = 0;
    for (let r = 0; r < 6; r++) {
      if (board[r][col] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
    }

    // Check diagonal (top-left to bottom-right)
    let r = row - Math.min(row, col);
    let c = col - Math.min(row, col);
    count = 0;
    while (r < 6 && c < 7) {
      if (board[r][c] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
      r++;
      c++;
    }

    // Check diagonal (top-right to bottom-left)
    r = row - Math.min(row, 6 - col);
    c = col + Math.min(row, 6 - col);
    count = 0;
    while (r < 6 && c >= 0) {
      if (board[r][c] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
      r++;
      c--;
    }

    return false;
  };

  const updateScores = (currentPlayer: string) => {
    if (currentPlayer === "PLAYER 1") {
      setPlayer1Score((prev) => prev + 1);
    } else {
      setPlayer2Score((prev) => prev + 1);
    }
  };

  // Add this effect to handle board updates
  useEffect(() => {
    if (!gameRoom?.board) return;

    setLocalBoard(gameRoom.board);
    console.log("🎮 Updated game board from room state:", gameRoom.board);
  }, [gameRoom?.board, setLocalBoard]);

  // Add effect to sync board state from Firebase
  useEffect(() => {
    if (!online || !gameRoom?.board) {
      console.log("🎮 [SYNC] Skipping sync:", {
        online,
        hasBoard: !!gameRoom?.board,
      });
      return;
    }

    console.log("🎮 [SYNC] Syncing board from Firebase:", {
      board: gameRoom.board,
      lastMove: gameRoom.lastMove,
      currentTurn: gameRoom.currentTurn,
    });

    const validBoard = ensureValidBoard(gameRoom.board);
    console.log("🎮 [SYNC] Validated board:", validBoard);

    setLocalBoard(validBoard);
    setGameBoard(validBoard);

    if (gameRoom.lastMove) {
      const { row, col, player } = gameRoom.lastMove;
      console.log("🎮 [SYNC] Checking win condition:", { row, col, player });

      if (checkWin(validBoard, row, col)) {
        console.log("🎮 [SYNC] Win detected for Player", player);
        setWinner(`PLAYER ${player}`);
        updateScores(`PLAYER ${player}`);
      }
    }
  }, [gameRoom?.board, gameRoom?.lastMove]);

  // Add the handleMove function
  const handleMove = async (
    roomId: string,
    rowIndex: number,
    columnIndex: number,
    playerNumber: 1 | 2, // Explicitly type as 1 | 2
  ) => {
    try {
      const newBoard = gameBoard.map((row) => [...row]);
      newBoard[rowIndex][columnIndex] = `PLAYER ${playerNumber}`;
      setLocalBoard(newBoard);
      setGameBoard(newBoard);

      // Make the move in Firebase
      await gameService.makeMove(roomId, rowIndex, columnIndex, playerNumber);

      // Check for win after successful move - but don't update scores here
      if (checkWin(newBoard, rowIndex, columnIndex)) {
        setWinner(`PLAYER ${playerNumber}`);
      }
      // Only check for draw if there's no winner
      else if (isDraw(newBoard)) {
        setWinner("NOBODY");
      }
    } catch (error) {
      console.error("Error making move:", error);
      // Revert local board on error
      setLocalBoard(gameBoard);
    }
  };

  // Update the useEffect that handles game state updates
  useEffect(() => {
    if (!online || !gameRoom?.board) return;

    const validBoard = ensureValidBoard(gameRoom.board);
    setGameBoard(validBoard);

    // Update turn state based on gameRoom state
    const currentTurn = `PLAYER ${gameRoom.currentTurn}`;
    setPlayerTurn(currentTurn);

    // Check for draw condition
    if (!winner && isDraw(validBoard)) {
      setWinner("NOBODY");
    }

    // Only update canMove if the prop is provided
    if (setCanMove) {
      const isPlayerTurn =
        (playerNumber === 1 && gameRoom.currentTurn === 1) ||
        (playerNumber === 2 && gameRoom.currentTurn === 2);
      setCanMove(isPlayerTurn);
    }
  }, [
    gameRoom?.board,
    gameRoom?.currentTurn,
    playerNumber,
    setCanMove,
    winner,
  ]);

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="z-20 flex flex-col items-center lg:flex-row lg:pr-12"
    >
      {/* Mobile view */}
      {isPhone && (
        <div className="flex justify-between mb-[1.5rem] lg:mb-0 w-screen lg:w-auto px-5">
          <Player
            pNumber={1}
            score={player1Score}
            online={online}
            isCurrentPlayer={playerNumber === 1}
            cpuMode={cpuMode}
          />
          <Player
            pNumber={2}
            score={player2Score}
            online={online}
            isCurrentPlayer={playerNumber === 2}
            cpuMode={cpuMode}
          />
        </div>
      )}

      {/* Desktop view */}
      {!isPhone && (
        <>
          <Player
            pNumber={1}
            score={player1Score}
            online={online}
            isCurrentPlayer={playerNumber === 1}
            cpuMode={cpuMode}
          />
          <div className="relative flex items-center justify-center">
            <img
              src={board_white}
              className={`relative z-${counterZIndex} select-none px-4 w-[24.2rem] sm:w-[40rem] md:w-[43.5rem] md:mt-3 lg:w-[35rem] h-auto`}
              alt="white board"
            />
            {renderGameBoard()}
            <img
              src={board_black}
              className="absolute translate-y-1 z-[-1] top-50 left-50 select-none px-4 w-[24.2rem] sm:w-[40rem] md:w-[43.5rem] md:mt-3 lg:w-[35rem] h-auto"
              alt="board shadow"
            />
            <Turn
              online={online}
              onlineOpponentReady={onlineOpponentReady}
              time={time}
              setTime={setTime}
              playerTurn={playerTurn}
              setPlayerTurn={setPlayerTurn}
              player1Score={player1Score}
              player2Score={player2Score}
              winner={winner}
              resetGame={resetGame}
              open={open}
              setOpen={setOpen}
              dropCounter={dropCounter}
              gameBoard={gameBoard}
              canMove={canMove}
              playerNumber={playerNumber}
              cpuMode={cpuMode}
            />
          </div>
          <Player
            pNumber={2}
            score={player2Score}
            online={online}
            isCurrentPlayer={playerNumber === 2}
            cpuMode={cpuMode}
          />
        </>
      )}
    </motion.div>
  );
};
