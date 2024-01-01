import React from "react";
import iconCheck from "../../assets/images/icon-check.svg";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SignInWithGoogle } from "../../firebase/Firebase";
import firebase from "firebase/compat";

interface SignInProps {
  user: firebase.User | null;
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>;
}

export const SignIn = ({ user, setUser }: SignInProps) => {
  return (
    <div className="w-screen h-[100svh] bg-[#7945FF] justify-center items-center flex select-none">
      <motion.div
        initial={{ y: -700 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 1,
        }}
        className="h-fit w-[25rem] mx-[1.25rem] lg:mx-0 px-4 py-10 lg:p-[2rem] bg-white rounded-[40px] shadow-mainCard border-[3px] border-black
         relative flex flex-col font-main gap-[2rem]"
      >
        <div className="flex justify-center">
          <h1 className="font-bold text-[3.5rem]">SIGN IN</h1>
        </div>
        {/*  sign in with google*/}
        <div className="flex justify-center">
          <button
            onClick={() => SignInWithGoogle(setUser, user)}
            className=" bg-yellow-400 text-black font-bold text-[1.25rem] rounded-[20px] shadow-mainCard border-[3px] py-2 px-6 border-black
            transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-[#FD6687] duration-300 select-none"
          >
            Sign in with Google
          </button>
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
