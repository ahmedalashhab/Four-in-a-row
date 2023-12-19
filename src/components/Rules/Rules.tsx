import React from "react";
// @ts-ignore
import iconCheck from "../../assets/images/icon-check.svg";
import { Link } from "react-router-dom";

export const Rules = () => {
  return (
    <div className="w-screen h-screen bg-[#7945FF] justify-center items-center flex">
      <div
        className="h-[34rem] w-[30rem] p-[2rem] bg-white rounded-[40px] shadow-mainCard border-[3px] border-black
       relative flex flex-col justify-center font-main gap-[2rem]"
      >
        <div className="flex justify-center">
          <h1 className="font-bold text-[3.5rem]">RULES</h1>
        </div>
        <div>
          <h2 className="text-[#7945FF] font-bold text-[1.25rem]">OBJECTIVE</h2>
          <p className="text-[1rem]">
            Be the first player to connect 4 of the same colored discs in a row
            (either vertically, horizontally, or diagonally).
          </p>
        </div>
        <div>
          <h2 className="text-[#7945FF] font-bold text-[1.25rem]">
            HOW TO PLAY
          </h2>
          <div className="grid grid-cols-[0.1fr_1fr]">
            <div className="font-bold">1</div>
            <div>Red goes first in the first game.</div>

            <div className="font-bold">2</div>
            <div>
              Players must alternate turns, and only one disc can be dropped in
              each turn.
            </div>

            <div className="font-bold">3</div>
            <div>The game ends when there is a 4-in-a-row or a stalemate.</div>

            <div className="font-bold">4</div>
            <div>
              The starter of the previous game goes second on the next game.
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <Link
            to={"/"}
            className="absolute ease-in-out bottom-0 translate-y-1/2"
          >
            <img
              src={iconCheck}
              alt="accept"
              className="transition cursor-pointer hover:-translate-y-1 hover:scale-110 duration-300"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};