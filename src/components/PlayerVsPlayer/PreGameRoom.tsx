import { useEffect } from "react";
import back from "../../assets/images/back.svg";
import play from "../../assets/images/play.svg";
import { usePartyServer } from "../../hooks/usePartyServer";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";

interface PreGameRoomProps {
  roomId: string | null;
  setRoomId: (roomId: string | null) => void;
}

export const PreGameRoom = ({ roomId, setRoomId }: PreGameRoomProps) => {
  const { createRoom } = usePartyServer({
    roomId,
    initialGameState: {
      board: Array(6).fill(Array(7).fill(null)),
      playerTurn: "PLAYER 1",
      player1Score: 0,
      player2Score: 0,
      winner: "",
      time: 30,
      lastGameWinner: null,
    },
  });

  useEffect(() => {
    const initRoom = async () => {
      if (!roomId) {
        try {
          const newRoomId = await createRoom();
          if (newRoomId) {
            setRoomId(newRoomId);
          }
        } catch (error) {
          console.error("Failed to create room:", error);
        }
      }
    };

    initRoom();
  }, [roomId, createRoom, setRoomId]);

  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex flex-1 overflow-hidden">
      <AnimatedMenu>
        <div className="flex flex-col items-center justify-center">
          <div className="grid-cols-2">
            <h3 className="text-white font-bold text-[56px] select-none">
              Your room ID is:
            </h3>
            <h3 className="flex justify-center items-center font-bold text-[32px] text-black">
              {roomId}
            </h3>
          </div>
          <div className="flex flex-col justify-center items-center mt-[3.75rem]">
            <GameLinkButton
              to={`/pvp/online/room/${roomId}`}
              backgroundColor={"bg-[#FFCE67]"}
              color="black"
              imgSrc={play}
            >
              START GAME
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
      </AnimatedMenu>
    </div>
  );
};
