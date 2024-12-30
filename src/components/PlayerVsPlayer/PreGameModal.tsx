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
        lastMove: Date.now(),
      });

      console.log("🎮 [READY] Successfully updated ready state");
    } catch (error) {
      console.error("🔴 [READY] Error updating ready state:", error);
      // Revert local state if update fails
      setIsReady(!newReadyState);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[20px] p-8 border-[3px] border-black shadow-mainCard max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">
          {countdown !== null
            ? `Game starting in ${countdown}...`
            : "Waiting for players"}
        </h2>

        <div className="space-y-4">
          {/* Host */}
          <div className="flex justify-between items-center">
            <span className="font-bold">
              Host: {room.players[0]?.displayName}
              {playerNumber === 1 && " (You)"}
            </span>
            {room.players[0]?.ready ? (
              <span className="text-green-500 font-bold">Ready!</span>
            ) : (
              <span className="text-gray-400">Not ready</span>
            )}
          </div>

          {/* Guest */}
          <div className="flex justify-between items-center">
            {guestPlayer ? (
              <>
                <span className="font-bold">
                  Guest: {guestPlayer.displayName}
                  {playerNumber === 2 && " (You)"}
                </span>
                {guestPlayer.ready ? (
                  <span className="text-green-500 font-bold">Ready!</span>
                ) : (
                  <span className="text-gray-400">Not ready</span>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-500 font-bold">
                  Guest: awaiting guest to join...
                </span>
                <span className="text-gray-400">Not connected</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleReady}
          disabled={countdown !== null || (isHost && !guestPlayer)}
          className={`mt-8 w-full h-[4rem] rounded-[20px] border-[3px] border-black font-bold text-white transition-all
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
      </div>
    </div>
  );
};
