import React from "react";
import "../../index.css";
import logo from "../../assets/images/logo.svg";
import pvp from "../../assets/images/player-vs-player.svg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const DesktopMainMenu = () => {
  return (
    <div className="w-screen h-screen bg-[#5C2DD5] justify-center items-center flex">
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
        className="h-[27rem] w-[30rem] rounded-[2.5rem] bg-[#7945FF] border-[3px] border-black shadow-mainCard px-[2.5rem] py-[3.75rem]"
      >
        <div className="flex flex-col justify-center items-center">
          <div className="grid-cols-2">
            {/*asset*/}
            <img
              src={logo}
              alt="red counter"
              className="w-[3.25rem] h-[3.25rem] select-none"
            />
          </div>
          <div className="flex flex-col justify-center items-center mt-[3.75rem]">
            <div className="flex flex-row items-center">
              <Link to={"/player-vs-player"}>
                <button
                  className="w-[25rem] h-[4.5rem] bg-[#FFCE67] flex justify-between items-center rounded-[20px]
              border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem]
              transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                >
                  <h3 className="text-black font-main font-bold select-none">
                    PLAYER VS PLAYER
                  </h3>
                  <img src={pvp} alt="pvp" className="h-[2.5rem]" />
                </button>
              </Link>
            </div>
            <div className="flex items-center mt-[1.25rem]">
              <Link to={"/rules"}>
                <button
                  className="w-[25rem] h-[4.5rem] flex justify-between items-center rounded-[20px]
                bg-[#FFF] border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                >
                  <h3 className="text-black font-main font-bold select-none">
                    GAME RULES
                  </h3>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
