import React from "react";
// @ts-ignore
import logo from "../../assets/images/logo.svg";
import { Link } from "react-router-dom";
import { Home } from "../Home/Home";

export const Nav = () => {
  return (
    <div className="flex items-center justify-center absolute top-0 font-main text-white text-[16px]">
      <div className="w-[39rem] flex justify-between items-center mt-10">
        <Link to="/">
          <button className="bg-[#5C2DD5] flex justify-center items-center rounded-2xl h-[2rem] py-[0.25rem] px-[1rem] hover:brightness-110 transition-all ease-in-out">
            MENU
          </button>
        </Link>
        <img src={logo} alt="logo" className="w-[3.25rem] h-[3.25rem]" />
        <button className="bg-[#5C2DD5] flex justify-center items-center rounded-2xl h-[2rem] py-[0.25rem] px-[1rem] hover:brightness-110 transition-all ease-in-out">
          RESTART
        </button>
      </div>
    </div>
  );
};
