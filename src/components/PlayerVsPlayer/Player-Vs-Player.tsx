import { useState } from "react";
import { usePartyServer } from "../../hooks/usePartyServer";
import { GameBoard } from "../Shared/GameBoard";
import { Nav } from "../Shared/Nav";
import Pause from "../Shared/Pause";

interface PlayerVsPlayerProps {
  CPUMode: boolean;
  difficulty: number;
  setDifficulty: (arg0: number) => void;
  online: boolean;
  roomId: string | null;
  setRoomId: (arg0: string | null) => void;
}

interface GameState {
  board: (string | null)[][];
  playerTurn: string;
  player1Score: number;
  player2Score: number;
  winner: string;
  time: number;
  lastGameWinner: string | null;
}

export const PlayerVsPlayer = ({
  CPUMode,
  difficulty,
  setDifficulty,
  online,
  roomId,
  setRoomId,
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
  const [onlineOpponentReady, setOnlineOpponentReady] =
    useState<boolean>(false);

  const { isHost, updateGameState, makeMove, isMyTurn, playerNumber } =
    usePartyServer({
      roomId,
      onGameStateUpdate: (state: GameState) => {
        setGameBoard(state.board);
        setPlayerTurn(state.playerTurn);
        setPlayer1Score(state.player1Score);
        setPlayer2Score(state.player2Score);
        setWinner(state.winner);
        setTime(state.time);
        setLastGameWinner(state.lastGameWinner);
      },
      onPlayerJoined: () => {
        setOnlineOpponentReady(true);
        if (isHost) {
          updateGameState({
            board: gameBoard,
            playerTurn,
            player1Score,
            player2Score,
            winner,
            time,
            lastGameWinner,
          });
        }
      },
      onPlayerLeft: () => {
        setOnlineOpponentReady(false);
      },
    });

  // Add this function before handleMove
  const checkWin = (
    board: (string | null)[][],
    row: number,
    col: number,
  ): boolean => {
    const currentPlayer = board[row][col];
    if (!currentPlayer) return false;

    // Check horizontal
    let count = 0;
    for (let c = 0; c < 7; c++) {
      if (board[row][c] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
    }

    // Check vertical
    count = 0;
    for (let r = 0; r < 6; r++) {
      if (board[r][col] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
    }

    // Check diagonal (top-left to bottom-right)
    let r = row - Math.min(row, col);
    let c = col - Math.min(row, col);
    count = 0;
    while (r < 6 && c < 7) {
      if (board[r][c] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
      r++;
      c++;
    }

    // Check diagonal (top-right to bottom-left)
    r = row - Math.min(row, 6 - col);
    c = col + Math.min(row, 6 - col);
    count = 0;
    while (r < 6 && c >= 0) {
      if (board[r][c] === currentPlayer) {
        count++;
        if (count === 4) return true;
      } else {
        count = 0;
      }
      r++;
      c--;
    }

    return false;
  };

  // Handle a move in the game
  const handleMove = (row: number, col: number, currentPlayer: string) => {
    // In online mode, only allow moves on your turn
    if (online) {
      if (!isMyTurn(playerTurn)) {
        console.log("Not your turn!");
        return;
      }
      makeMove(row, col);
      return;
    }

    // Local game logic
    const newBoard = gameBoard.map((row) => [...row]);
    newBoard[row][col] = currentPlayer;
    setGameBoard(newBoard);

    // Check for win condition
    const isWin = checkWin(newBoard, row, col);
    if (isWin) {
      setWinner(currentPlayer);
      setLastGameWinner(currentPlayer);
      if (currentPlayer === "PLAYER 1") {
        setPlayer1Score((prev) => prev + 1);
      } else {
        setPlayer2Score((prev) => prev + 1);
      }
      return;
    }

    // Check for draw
    const isDraw = newBoard[0].every((cell) => cell !== null);
    if (isDraw) {
      setWinner("DRAW");
      return;
    }

    // Switch turns
    setPlayerTurn(currentPlayer === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1");
  };

  const playAgain = (): void => {
    const newState = {
      board: Array(6).fill(Array(7).fill(null)),
      time: 30,
      winner: "",
      playerTurn: lastGameWinner || "PLAYER 1",
      player1Score,
      player2Score,
      lastGameWinner,
    };

    setGameBoard(newState.board);
    setTime(newState.time);
    setWinner(newState.winner);
    setPlayerTurn(newState.playerTurn);

    if (online && isHost) {
      updateGameState(newState);
    }
  };

  const restartGame = (): void => {
    const newState = {
      board: Array(6).fill(Array(7).fill(null)),
      playerTurn: "PLAYER 1",
      time: 30,
      winner: "",
      player1Score: 0,
      player2Score: 0,
      lastGameWinner: null,
    };

    setGameBoard(newState.board);
    setPlayerTurn(newState.playerTurn);
    setTime(newState.time);
    setWinner(newState.winner);
    setPlayer1Score(newState.player1Score);
    setPlayer2Score(newState.player2Score);
    setLastGameWinner(newState.lastGameWinner);

    if (online && isHost) {
      updateGameState(newState);
    }
  };

  const getBackgroundColor = (winner: string) => {
    switch (winner) {
      case "PLAYER 1":
        return "bg-[#FD6687]";
      case "PLAYER 2":
        return "bg-[#FFCE67]";
      default:
        return "bg-[#5C2DD5]";
    }
  };

  return (
    <div className="w-screen h-[100svh] flex-1 bg-[#7945FF] justify-center lg:items-center pt-24 lg:pt-0 flex relative">
      <Nav
        restartGame={restartGame}
        open={open}
        setOpen={setOpen}
        online={online}
      />
      <GameBoard
        online={online}
        onlineOpponentReady={onlineOpponentReady}
        setOnlineOpponentReady={setOnlineOpponentReady}
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
        roomId={roomId}
        setRoomId={setRoomId}
        onMove={handleMove}
        isHost={isHost}
        canMove={online ? isMyTurn(playerTurn) : true}
        playerNumber={playerNumber}
      />
      <Pause
        open={open}
        setOpen={setOpen}
        restartGame={restartGame}
        online={online}
        setRoomId={setRoomId}
      />
      <div
        className={`absolute w-screen lg:h-[16rem] h-[10rem] ${getBackgroundColor(
          winner,
        )} left-0 bottom-0 rounded-t-[60px]`}
      ></div>
    </div>
  );
};
