import React, { useState } from "react";
import { Player } from "./Player";
import board_white from "../../assets/images/board-layer-white-large.svg";
import board_black from "../../assets/images/board-layer-black-large.svg";
import { Turn } from "./Turn";
import marker_red from "../../assets/images/marker-red.svg";
import marker_yellow from "../../assets/images/marker-yellow.svg";
import counter_red from "../../assets/images/counter-red-large.svg";
import counter_yellow from "../../assets/images/counter-yellow-large.svg";

export const GameBoard: React.FC = () => {
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [playerTurn, setPlayerTurn] = useState<string>("PLAYER 1");
  const [gameBoard, setGameBoard] = useState<
    Array<Array<React.ReactElement | null>>
  >(Array(6).fill(Array(7).fill(null)));
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);

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

    // If an empty cell was found
    if (emptyCellRowIndex !== null) {
      // Update the newGameBoard to place the current player's counter in the empty cell
      newGameBoard[emptyCellRowIndex][columnIndex] =
        playerTurn === "PLAYER 1" ? (
          <img
            src={counter_red}
            alt="red counter"
            className="w-[4.5rem] h-auto z-0"
          />
        ) : (
          <img
            src={counter_yellow}
            alt="yellow counter"
            className="w-[4.5rem] h-auto z-0"
          />
        );
      console.log("Updated gameBoard:", newGameBoard); // Log the updated gameBoard

      // Update the gameBoard state with the newGameBoard
      setGameBoard(newGameBoard);

      // Switch the player's turn
      setPlayerTurn((prevPlayerTurn) =>
        prevPlayerTurn === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1",
      );
    }
  };
  const renderGameBoard = (): React.ReactElement => {
    return (
      <div className="flex ml-5 z-50 absolute">
        {gameBoard[0].map((cell, j) => (
          <div
            key={j}
            className="flex flex-col items-center relative mb-8"
            onMouseEnter={() => setHoveredColumn(j)}
            onMouseLeave={() => setHoveredColumn(null)}
            onClick={() => dropCounter(j)}
          >
            {hoveredColumn === j && (
              <img
                src={playerTurn === "PLAYER 1" ? marker_red : marker_yellow}
                alt="marker"
                className="w-[3.5rem] h-auto z-50 absolute top-0 translate-y-[-4.5rem] mr-3"
              />
            )}
            {gameBoard.map((row, i) => (
              <div key={i} className="w-[5.5rem] h-[5.5rem]">
                {row[j]}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center z-20">
      <Player pNumber={1} score={player1Score} />
      <div className="justify-center items-center flex relative">
        <img src={board_white} className="z-30" alt="white board" />
        {renderGameBoard()}
        <img
          src={board_black}
          className="absolute translate-y-1 top-50 left-50"
          alt="board shadow"
        />
        <Turn />
      </div>
      <Player pNumber={2} score={player2Score} />
    </div>
  );
};
