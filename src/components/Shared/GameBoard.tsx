import React, { useEffect, useState } from "react";
import { Player } from "./Player";
import board_white from "../../assets/images/board-layer-white-large.svg";
import board_black from "../../assets/images/board-layer-black-large.svg";
import { Turn } from "./Turn";
import marker_red from "../../assets/images/marker-red.svg";
import marker_yellow from "../../assets/images/marker-yellow.svg";
import counter_red from "../../assets/images/counter-red-large.svg";
import counter_yellow from "../../assets/images/counter-yellow-large.svg";
import { motion } from "framer-motion";
import { evaluate } from "../PlayerVsCPU/Evaluate";
import { makeMove, isValidMove, getNewStates } from "../PlayerVsCPU/Moves";

interface GameBoardProps {
  winner: string;
  setWinner: (arg0: string) => void;
  setPlayerTurn: (arg0: any) => void;
  playerTurn: string;
  setTime: (arg0: number) => void;
  time: number;
  setGameBoard: (arg0: (string | null)[][]) => void;
  gameBoard: (string | null)[][];
  player1Score: number;
  setPlayer1Score: (arg0: any) => void;
  player2Score: number;
  setPlayer2Score: (arg0: any) => void;
  resetGame: () => void;
  open: boolean;
  setOpen: (arg0: boolean) => void;
  cpuMode: boolean;
  difficulty: number;
}

export const GameBoard = ({
  winner,
  setWinner,
  setPlayerTurn,
  playerTurn,
  setTime,
  time,
  setGameBoard,
  gameBoard,
  player1Score,
  setPlayer1Score,
  player2Score,
  setPlayer2Score,
  resetGame,
  open,
  setOpen,
  cpuMode,
  difficulty,
}: GameBoardProps) => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [counterZIndex, setCounterZIndex] = useState<number>(10);

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

  const dropCounter = (columnIndex: number): void => {
    console.log(columnIndex); // Log the selected column index
    // Create a deep copy of the gameBoard array
    let newGameBoard = gameBoard.map((row) => [...row]);

    // Initialize a variable to store the row index of the empty cell
    let emptyCellRowIndex = null;

    // Iterate over the newGameBoard array from bottom to top
    for (let i = newGameBoard.length - 1; i >= 0; i--) {
      // Check if the cell in the selected column is empty
      if (newGameBoard[i][columnIndex] === null) {
        // If an empty cell is found, store its row index in the variable
        emptyCellRowIndex = i;
        // Break the loop
        break;
      }
    }

    // In the dropCounter function
    if (emptyCellRowIndex !== null) {
      // Update the newGameBoard to place the current player's turn in the empty cell
      newGameBoard[emptyCellRowIndex][columnIndex] = playerTurn;

      // Update the gameBoard state with the newGameBoard
      setGameBoard(newGameBoard);

      // Check for win
      if (checkForWin(newGameBoard, emptyCellRowIndex, columnIndex)) {
        // Update the score of the current player
        if (playerTurn === "PLAYER 1") {
          setPlayer1Score((prevPlayer1Score: number) => prevPlayer1Score + 1);
        } else {
          setPlayer2Score((prevPlayer2Score: number) => prevPlayer2Score + 1);
        }
        setWinner(playerTurn);
        // End the game and display the winner

        return;
      }

      // Switch the player's turn
      setPlayerTurn((prevPlayerTurn: string) =>
        prevPlayerTurn === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1",
      );
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

  const renderGameBoard = (): React.ReactElement => {
    return (
      <>
        <div className="flex lg:ml-2 lg:mt-2 lg:pl-0 z-50 absolute">
          {gameBoard[0].map((cell, j) => (
            <div
              key={j}
              className="flex flex-col items-center relative lg:mb-8 mb-4 cursor-pointer"
              onMouseEnter={() => !winner && gameBoardWhiteHover(j)}
              onMouseLeave={() => !winner && gameBoardWhiteHover(null)}
              onClick={() => {
                if (!winner && (!cpuMode || playerTurn === "PLAYER 1")) {
                  dropCounter(j);
                }
              }}
            >
              {hoveredColumn === j && !isPhone && (
                <img
                  src={playerTurn === "PLAYER 1" ? marker_red : marker_yellow}
                  alt="marker"
                  className={`lg:w-[3.5rem] w-[2rem] lg:h-auto select-none z-50 absolute top-0 lg:translate-y-[-4.5rem] 
                  translate-y-[-3rem] lg:mr-1`}
                />
              )}
              {gameBoard.map((row: any, i) => (
                <div
                  key={i}
                  className="lg:w-[4.6rem] lg:h-[4.6rem] select-none sm:w-[5.25rem] sm:h-[5.25rem] md:w-[5.8rem]
                  md:h-[5.8rem] w-[3.1rem] h-[3.1rem] pl-[4px] lg:pl-0"
                >
                  {row[j] === "PLAYER 1" ? (
                    <motion.img
                      src={counter_red}
                      alt="counter"
                      className="lg:w-[4rem] sm:w-[4.6rem] md:w-[4.8rem] w-[2.5rem] select-none absolute h-auto z-[-1]"
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
                      onAnimationStart={() => {
                        setCounterZIndex(0);
                      }}
                      onAnimationComplete={() => {
                        setCounterZIndex(50);
                      }}
                      className="lg:w-[4rem] sm:w-[4.6rem] md:w-[4.8rem] w-[2.5rem] select-none absolute h-auto z-[-1]"
                      initial={{ y: -700 }}
                      animate={{ y: 0 }}
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
    // Iterate over every cell in the top row (last available places to play a move)
    for (let i = 0; i < board[0].length; i++) {
      // If any cell in the top row is NULL, return false (game can still be played)
      if (board[0][i] === null) {
        return false;
      }
    }

    // If we haven't returned yet, there must be no empty cells left
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
    if (cpuMode && playerTurn === "PLAYER 2" && !winner) {
      let bestMove = getBestMove(gameBoard, difficulty);
      let randomColumn = Math.floor(Math.random() * 7);
      // wait 1 second before dropping the counter
      setTimeout(() => {
        difficulty === 0 ? dropCounter(randomColumn) : dropCounter(bestMove);
      }, randomWaitTime * 1000);
    }
    isDraw(gameBoard) && setWinner("NOBODY");
  }, [playerTurn]);

  const isPhone = window.innerWidth < 821;

  return (
    <motion.div
      // slide the page in from the right
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="flex lg:flex-row flex-col items-center z-20 lg:pr-12"
    >
      <div className="flex justify-between mb-[1.5rem] lg:mb-0 w-screen lg:w-auto px-5">
        <div>{isPhone && <Player pNumber={1} score={player1Score} />}</div>
        <div>{isPhone && <Player pNumber={2} score={player2Score} />}</div>
      </div>
      {!isPhone && <Player pNumber={1} score={player1Score} />}
      <div className="justify-center items-center flex relative">
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
          playerTurn={playerTurn}
          setPlayerTurn={setPlayerTurn}
          time={time}
          setTime={setTime}
          player1Score={player1Score}
          player2Score={player2Score}
          winner={winner}
          resetGame={resetGame}
          open={open}
          setOpen={setOpen}
        />
      </div>
      {!isPhone && <Player pNumber={2} score={player2Score} />}
    </motion.div>
  );
};
