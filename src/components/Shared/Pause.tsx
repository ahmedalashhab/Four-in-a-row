import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface PauseProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  restartGame: () => void;
  online?: boolean;
  setRoomId?: (roomId: string | null) => void;
}

const Pause = ({
  open,
  setOpen,
  restartGame,
  online,
  setRoomId,
}: PauseProps) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, setOpen]);

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setOpen(false);
  };

  const handleRestart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    restartGame();
    setOpen(false);
  };

  const handleQuit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    if (setRoomId) {
      setRoomId(null);
    }
    if (online) {
      navigate("/pvp/online");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setOpen(false);
      }}
      className={`${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      } absolute top-0 left-0 w-screen h-[100svh] bg-black bg-opacity-50 justify-center items-center z-50 flex transition-opacity duration-300 ease-in-out`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        ref={menuRef}
        className={`${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0"
        } bg-[#7945FF] w-[80%] lg:w-[30rem] rounded-[40px] flex flex-col items-center py-[30px] gap-4 shadow-mainCard border-[3px] border-black transition-all duration-300 ease-in-out`}
      >
        <h1 className="text-white text-[3.5rem] font-bold">PAUSE</h1>
        <button
          onClick={handleContinue}
          className="bg-white w-[80%] h-[4rem] rounded-[20px] border-[3px] border-black font-bold text-[1.5rem] shadow-mainCard hover:translate-y-[-4px] transition-all"
        >
          CONTINUE GAME
        </button>
        <button
          onClick={handleRestart}
          className="bg-white w-[80%] h-[4rem] rounded-[20px] border-[3px] border-black font-bold text-[1.5rem] shadow-mainCard hover:translate-y-[-4px] transition-all"
        >
          RESTART
        </button>
        <button
          onClick={handleQuit}
          className="bg-[#FD6687] w-[80%] h-[4rem] rounded-[20px] border-[3px] border-black font-bold text-white text-[1.5rem] shadow-mainCard hover:translate-y-[-4px] transition-all"
        >
          QUIT GAME
        </button>
      </div>
    </div>
  );
};

export default Pause;
