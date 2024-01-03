import React, { useState } from "react";
import { GameBoard, gameInitialState } from "../Shared/GameBoard";
import { Nav } from "../Shared/Nav";
import Pause from "../Shared/Pause";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase/firebase";
import { useParams } from "react-router-dom";

interface PlayerVsPlayerProps {
  CPUMode: boolean;
  difficulty: number;
  setDifficulty: (arg0: number) => void;
  setIsOnline?: (arg0: boolean) => void;
  isOnline?: boolean;
}

export const PlayerVsPlayer = ({
  CPUMode,
  difficulty,
  setDifficulty,
  setIsOnline,
  isOnline,
}: PlayerVsPlayerProps) => {
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [winner, setWinner] = useState<string>("");
  const [playerTurn, setPlayerTurn] = useState<string>("PLAYER 1");
  const [time, setTime] = useState<number>(30);
  const [gameBoard, setGameBoard] = useState<(string | null)[][]>(
    JSON.parse(JSON.stringify(gameInitialState)),
  );
  const [open, setOpen] = useState<boolean>(false);
  const [lastGameWinner, setLastGameWinner] = useState<string | null>(null);

  const { id: roomId } = useParams<{ id: string }>();
  console.log(roomId);

  // Fetch game state from Firebase if this is an online game
  React.useEffect(() => {
    if (isOnline && roomId) {
      const roomRef = ref(db, `rooms/${roomId}`);

      const handleValueChange = (snapshot: { val: () => any }) => {
        const roomData = snapshot.val();

        if (roomData) {
          setGameBoard(roomData.gameBoard);

          // If the status in Firebase is not 'waiting for player' and 'in game', we assume it's a user's turn
          if (
            roomData.status !== "waiting for player" &&
            roomData.status !== "in game"
          ) {
            // We need to check if the status (user id in this case) is equal to the current user's id.
            // If yes, it's the current user's turn; otherwise, it's the other player's turn.

            if (roomData.status === "userId") {
              // replace "userId" with current user's id
              setPlayerTurn("Your turn");
            } else {
              setPlayerTurn("Opponent's turn");
            }
          } else {
            setPlayerTurn(roomData.status);
          }

          // update the winner state
          if (roomData.winner) {
            if (roomData.winner === "userId") {
              // replace "userId" with current user's id
              setWinner("You win!");
            } else {
              setWinner("Opponent wins!");
            }
          } else {
            setWinner("");
          }
        }
      };

      const unsubscribe = onValue(roomRef, handleValueChange, (error) => {
        console.error(error);
      });

      // This will be called when roomId or isOnline change, or on component unmount
      return () => unsubscribe();
    }
  }, [isOnline, roomId, db]);

  const playAgain = (): void => {
    setGameBoard(JSON.parse(JSON.stringify(gameInitialState)));
    setTime(30);
    setWinner("");
    if (lastGameWinner) {
      setPlayerTurn(lastGameWinner);
    } else {
      setPlayerTurn("PLAYER 1");
    }
  };

  React.useEffect(() => {
    const difficulty = localStorage.getItem("difficulty");
    if (difficulty) {
      setDifficulty(JSON.parse(difficulty));
    }
  }, []);

  const restartGame = (): void => {
    setGameBoard(Array(6).fill(Array(7).fill(null)));
    setPlayerTurn("PLAYER 1");
    setTime(30);
    setWinner("");
    setPlayer1Score(0);
    setPlayer2Score(0);
  };

  return (
    <div className="w-screen h-[100svh] flex-1 bg-[#7945FF] justify-center lg:items-center pt-24 lg:pt-0 flex relative">
      <Nav restartGame={restartGame} open={open} setOpen={setOpen} />
      <GameBoard
        isOnline={isOnline}
        roomId={roomId}
        winner={winner}
        setWinner={setWinner}
        setGameBoard={setGameBoard}
        gameBoard={gameBoard}
        player2Score={player2Score}
        setPlayer2Score={setPlayer2Score}
        player1Score={player1Score}
        setPlayer1Score={setPlayer1Score}
        time={time}
        setTime={setTime}
        playerTurn={playerTurn}
        setPlayerTurn={setPlayerTurn}
        resetGame={playAgain}
        open={open}
        setOpen={setOpen}
        cpuMode={CPUMode}
        difficulty={difficulty}
        setLastGameWinner={setLastGameWinner}
        lastGameWinner={lastGameWinner}
      />
      <Pause open={open} setOpen={setOpen} restartGame={restartGame} />
      <div
        className={`absolute w-screen lg:h-[16rem] h-[10rem] ${
          winner === "PLAYER 1"
            ? "bg-[#FD6687]"
            : winner === "PLAYER 2"
              ? "bg-[#FFCE67]"
              : "bg-[#5C2DD5]"
        } left-0 bottom-0 rounded-t-[60px]`}
      ></div>
    </div>
  );
};
