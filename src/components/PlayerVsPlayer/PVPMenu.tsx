import { motion } from "framer-motion";
import back from "../../assets/images/back.svg";
import online from "../../assets/images/online.svg";
import pvp from "../../assets/images/player-vs-player.svg";
import { GameLinkButton } from "../Home/MainMenu";

export const PVPMenu = () => {
  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex flex-1 overflow-hidden">
      <motion.div
        initial={{ y: -700 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1,
          bounce: 0.25,
        }}
        className="lg:h-fit lg:w-[30rem] relative flex items-center justify-center h-[100svh] w-screen lg:rounded-[2.5rem]
      bg-[#7945ff] lg:border-[3px] lg:border-black lg:shadow-mainCard lg:px-[2.5rem] lg:py-[3.75rem]"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="grid-cols-2">
            <h3 className="text-white font-bold text-[56px] select-none">
              MULTIPLAYER
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
      </motion.div>
    </div>
  );
};
