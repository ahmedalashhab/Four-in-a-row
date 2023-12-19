import React, { useState } from "react";
import { Player } from "./Player";
import board_white from "../../assets/images/board-layer-white-large.svg";
import board_black from "../../assets/images/board-layer-black-large.svg";
import { Turn } from "../Shared/Turn";
import marker_red from "../../assets/images/marker-red.svg";
import marker_yellow from "../../assets/images/marker-yellow.svg";

export const GameBoard = () => {
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);

  return (
    <div className="flex items-center z-20">
      <Player pNumber={1} score={player1Score} />
      <div className="justify-center items-center flex relative">
        <img src={board_white} className="z-10" alt="white board" />
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
