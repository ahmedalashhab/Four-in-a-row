import React, { useState } from "react";
import { GameBoard } from "../Shared/GameBoard";
import { Nav } from "../Shared/Nav";
import Pause from "../Shared/Pause";

interface PlayerVsPlayerProps {
  CPUMode: boolean;
  difficulty: number;
  setDifficulty: (arg0: number) => void;
}

export const PlayerVsPlayer = ({
  CPUMode,
  difficulty,
  setDifficulty,
}: PlayerVsPlayerProps) => {
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [winner, setWinner] = useState<string>("");
  const [playerTurn, setPlayerTurn] = useState<string>("PLAYER 1");
  const [time, setTime] = useState<number>(30);
  const [gameBoard, setGameBoard] = useState<(string | null)[][]>(
    Array(6).fill(Array(7).fill(null)),
  );
  const [open, setOpen] = useState<boolean>(false);
  const [lastGameWinner, setLastGameWinner] = useState<string | null>(null);

  const playAgain = (): void => {
    setGameBoard(Array(6).fill(Array(7).fill(null)));
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
