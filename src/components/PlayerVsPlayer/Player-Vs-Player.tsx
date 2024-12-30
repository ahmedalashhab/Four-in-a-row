import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const [canMove, setCanMove] = useState<boolean>(true);
  const isMounted = useRef(true);

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
      navigate("/signin");
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
    if (!gameRoom) return;

    console.log("🎮 Received room update:", {
      board: gameRoom.board,
      currentTurn: gameRoom.currentTurn,
      status: gameRoom.status,
    });

    // Convert board from object to array if needed
    if (gameRoom.board) {
      let validBoard: (string | null)[][];

      if (Array.isArray(gameRoom.board)) {
        validBoard = gameRoom.board;
      } else {
        // Convert object format to 2D array
        validBoard = Array(6)
          .fill(null)
          .map(() => Array(7).fill(null));

        // Type guard to ensure board is an object with string keys
        const board = gameRoom.board as {
          [key: string]: { [key: string]: string | null };
        };

        Object.entries(board).forEach(([row, cols]) => {
          if (cols && typeof cols === "object") {
            Object.entries(cols as { [key: string]: string | null }).forEach(
              ([col, value]) => {
                validBoard[parseInt(row)][parseInt(col)] = value;
              },
            );
          }
        });
      }

      console.log("🎮 Setting game board:", validBoard);
      setGameBoard(validBoard);
    }

    setPlayerTurn(`PLAYER ${gameRoom.currentTurn}`);
  }, [gameRoom]);

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

  const handleMove = async (row: number, col: number) => {
    try {
      if (!roomId || !online || !playerNumber) {
        console.log("🚫 Cannot make move:", { roomId, online, playerNumber });
        return;
      }

      if (!canMove) {
        console.log("🎮 Not your turn!");
        return;
      }

      await gameService.makeMove(roomId, row, col, playerNumber);
    } catch (error) {
      console.error("🎮 Error making move:", error);
    }
  };

  // Add win checking function
  const checkWinner = (board: (string | null)[][]) => {
    // Horizontal check
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const player = board[row][col];
        if (
          player &&
          player === board[row][col + 1] &&
          player === board[row][col + 2] &&
          player === board[row][col + 3]
        ) {
          return player;
        }
      }
    }

    // Vertical check
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 7; col++) {
        const player = board[row][col];
        if (
          player &&
          player === board[row + 1][col] &&
          player === board[row + 2][col] &&
          player === board[row + 3][col]
        ) {
          return player;
        }
      }
    }

    // Diagonal checks...
    // (Add diagonal win checking logic)

    return null;
  };

  const playAgain = async () => {
    const newBoard = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));
    const newState = {
      board: newBoard,
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

    if (online && roomId) {
      await gameService.updateGameState(roomId, newState);
    }
  };

  const restartGame = async () => {
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
    if (!online || !roomId) return;

    const newBoard = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));
    await gameService.updateGameState(roomId, {
      board: newBoard,
      currentTurn: lastGameWinner === "PLAYER 1" ? 1 : 2,
      winner: null,
      status: "playing",
      time: 30,
      lastMove: Date.now(),
    });
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
          canMove={online ? isMyTurn(playerTurn) : true}
          playerNumber={playerNumber}
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
