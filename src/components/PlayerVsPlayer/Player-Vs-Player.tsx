import { useEffect, useRef, useState } from "react";
import ReactConfetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";
import { auth, gameService } from "../../firebase";
import type { GamePlayer, GameRoom } from "../../types/User.types";
import { GameBoard } from "../Shared/GameBoard";
import { Nav } from "../Shared/Nav";
import { PreGameModal } from "./PreGameModal";

interface PlayerVsPlayerProps {
  online: boolean;
  roomId: string | null;
  setRoomId: (arg0: string | null) => void;
  CPUMode: boolean;
  difficulty: number;
  setDifficulty?: (difficulty: number) => void;
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

interface ConfettiConfig {
  numberOfPieces: number;
  recycle: boolean;
  gravity: number;
  wind: number;
  ticks: number;
  initialVelocityY: number;
  spread: number;
}

const ensureValidBoard = (boardData: any): (string | null)[][] => {
  // Initialize empty board with null values explicitly
  const board = Array(6)
    .fill(null)
    .map(() => Array(7).fill(null));

  // If boardData is already a 2D array, normalize it
  if (
    Array.isArray(boardData) &&
    boardData.length === 6 &&
    boardData.every((row) => Array.isArray(row) && row.length === 7)
  ) {
    return boardData.map((row: (string | null | undefined)[]) =>
      row.map((cell: string | null | undefined) =>
        cell === undefined ? null : cell,
      ),
    );
  }

  // If boardData is an object (Firebase format), reconstruct the board
  if (boardData && typeof boardData === "object") {
    Object.entries(boardData).forEach(([rowIndex, rowData]) => {
      if (rowData && typeof rowData === "object") {
        Object.entries(rowData as Record<string, string>).forEach(
          ([colIndex, value]) => {
            const row = parseInt(rowIndex);
            const col = parseInt(colIndex);
            if (!isNaN(row) && !isNaN(col) && row < 6 && col < 7) {
              board[row][col] = value || null;
            }
          },
        );
      }
    });
  }

  return board;
};

const isDraw = (board: (string | null)[][]): boolean => {
  // Check if all cells are filled (no null values)
  return board.every((row) => row.every((cell) => cell !== null));
};

export const PlayerVsPlayer = ({
  online = false,
  roomId,
  setRoomId,
  CPUMode = false,
  difficulty = 1,
  setDifficulty,
}: PlayerVsPlayerProps) => {
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [winner, setWinner] = useState<string>("");
  const [playerTurn, setPlayerTurn] = useState<string>("PLAYER 1");
  const [time, setTime] = useState<number>(30);
  const [gameBoard, setGameBoard] = useState<(string | null)[][]>(() =>
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
  );
  const [open, setOpen] = useState<boolean>(false);
  const [lastGameWinner, setLastGameWinner] = useState<string | null>(null);
  const [onlineOpponentReady, setOnlineOpponentReady] =
    useState<boolean>(false);
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const navigate = useNavigate();
  const [showCopyMessage, setShowCopyMessage] = useState<boolean>(false);
  const [showPreGameModal, setShowPreGameModal] = useState<boolean>(true);
  const [canMove, setCanMove] = useState<boolean>(!online);
  const isMounted = useRef(true);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiConfig, setConfettiConfig] = useState<ConfettiConfig>({
    numberOfPieces: 200,
    recycle: false,
    gravity: 0.3,
    wind: 0,
    ticks: 400,
    initialVelocityY: 30,
    spread: 90,
  });
  const [winningPositions, setWinningPositions] = useState<
    Array<[number, number]>
  >([]);

  useEffect(() => {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    setConfettiConfig({
      numberOfPieces: isMobile ? 100 : isTablet ? 150 : 200,
      recycle: false,
      gravity: isMobile ? 0.4 : 0.3,
      wind: isMobile ? 0.01 : 0,
      ticks: isMobile ? 300 : 400,
      initialVelocityY: isMobile ? 20 : 30,
      spread: isMobile ? 45 : 90,
    });
  }, [width]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const pathSegments = window.location.pathname.split("/");
    const roomIdFromUrl = pathSegments[pathSegments.length - 1];

    if (roomIdFromUrl && roomIdFromUrl !== "lobby" && isMounted.current) {
      console.log("Setting room ID from URL:", roomIdFromUrl);
      setRoomId(roomIdFromUrl);
    }
  }, [setRoomId]);

  useEffect(() => {
    if (!online || !isMounted.current) return;

    const user = auth.currentUser;
    if (!user) {
      navigate("/pvp/online");
      return;
    }

    const player: GamePlayer = {
      uid: user.uid,
      displayName: user.displayName || "Guest",
      email: user.email || "",
      photoURL: user.photoURL || "",
      playerNumber: gameRoom?.players.length === 0 ? 1 : 2,
      score: 0,
    };

    if (isMounted.current) {
      setCurrentPlayer(player);
    }

    if (roomId) {
      const unsubscribe = gameService.onRoomUpdate(roomId, (room) => {
        if (isMounted.current) {
          setGameRoom(room);
        }
      });

      return () => unsubscribe();
    }
  }, [online, roomId, navigate]);

  useEffect(() => {
    if (!online || !gameRoom?.board) return;

    const validBoard = ensureValidBoard(gameRoom.board);
    setGameBoard(validBoard);

    // Update turn state based on gameRoom state
    const currentTurn = `PLAYER ${gameRoom.currentTurn}`;
    setPlayerTurn(currentTurn);

    // Reset winning positions when a new move is made after game restart
    if (gameRoom.lastMove && gameRoom.lastMove.row !== -1) {
      setWinningPositions([]);
    }

    // Check for win if there's a last move
    if (gameRoom.lastMove) {
      const { row, col, player } = gameRoom.lastMove;
      const winPositions = checkWin(validBoard, row, col, `PLAYER ${player}`);

      if (winPositions) {
        setWinner(`PLAYER ${player}`);
        setLastGameWinner(`PLAYER ${player}`);
        setWinningPositions(winPositions);
        if (player === 1) {
          setPlayer1Score((prev) => prev + 1);
        } else {
          setPlayer2Score((prev) => prev + 1);
        }
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }

    // Check for draw condition
    if (!winner && isDraw(validBoard)) {
      setWinner("NOBODY");
    }

    // Only update canMove if the prop is provided
    if (setCanMove) {
      const isPlayerTurn =
        (playerNumber === 1 && gameRoom.currentTurn === 1) ||
        (playerNumber === 2 && gameRoom.currentTurn === 2);
      setCanMove(isPlayerTurn);
    }
  }, [gameRoom?.board, gameRoom?.lastMove, gameRoom?.currentTurn]);

  useEffect(() => {
    if (!online || !roomId) return;

    console.log("🔍 [DEBUG] Setting up room listener:", { roomId });

    const unsubscribe = gameService.onRoomUpdate(roomId, (room) => {
      console.log("🔍 [DEBUG] Room update received:", {
        roomId,
        players: room.players,
        currentPlayer: currentPlayer,
      });

      // Don't update if this would remove players
      if (
        gameRoom &&
        gameRoom.players &&
        room.players &&
        gameRoom.players.length > room.players.length
      ) {
        console.log("🚫 [DEBUG] Preventing update that would remove players");
        return;
      }

      setGameRoom(room);
    });

    return () => {
      console.log("🔍 [DEBUG] Cleaning up room listener:", { roomId });
      unsubscribe();
    };
  }, [online, roomId]);

  useEffect(() => {
    if (!online || !roomId || roomId === "lobby") return;

    console.log("Setting up room update listener for roomId:", roomId);

    const unsubscribe = gameService.onRoomUpdate(roomId, async (room) => {
      console.log("Room update received:", {
        roomId,
        room,
        currentPlayer,
        status: room.status,
        playersCount: room.players.length,
      });

      // Set game room state first
      setGameRoom(room);

      // Set player number and host status
      if (currentPlayer) {
        // Find player by UID and update their status
        const playerIndex = room.players.findIndex(
          (p) => p.uid === currentPlayer.uid,
        );
        console.log(
          "Player index found:",
          playerIndex,
          "for UID:",
          currentPlayer.uid,
        );

        if (playerIndex !== -1) {
          const isPlayerHost = playerIndex === 0;
          setPlayerNumber((playerIndex + 1) as 1 | 2);
          setIsHost(isPlayerHost);
          console.log("Player role set:", {
            playerNumber: playerIndex + 1,
            isHost: isPlayerHost,
            playerUid: currentPlayer.uid,
            displayName: currentPlayer.displayName,
          });
        }
      }

      // Ensure board is properly structured before updating state
      if (room.board) {
        const normalizedBoard = Array.isArray(room.board)
          ? room.board
          : Array(6)
              .fill(null)
              .map(() => Array(7).fill(null));

        setGameBoard(normalizedBoard);
        console.log("Updated game board:", normalizedBoard);
      }

      // Update player turn based on currentTurn
      setPlayerTurn(room.currentTurn === 1 ? "PLAYER 1" : "PLAYER 2");

      // Update canMove based on current turn
      setCanMove(room.currentTurn === playerNumber);

      // Show PreGameModal when game is in waiting state
      if (room.status === "waiting") {
        console.log("Room is in waiting state, should show modal");
        setShowPreGameModal(true);
      }

      // Hide PreGameModal when game starts
      if (room.status === "playing") {
        console.log("Room is in playing state, hiding modal");
        setShowPreGameModal(false);
        setOnlineOpponentReady(true);
      }
    });

    return () => {
      console.log("Cleaning up room update listener");
      unsubscribe();
    };
  }, [online, roomId, currentPlayer, playerNumber]);

  useEffect(() => {
    if (
      !online ||
      !roomId ||
      !gameRoom ||
      winner ||
      !onlineOpponentReady ||
      !isMounted.current
    )
      return;

    const timer = setInterval(async () => {
      if (time > 0 && isMounted.current) {
        const newTime = time - 1;
        setTime(newTime);

        if (isHost) {
          try {
            await gameService.updateGameState(roomId, {
              ...gameRoom,
              time: newTime,
            });

            if (newTime === 0 && isMounted.current) {
              const nextTurn =
                playerTurn === "PLAYER 1" ? "PLAYER 2" : "PLAYER 1";
              setPlayerTurn(nextTurn);
              setTime(30);

              await gameService.updateGameState(roomId, {
                ...gameRoom,
                currentTurn: nextTurn === "PLAYER 1" ? 1 : 2,
                time: 30,
              });
            }
          } catch (error) {
            console.error("Error updating game state:", error);
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [time, online, roomId, gameRoom, winner, onlineOpponentReady, isHost]);

  useEffect(() => {
    return () => {
      if (online && roomId && currentPlayer) {
        console.log(
          `Player ${currentPlayer.displayName} leaving room ${roomId}`,
        );
        gameService
          .leaveRoom(roomId, currentPlayer.uid)
          .catch((error) => console.error("Error leaving room:", error));
      }
    };
  }, [online, roomId, currentPlayer]);

  useEffect(() => {
    if (!online) return;

    const cleanupInterval = setInterval(
      () => {
        gameService
          .cleanupInactiveRooms()
          .catch((error) => console.error("Error cleaning up rooms:", error));
      },
      5 * 60 * 1000,
    ); // Run every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [online]);

  useEffect(() => {
    if (!online) {
      const isMyTurn =
        (playerNumber === 1 && playerTurn === "PLAYER 1") ||
        (playerNumber === 2 && playerTurn === "PLAYER 2");
      setCanMove(isMyTurn);
    }
  }, [playerTurn, playerNumber, online]);

  const checkWin = (
    board: (string | null)[][],
    row: number,
    col: number,
    player: string,
  ): Array<[number, number]> | false => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal right
      [1, -1], // diagonal left
    ];

    for (const [dx, dy] of directions) {
      const positions: Array<[number, number]> = [];
      let count = 0;

      // Check in both directions
      for (let i = -3; i <= 3; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;

        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++;
          positions.push([newRow, newCol]);
          if (count === 4) {
            return positions;
          }
        } else {
          count = 0;
          positions.length = 0;
        }
      }
    }

    return false;
  };

  const handleMove = async (row: number, col: number) => {
    try {
      // For online mode
      if (online) {
        if (!roomId || !playerNumber) {
          console.log("🚫 Cannot make move:", { roomId, online, playerNumber });
          return;
        }

        if (!canMove) {
          console.log("🎮 Not your turn!");
          return;
        }

        await gameService.makeMove(roomId, row, col, playerNumber as 1 | 2);
        return;
      }

      // Offline mode - handle move locally
      if (!canMove) {
        console.log("🎮 Not your turn!");
        return;
      }

      const newBoard = gameBoard.map((r) => [...r]);
      newBoard[row][col] = `PLAYER ${playerNumber}`;
      setGameBoard(newBoard);

      // Update turn
      const nextPlayerNumber = playerNumber === 1 ? 2 : 1;
      const nextPlayerTurn = `PLAYER ${nextPlayerNumber}`;
      setPlayerTurn(nextPlayerTurn);
      setPlayerNumber(nextPlayerNumber);

      // Check for win
      const winPositions = checkWin(
        newBoard,
        row,
        col,
        `PLAYER ${playerNumber}`,
      );
      if (winPositions) {
        setWinner(`PLAYER ${playerNumber}`);
        setLastGameWinner(`PLAYER ${playerNumber}`);
        setWinningPositions(winPositions);
        if (playerNumber === 1) {
          setPlayer1Score((prev) => prev + 1);
        } else {
          setPlayer2Score((prev) => prev + 1);
        }
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error("🎮 Error making move:", error);
    }
  };

  const playAgain = async () => {
    // Reset winning positions (local state only)
    setWinningPositions([]);

    const newBoard = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));

    const nextPlayerTurn = lastGameWinner || "PLAYER 1";
    const nextPlayerNumber = nextPlayerTurn === "PLAYER 1" ? 1 : 2;

    const newState = {
      board: newBoard,
      time: 30,
      winner: "",
      playerTurn: nextPlayerTurn,
      player1Score,
      player2Score,
      lastGameWinner,
    };

    setGameBoard(newState.board);
    setTime(newState.time);
    setWinner(newState.winner);
    setPlayerTurn(newState.playerTurn);

    // Reset player number and can move state for offline mode
    if (!online) {
      setPlayerNumber(nextPlayerNumber);
      setCanMove(true); // Allow the starting player to move
    }

    if (online && roomId) {
      await gameService.updateGameState(roomId, newState);
    }
  };

  const restartGame = async () => {
    setWinningPositions([]); // Reset winning positions
    const newBoard = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));
    const newState = {
      board: newBoard,
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

    if (online && roomId) {
      await gameService.updateGameState(roomId, newState);
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

  const isMyTurn = (currentTurn: string) => {
    return (
      (playerNumber === 1 && currentTurn === "PLAYER 1") ||
      (playerNumber === 2 && currentTurn === "PLAYER 2")
    );
  };

  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    }
  };

  useEffect(() => {
    console.log("Menu open state:", open);
  }, [open]);

  const handlePlayAgain = async () => {
    if (!online) {
      playAgain();
      return;
    }

    if (!online || !roomId) return;

    // Reset winning positions first (local state only)
    setWinningPositions([]);

    const newBoard = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));

    await gameService.updateGameState(roomId, {
      board: newBoard,
      currentTurn: lastGameWinner === "PLAYER 1" ? 1 : 2,
      winner: null,
      status: "playing",
      time: 30,
      lastMove: {
        row: -1,
        col: -1,
        player: lastGameWinner === "PLAYER 1" ? 1 : 2,
        timestamp: Date.now(),
      },
      // Remove winningPositions from Firebase update
    });
    setWinner("");
  };

  useEffect(() => {
    console.log("Modal render conditions:", {
      online,
      roomId,
      gameRoom,
      gameRoomStatus: gameRoom?.status,
      currentPlayer,
      showPreGameModal,
    });
  }, [online, roomId, gameRoom, currentPlayer, showPreGameModal]);

  useEffect(() => {
    // Cleanup function
    return () => {
      if (roomId && currentPlayer) {
        console.log("🎮 Cleaning up player connection:", {
          roomId,
          player: currentPlayer,
        });

        // Remove the player from the room when they disconnect
        gameService.leaveRoom(roomId, currentPlayer.uid).catch((error) => {
          console.error("Error cleaning up room:", error);
        });
      }
    };
  }, [roomId, currentPlayer]);

  return (
    <>
      <div className="w-screen h-[100svh] flex-1 bg-[#7945FF] justify-center lg:items-center pt-24 lg:pt-0 flex relative">
        {showConfetti && (
          <ReactConfetti
            width={width}
            height={height}
            colors={
              winner === "PLAYER 1"
                ? ["#FD6687", "#FF94AB", "#FFB1C3"]
                : ["#FFCE67", "#FFE0A3", "#FFE8BD"]
            }
            {...confettiConfig}
            style={{
              position: "fixed",
              pointerEvents: "none",
              inset: 0,
              zIndex: 50,
            }}
          />
        )}

        <Nav
          restartGame={restartGame}
          open={open}
          setOpen={setOpen}
          online={online}
          setRoomId={setRoomId}
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
          resetGame={handlePlayAgain}
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
          canMove={canMove}
          setCanMove={setCanMove}
          playerNumber={playerNumber}
          winningPositions={winningPositions}
          setWinningPositions={setWinningPositions}
        />

        {online && roomId && gameRoom && gameRoom.status === "waiting" && (
          <PreGameModal
            room={gameRoom}
            isHost={isHost}
            playerNumber={playerNumber}
            onGameStart={() => {
              if (isHost) {
                console.log("Host starting game...");
                gameService.updateGameState(roomId, {
                  ...gameRoom,
                  status: "playing",
                  time: 30,
                });
              }
            }}
          />
        )}
      </div>
    </>
  );
};
