import React from "react";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";
import pvp from "../../assets/images/player-vs-player.svg";
import online from "../../assets/images/online.svg";
import back from "../../assets/images/back.svg";

export const JoinRoom = () => {
  // this is a list of rooms that are available to join
  // the rooms are fetched from partykit

  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex flex-1 overflow-hidden">
      <AnimatedMenu>
        <div className="flex flex-col items-center justify-center">
          <div className="grid-cols-2">
            <h3 className="text-white font-bold text-[56px] select-none">
              ROOMS
            </h3>
          </div>
          <div className="flex flex-col justify-center items-center mt-[3.75rem]">
            <GameLinkButton
              to="/pvp/offline"
              backgroundColor={"bg-[#FFCE67]"}
              color="black"
              imgSrc={pvp}
            >
              OFFLINE PVP
            </GameLinkButton>
            <GameLinkButton
              to="/pvp/online"
              backgroundColor={"bg-[#74A4BC]"}
              color="black"
              imgSrc={online}
            >
              ONLINE PVP
            </GameLinkButton>
            <GameLinkButton
              to="/"
              backgroundColor={"bg-[#FFF]"}
              color="black"
              imgSrc={back}
            >
              BACK
            </GameLinkButton>
          </div>
        </div>
      </AnimatedMenu>
    </div>
  );
};
