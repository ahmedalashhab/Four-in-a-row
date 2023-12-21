import React from "react";
// @ts-ignore
import player1 from "../../assets/images/player-one.svg";
// @ts-ignore
import player2 from "../../assets/images/player-two.svg";

interface PlayerProps {
  pNumber: number;
  score: number;
}

export const Player = ({ pNumber, score }: PlayerProps) => {
  return (
    <div
      className={`${
        pNumber === 1 ? "mr-12" : "ml-12"
      } h-[10rem] w-[8.8rem] select-none bg-white border-2 border-black shadow-mainCard rounded-[20px] flex justify-center relative font-main font-bold"`}
    >
      <img
        src={pNumber === 1 ? player1 : player2}
        className="absolute top-0 w-[54px] h-[59px] translate-y-[-50%]"
        alt="player"
      />
      <div className="flex flex-col translate-y-5 justify-center items-center">
        <h3 className="text-[20px]">PLAYER {pNumber}</h3>
        <span className="text-[56px] mt-[-10px]">{score}</span>
      </div>
    </div>
  );
};
