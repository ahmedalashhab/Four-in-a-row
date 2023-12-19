import React, { useEffect, useState } from "react";
import turn_red from "../../assets/images/turn-background-red.svg";
import turn_yellow from "../../assets/images/turn-background-yellow.svg";

export const Turn = () => {
  const [playerTurn, setPlayerTurn] = useState<string>("PLAYER 1");
  const [time, setTime] = useState<number>(30);

  const handleClick = () => {
    setPlayerTurn(playerTurn === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1");
    setTime(30);
  };

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setTime(time - 1);
  //     if (time === 0) {
  //       handleClick();
  //     }
  //   }, 1000);
  //   return () => clearTimeout(timer);
  // }, [time]);

  return (
    <div className="absolute font-bold bottom-0 translate-y-3/4 z-10">
      <div className="relative">
        <img
          alt="turn indicator"
          src={playerTurn === "PLAYER 1" ? turn_red : turn_yellow}
          className="w-[13rem] h-auto"
        />
        <div className="absolute text-white w-full px-[1.5rem] flex flex-col justify-center items-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="font-bold text-[16px] mb-[-0.5rem]">
            {playerTurn}'S TURN
          </span>
          <h3 className="text-[56px]">{time}s</h3>
        </div>
      </div>
    </div>
  );
};
