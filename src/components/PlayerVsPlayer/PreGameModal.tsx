import { useEffect, useState } from "react";
import { gameService } from "../../firebase";
import type { GamePlayer, GameRoom } from "../../types/User.types";

interface PreGameModalProps {
  room: GameRoom;
  isHost: boolean;
  playerNumber: 1 | 2;
  onGameStart: () => void;
}

export const PreGameModal = ({
  room,
  isHost,
  playerNumber,
  onGameStart,
}: PreGameModalProps) => {
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [guestPlayer, setGuestPlayer] = useState<GamePlayer | null>(null);

  // Add effect to track guest player updates
  useEffect(() => {
    console.log("🎮 PreGameModal - Room data received:", {
      roomId: room.id,
      players: room.players,
      totalPlayers: room.players.length,
    });

    if (room.players && room.players.length > 1) {
      const guest = room.players.find((p) => p.playerNumber === 2);
      console.log("🎮 PreGameModal - Looking for guest player:", {
        allPlayers: room.players,
        foundGuest: guest,
        guestNumber: guest?.playerNumber,
      });

      if (guest) {
        console.log("🎮 PreGameModal - Setting guest player:", guest);
        setGuestPlayer(guest);
      } else {
        console.log("🎮 PreGameModal - No guest player found in room data");
        setGuestPlayer(null);
      }
    } else {
      console.log(
        "🎮 PreGameModal - Not enough players:",
        room.players?.length,
      );
      setGuestPlayer(null);
    }
  }, [room.players]);

  useEffect(() => {
    // Check if both players are ready
    const allPlayersReady = room.players.every((player) => player.ready);

    if (allPlayersReady && room.players.length === 2) {
      // Start countdown from 3
      setCountdown(3);

      // Set up countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            clearInterval(timer);
            onGameStart();
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup timer
      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  }, [room.players, onGameStart]);

  useEffect(() => {
    if (!room.players) return;

    // Find the current player in the room's players array by playerNumber
    const currentPlayer = room.players.find(
      (p) => p.playerNumber === playerNumber,
    );
    if (currentPlayer) {
      setIsReady(currentPlayer.ready || false);
    }
  }, [room.players, playerNumber]);

  const handleReady = async () => {
    const newReadyState = !isReady;

    try {
      console.log("🎮 [READY] Current state:", {
        isReady,
        room,
        playerNumber,
      });

      // Create a deep copy of the players array
      const updatedPlayers = room.players.map((p) => {
        if (p.playerNumber === playerNumber) {
          return {
            ...p,
            ready: newReadyState,
          };
        }
        return p;
      });

      console.log("🎮 [READY] Updating players:", {
        before: room.players,
        after: updatedPlayers,
      });

      // Update local state first
      setIsReady(newReadyState);

      // Update the game state in Firebase
      await gameService.updateGameState(room.id, {
        players: updatedPlayers,
        lastMove: {
          row: -1,
          col: -1,
          player: 1,
          timestamp: Date.now(),
        },
      });

      console.log("🎮 [READY] Successfully updated ready state");
    } catch (error) {
      console.error("🔴 [READY] Error updating ready state:", error);
      // Revert local state if update fails
      setIsReady(!newReadyState);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[20px] p-4 sm:p-6 md:p-8 border-[3px] border-black shadow-mainCard w-full max-w-[90%] sm:max-w-[400px] mx-auto">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">
          {countdown !== null
            ? `Game starting in ${countdown}...`
            : "Waiting for players"}
        </h2>

        {/* Players Section */}
        <div className="space-y-4 sm:space-y-6">
          {/* Host Player */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {room.players[0]?.photoURL && (
                <img
                  src={room.players[0].photoURL}
                  alt="Host"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="font-bold text-sm sm:text-base truncate">
                {room.players[0]?.displayName}
                {playerNumber === 1 && " (You)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  room.players[0]?.ready ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              <span
                className={`text-sm ${
                  room.players[0]?.ready ? "text-green-500" : "text-gray-400"
                }`}
              >
                {room.players[0]?.ready ? "Ready!" : "Not ready"}
              </span>
            </div>
          </div>

          {/* Guest Player */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg">
            {guestPlayer ? (
              <>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {guestPlayer.photoURL && (
                    <img
                      src={guestPlayer.photoURL}
                      alt="Guest"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="font-bold text-sm sm:text-base truncate">
                    {guestPlayer.displayName}
                    {playerNumber === 2 && " (You)"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      guestPlayer.ready ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      guestPlayer.ready ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    {guestPlayer.ready ? "Ready!" : "Not ready"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <span className="text-gray-500 font-bold text-sm sm:text-base">
                  Waiting for opponent...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ready Button */}
        <button
          onClick={handleReady}
          disabled={countdown !== null || (isHost && !guestPlayer)}
          className={`
            mt-6 sm:mt-8 w-full h-12 sm:h-14 
            rounded-[20px] border-[3px] border-black 
            font-bold text-white transition-all
            text-sm sm:text-base
            ${
              isReady
                ? "bg-[#FD6687] hover:bg-[#e05576]"
                : "bg-[#5C2DD5] hover:bg-[#4c25b0]"
            }
            ${
              countdown !== null || (isHost && !guestPlayer)
                ? "opacity-50 cursor-not-allowed"
                : "hover:translate-y-[-4px]"
            }
          `}
        >
          {isReady ? "Cancel Ready" : "Ready"}
        </button>

        {/* Room Code */}
        <div className="mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Room Code: <span className="font-mono font-bold">{room.id}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
