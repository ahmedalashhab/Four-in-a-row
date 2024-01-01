import { clsx } from "clsx";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import iconCheck from "../../assets/images/icon-check.svg";
import { SignInWithGoogle } from "../../firebase/Firebase";
import { useUser } from "../../hooks/useUser";

export const SignIn = () => {
  const {user, loading} = useUser();
  console.log(user)
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
          {!loading && <h1 className="font-bold text-[3.5rem]">
            {user ? "ONLINE PVP" : "SIGN IN"}
          </h1>}
        </div>
        {/*  sign in with google*/}
        {!loading && <div className="flex flex-col justify-center gap-5">
          <button
            onClick={() => SignInWithGoogle()}
            className={clsx(" text-black font-bold text-[1.25rem] rounded-[20px] border-[3px] py-2 px-6 border-black",
            "transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:brightness-125 duration-300 select-none", 
            user ? "pointer-events-none bg-[#e0e0e0]" : "shadow-mainCard bg-[#FFCE67]")}
          >
            Logged in as: {loading ? "Loading..." : user ? user.displayName : "Sign in with Google"}
          </button>
          <button
                 className={clsx("bg-[#67ffb8] text-black font-bold text-[1.25rem] rounded-[20px] shadow-mainCard border-[3px] py-2 px-6 border-black",
                 "transition ease-in-out hover:-translate-y-1 hover:scale-110 hover:brightness-125 duration-300 select-none", 
                )}
          >
            Create room
          </button>
        </div>}
        <div className="flex justify-center">
          <Link
            to={"/"}
            className="absolute bottom-0 ease-in-out translate-y-1/2"
          >
            <img
              src={iconCheck}
              alt="accept"
              className="transition duration-300 cursor-pointer hover:-translate-y-1 hover:scale-110"
            />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
