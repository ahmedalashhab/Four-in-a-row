import React from "react";
import { Nav } from "../Shared/Nav";
import { GameBoard } from "../Shared/GameBoard";

export const PlayerVsPlayer = () => {
  return (
    <div className="w-screen h-screen bg-[#7945FF] justify-center items-center flex relative">
      <Nav />
      <GameBoard />
      <div className="absolute w-screen h-[16rem] bg-[#5C2DD5] left-0 bottom-0 rounded-t-[60px]"></div>
    </div>
  );
};
