import { motion } from "framer-motion";
import { ComponentProps, FC } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.svg";
import pve from "../../assets/images/player-vs-cpu.svg";
import pvp from "../../assets/images/player-vs-player.svg";
import rules from "../../assets/images/rules.svg";
import settings from "../../assets/images/settings.svg";
import "../../index.css";

interface GameLinkButtonProps extends ComponentProps<"button"> {
  to: string;
  backgroundColor: string;
  color: string;
  imgSrc?: string;
  children: string;
}

interface AnimatedMenu {
  className?: string;
  children: React.ReactNode;
}

export const GameLinkButton: FC<GameLinkButtonProps> = ({
  to,
  backgroundColor,
  color,
  children,
  imgSrc,
  ...rest
}) => (
  <div className="flex items-center mt-[1.25rem]">
    <Link to={to}>
      <button
        className={`lg:w-[25rem] w-[21rem] lg:h-[4.5rem] h-[4rem] flex justify-between items-center rounded-[20px]
        border-[3px] ${backgroundColor} border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white
        text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300 select-none`}
        {...rest}
      >
        <h3 className={`text-${color} font-main font-bold select-none`}>
          {children}
        </h3>
        {imgSrc && <img src={imgSrc} alt={children} className="h-[2.5rem]" />}
      </button>
    </Link>
  </div>
);

export const AnimatedMenu: React.FC<AnimatedMenu> = ({
  className,
  children,
}) => (
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
    className={
      "lg:h-fit lg:w-[30rem] flex items-center justify-center h-[100svh] w-screen lg:rounded-[2.5rem] bg-[#7945FF] " +
      "lg:border-[3px] lg:border-black lg:shadow-mainCard lg:px-[2.5rem] lg:py-[3.75rem]"
    }
  >
    {children}
  </motion.div>
);

export const DesktopMainMenu = () => {
  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex flex-1 overflow-hidden">
      <AnimatedMenu>
        <div className="flex flex-col items-center justify-center">
          <div className="grid-cols-2">
            <img
              src={logo}
              alt="red counter"
              className="w-[3.25rem] h-[3.25rem] select-none"
            />
          </div>
          <div className="flex flex-col justify-center items-center mt-[3.75rem]">
            <GameLinkButton
              to="/pvp"
              backgroundColor={"bg-[#FFCE67]"}
              color="black"
              imgSrc={pvp}
            >
              PLAYER VS PLAYER
            </GameLinkButton>

            <GameLinkButton
              to="/pve"
              backgroundColor={"bg-[#FD6687]"}
              color="black"
              imgSrc={pve}
            >
              PLAYER VS CPU
            </GameLinkButton>

            <GameLinkButton
              to="/settings"
              backgroundColor={"bg-[#FFF]"}
              color="black"
              imgSrc={settings}
            >
              SETTINGS
            </GameLinkButton>

            <GameLinkButton
              to="/rules"
              backgroundColor={"bg-[#FFF]"}
              color="black"
              imgSrc={rules}
            >
              GAME RULES
            </GameLinkButton>
          </div>
        </div>
      </AnimatedMenu>
    </div>
  );
};
