import { usePartySocket } from "partysocket/react";
import { useEffect, useState } from "react";
import { auth, gameService } from "../firebase";
import type { GameState } from "../types/Game.types";

interface UsePartyServerProps {
  roomId: string | null;
  onGameStateUpdate?: (state: GameState) => void;
  onPlayerJoined?: () => void;
  onPlayerLeft?: () => void;
  initialGameState?: GameState;
}

export function usePartyServer({
  roomId,
  onGameStateUpdate,
  onPlayerJoined,
  onPlayerLeft,
  initialGameState,
}: UsePartyServerProps) {
  const [isHost, setIsHost] = useState(false);
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(
    initialGameState || null,
  );

  const socket = usePartySocket({
    host: process.env.REACT_APP_PARTYKIT_HOST || "localhost:1999",
    room: roomId || "lobby",
    onMessage(event) {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "GAME_STATE_UPDATE":
          setCurrentGameState(data.payload);
          if (onGameStateUpdate) {
            onGameStateUpdate(data.payload);
          }
          break;

        case "MOVE":
          if (onGameStateUpdate) {
            handleRemoteMove(data.payload);
          }
          break;

        case "PLAYER_LEFT":
          if (onPlayerLeft) {
            onPlayerLeft();
          }
          break;

        case "SYNC_RESPONSE":
          setCurrentGameState(data.payload);
          if (onGameStateUpdate) {
            onGameStateUpdate(data.payload);
          }
          break;
      }
    },
  });

  // Update currentGameState when game state changes
  useEffect(() => {
    if (initialGameState) {
      setCurrentGameState(initialGameState);
    }
  }, [initialGameState]);

  const handleRemoteMove = (payload: any) => {
    if (onGameStateUpdate) {
      onGameStateUpdate(payload);
    }
  };

  const updateGameState = async (state: GameState) => {
    if (!roomId) return;
    await gameService.updateGameState(roomId, state);
    socket.send(JSON.stringify({ type: "GAME_STATE_UPDATE", payload: state }));
  };

  const makeMove = async (row: number, col: number, currentPlayer: string) => {
    if (!roomId) return;
    socket.send(
      JSON.stringify({
        type: "MOVE",
        payload: { row, col, player: playerNumber },
      }),
    );
  };

  const createRoom = async (): Promise<string> => {
    if (!roomId) {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      setIsHost(true);
      setPlayerNumber(1);
      if (initialGameState) {
        await updateGameState(initialGameState);
      }
      return newRoomId;
    }
    return roomId;
  };

  const isMyTurn = (currentTurn: string) => {
    return (
      (playerNumber === 1 && currentTurn === "PLAYER 1") ||
      (playerNumber === 2 && currentTurn === "PLAYER 2")
    );
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (roomId && auth.currentUser) {
        gameService.updateGameState(roomId, {
          status: "waiting",
          lastMove: {
            row: -1,
            col: -1,
            player: 1,
            timestamp: Date.now(),
          },
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [roomId]);

  return {
    isHost,
    playerNumber,
    updateGameState,
    makeMove,
    isMyTurn,
    handleRemoteMove,
    createRoom,
  };
}
