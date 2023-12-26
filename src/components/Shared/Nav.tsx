import React from "react";
// @ts-ignore
import logo from "../../assets/images/logo.svg";
import { Link } from "react-router-dom";
import { Home } from "../Home/Home";

interface NavProps {
  restartGame: () => void;
  open: boolean;
  setOpen: (arg0: boolean) => void;
}

export const Nav = ({ restartGame, setOpen, open }: NavProps) => {
  return (
    <div className="flex items-center justify-center absolute top-0 font-main text-white text-[16px] select-none">
      <div className="lg:w-[39rem] w-screen relative lg:static px-[1.25rem] lg:px-0 flex justify-between items-center lg:mt-10 ">
        <button
          onClick={() => setOpen(!open)}
          className="bg-[#5C2DD5] absolute top-6 left-4 flex justify-center items-center rounded-2xl h-[2rem] py-[0.25rem] px-[1rem] hover:brightness-110 transition-all ease-in-out"
        >
          MENU
        </button>
        <img
          src={logo}
          alt="logo"
          className="w-[3.25rem] h-[3.25rem] absolute top-4 left-1/2 transform -translate-x-1/2"
        />
        <button
          onClick={restartGame}
          className="bg-[#5C2DD5] absolute top-6 right-4 flex justify-center items-center rounded-2xl h-[2rem] py-[0.25rem] px-[1rem] hover:brightness-110 transition-all ease-in-out"
        >
          RESTART
        </button>
      </div>
    </div>
  );
};
