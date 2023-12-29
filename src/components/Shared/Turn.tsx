import React, { useEffect, useState } from "react";
import turn_red from "../../assets/images/turn-background-red.svg";
import turn_yellow from "../../assets/images/turn-background-yellow.svg";
import { isValidMove } from "../PlayerVsCPU/Moves";

interface TurnProps {
  time: number;
  setTime: (arg0: any) => void;
  playerTurn: string;
  setPlayerTurn: (arg0: string) => void;
  player1Score: number;
  player2Score: number;
  winner: string;
  resetGame: () => void;
  open: boolean;
  setOpen: (arg0: boolean) => void;
  dropCounter: (columnIndex: number) => void;
  gameBoard: (string | null)[][];
}

export const Turn = ({
  time,
  setTime,
  playerTurn,
  setPlayerTurn,
  player1Score,
  player2Score,
  winner,
  resetGame,
  open,
  setOpen,
  dropCounter,
  gameBoard,
}: TurnProps) => {
  // generate a random number between 1 and 7 then check if the move is valid
  const [randomNum, setRandomNum] = useState<number>(0);
  const handleClick = () => {
    dropCounter(randomNum);
    setPlayerTurn(playerTurn === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1");
    setTime(30);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      !open && setTime((prevTime: number) => prevTime - 1);
    }, 1000);

    // When time is 0, make random move
    if (time === 0 && !open) {
      let randomNum;
      do {
        randomNum = Math.floor(Math.random() * 7);
      } while (!isValidMove(gameBoard, randomNum));
      setRandomNum(randomNum);
      handleClick();
    }

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, [time, open, gameBoard]);

  useEffect(() => {
    setTime(30);
  }, [playerTurn]);

  return (
    <div className="absolute font-bold bottom-0 translate-y-32 z-50 select-none scale-75 lg:scale-100">
      {winner ? (
        <div className="relative mt-8 lg:mt-0">
          <div
            className={`lg:h-[10rem] lg:w-[18rem] w-[17.8rem] h-[10rem] bg-white border-2 border-black shadow-mainCard rounded-[20px] flex justify-center relative font-main font-bold"`}
          >
            <div className="flex flex-col justify-center items-center font-bold">
              <span className="text-[16px]">{winner}</span>
              <div className="h-16 flex items-center">
                <span className="text-[56px]">WINS</span>
              </div>
              <button
                className="flex justify-center text-[16px] items-center bg-[#5C2DD5] px-6 py-2 rounded-[20px]
              text-white hover:brightness-125 transition-all ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                onClick={resetGame}
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img
            alt="turn indicator"
            src={playerTurn === "PLAYER 1" ? turn_red : turn_yellow}
            className="lg:w-[13rem] w-[12rem] h-auto mt-8 lg:mt-0"
          />
          <div className="absolute mt-2 text-white w-full px-[1.5rem] flex flex-col justify-center items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="font-bold text-[16px] mb-[-0.5rem]">
              {playerTurn}'S TURN
            </span>
            <h3 className="text-[56px]">{time}s</h3>
          </div>
        </div>
      )}
    </div>
  );
};
