import React from "react";
// @ts-ignore
import board_white from "../../assets/images/board-layer-white-large.svg";
// @ts-ignore
import board_black from "../../assets/images/board-layer-black-large.svg";

export const PlayerVsPlayer = () => {
  return (
    <div className="w-screen h-screen bg-[#7945FF] justify-center items-center flex relative">
      <img src={board_white} className="z-10" alt="white board" />
      <img
        src={board_black}
        className="absolute translate-y-1 top-50 left-50"
        alt="board shadow"
      />
      <div className="absolute w-screen h-[16rem] bg-[#5C2DD5] left-0 bottom-0 rounded-t-[60px]"></div>
    </div>
  );
};
