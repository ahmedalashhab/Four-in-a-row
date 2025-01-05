import { Dispatch, SetStateAction, useState } from "react";
import logo from "../../assets/images/logo.svg";
import Pause from "./Pause";

interface NavProps {
  restartGame: () => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  online?: boolean;
  setRoomId?: (roomId: string | null) => void;
}

export const Nav = ({
  restartGame,
  open,
  setOpen,
  online,
  setRoomId,
}: NavProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before fully closing
    setTimeout(() => {
      setIsClosing(false);
      setOpen(false);
    }, 150); // Match this with CSS animation duration
  };

  return (
    <div className="absolute top-0 left-0 w-screen flex justify-between items-center px-5 py-[1.125rem] lg:px-[1.25rem] lg:py-[3.25rem]">
      <button
        onClick={handleMenuClick}
        className="bg-[#5C2DD5] w-[6.75rem] h-[2.5rem] lg:w-[7.5rem] lg:h-[3rem] rounded-[20px] border-[3px] border-black shadow-mainCard hover:translate-y-[-4px] transition-all flex justify-center items-center text-white font-bold text-2xl"
      >
        MENU
      </button>
      <img src={logo} alt="logo" className="w-[2.5rem] lg:w-[3.25rem]" />
      {(open || isClosing) && (
        <div
          className={`fixed inset-0 z-[100] ${
            isClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
        >
          <Pause
            open={open}
            setOpen={handleClose}
            restartGame={restartGame}
            online={online}
            setRoomId={setRoomId}
          />
        </div>
      )}
    </div>
  );
};
