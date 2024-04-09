import React from "react";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";
import back from "../../assets/images/back.svg";
import play from "../../assets/images/play.svg";

interface PreGameRoomProps {
  roomId: string | null;
}

export const PreGameRoom = ({ roomId }: PreGameRoomProps) => {
  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex flex-1 overflow-hidden">
      <AnimatedMenu>
        <div className="flex flex-col items-center justify-center">
          <div className="grid-cols-2">
            <h3 className="text-white font-bold text-[56px] select-none">
              Your room ID is:
            </h3>
            <h3 className="flex justify-center items-center font-bold text-[32px] text-black">
              {roomId}
            </h3>
          </div>
          <div className="flex flex-col justify-center items-center mt-[3.75rem]">
            <GameLinkButton
              to={`/pvp/online/room/${roomId}`}
              backgroundColor={"bg-[#FFCE67]"}
              color="black"
              imgSrc={play}
            >
              START GAME
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
