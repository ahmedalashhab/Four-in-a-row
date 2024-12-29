import back from "../../assets/images/back.svg";
import pvp from "../../assets/images/player-vs-player.svg";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";

export const JoinRoom = () => {
  // this is a list of rooms that are available to join
  // the rooms are fetched from partykit
  // the rooms are displayed as a list of buttons

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
              to="/pvp/online/room/lobby"
              backgroundColor={"bg-[#FFCE67]"}
              color="black"
              imgSrc={pvp}
            >
              ROOM 1
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
