import React, { useEffect, useRef, useState } from "react";
import { Player } from "./Player";
import board_white from "../../assets/images/board-layer-white-large.svg";
import board_black from "../../assets/images/board-layer-black-large.svg";
import { Turn } from "./Turn";
import marker_red from "../../assets/images/marker-red.svg";
import marker_yellow from "../../assets/images/marker-yellow.svg";
import counter_red from "../../assets/images/counter-red-large.svg";
import counter_yellow from "../../assets/images/counter-yellow-large.svg";
import { motion } from "framer-motion";

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
}: GameBoardProps) => {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [counterZIndex, setCounterZIndex] = useState<number>(10);

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
    console.log("Initial gameBoard:", newGameBoard); // Log the initial gameBoard

    // Initialize a variable to store the row index of the empty cell
    let emptyCellRowIndex = null;

    // Iterate over the newGameBoard array from bottom to top
    for (let i = newGameBoard.length - 1; i >= 0; i--) {
      // Check if the cell in the selected column is empty
      if (newGameBoard[i][columnIndex] === null) {
        // If an empty cell is found, store its row index in the variable
        emptyCellRowIndex = i;
        console.log("Found empty cell at row:", i); // Log the row index of the empty cell
        // Break the loop
        break;
      }
    }

    const bounceTransition = {
      y: {
        duration: 0.4,
        yoyo: Infinity,
        ease: "easeOut",
        bounce: 0.5,
        from: -10,
      },
    };
    console.log(newGameBoard);
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
        console.log(playerTurn + " wins!");
        console.log("winner is" + ` ${winner}`);
        // End the game and display the winner

        return;
      }

      // Switch the player's turn
      setPlayerTurn((prevPlayerTurn: string) =>
        prevPlayerTurn === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1",
      );
    }
  };

  const gameBoardWhiteHover = (j: number | null): void => {
    setHoveredColumn(j);
  };

  const renderGameBoard = (): React.ReactElement => {
    return (
      <>
        <div className="flex ml-5 z-50 absolute">
          {gameBoard[0].map((cell, j) => (
            <div
              key={j}
              className="flex flex-col items-center relative mb-8"
              onMouseEnter={() => !winner && gameBoardWhiteHover(j)}
              onMouseLeave={() => !winner && gameBoardWhiteHover(null)}
              onClick={() => {
                !winner && dropCounter(j);
              }}
            >
              {hoveredColumn === j && (
                <img
                  src={playerTurn === "PLAYER 1" ? marker_red : marker_yellow}
                  alt="marker"
                  className={`w-[3.5rem] h-auto z-50 absolute top-0 translate-y-[-4.5rem] mr-3`}
                />
              )}
              {gameBoard.map((row: any, i) => (
                <div key={i} className="w-[5.5rem] h-[5.5rem]">
                  {row[j] === "PLAYER 1" ? (
                    <motion.img
                      src={counter_red}
                      alt="counter"
                      className="w-[4.5rem] absolute h-auto z-[-1]"
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
                      className="w-[4.5rem] absolute h-auto z-[-1]"
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

  return (
    <div className="flex items-center z-20">
      <Player pNumber={1} score={player1Score} />
      <div className="justify-center items-center flex relative">
        <img
          src={board_white}
          className={`relative z-${counterZIndex}`}
          alt="white board"
        />
        {renderGameBoard()}
        <img
          src={board_black}
          className="absolute translate-y-1 z-[-1] top-50 left-50"
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
        />
      </div>
      <Player pNumber={2} score={player2Score} />
    </div>
  );
};
