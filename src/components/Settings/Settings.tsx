import React, { FC } from "react";
import iconCheck from "../../assets/images/icon-check.svg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DropDown } from "./DropDown";

interface SettingsProps {
  difficulty: number;
  setDifficulty: React.Dispatch<React.SetStateAction<number>>;
}

export const Settings: FC<SettingsProps> = ({ difficulty, setDifficulty }) => {
  return (
    <div className="w-screen h-[100svh] bg-[#7945FF] justify-center items-center flex">
      <motion.div
        initial={{ y: -700 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1,
        }}
        className="h-fit w-[25rem] mx-[1.25rem] lg:mx-0 p-4 lg:p-[2rem] bg-white rounded-[40px] shadow-mainCard border-[3px] border-black
       relative flex flex-col font-main gap-[2rem]"
      >
        <div className="flex justify-center">
          <h1 className="font-bold text-[3.5rem]">SETTINGS</h1>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="text-[#7945FF] font-bold text-[1.25rem]">
            DIFFICULTY
          </h2>
          <DropDown difficulty={difficulty} setDifficulty={setDifficulty} />
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
      </motion.div>
    </div>
  );
};
