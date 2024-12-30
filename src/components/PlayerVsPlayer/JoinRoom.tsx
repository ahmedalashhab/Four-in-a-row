import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import back from "../../assets/images/back.svg";
import { gameService } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import type { GamePlayer, GameRoom } from "../../types/User.types";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";

export const JoinRoom = () => {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  const fetchRooms = () => {
    setRefreshing(true);
    console.log("🔄 Refreshing rooms list...");

    const unsubscribe = gameService.onRoomsUpdate((updatedRooms) => {
      console.log("📥 Received rooms:", updatedRooms);
      setRooms(
        updatedRooms.filter(
          (room) => room.status === "waiting" && room.players.length < 2,
        ),
      );
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    console.log("🟣 JoinRoom component mounted");
    const unsubscribe = fetchRooms();

    return () => {
      console.log("🟣 JoinRoom component unmounting");
      unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    if (refreshing) return;
    fetchRooms();
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) {
      setError("Please sign in to join a room");
      return;
    }

    try {
      setError(null);
      setJoiningRoom(roomId);
      console.log("🎮 [JOIN] Attempting to join room:", roomId);

      const player: GamePlayer = {
        uid: user.uid,
        displayName: user.displayName || "Guest",
        email: user.email || "",
        photoURL: user.photoURL || "",
        playerNumber: 2,
        score: 0,
        ready: false,
      };

      console.log("🎮 [JOIN] Player data to be sent:", player);

      await gameService.joinRoom(roomId, player);
      console.log("🎮 [JOIN] Successfully joined room");

      navigate(`/pvp/online/room/${roomId}`);
    } catch (error) {
      console.error("🔴 [JOIN] Error joining room:", error);
      setError(error instanceof Error ? error.message : "Failed to join room");
    } finally {
      setJoiningRoom(null);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex flex-1 overflow-hidden">
      <AnimatedMenu>
        <div className="flex flex-col items-center justify-center">
          <div className="grid-cols-2 mb-8">
            <h3 className="text-white font-bold text-[56px] select-none">
              ROOMS
            </h3>
          </div>

          <div className="flex flex-col gap-4 w-[21rem] lg:w-[25rem] mb-8">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center justify-center gap-2 bg-[#FFCE67] h-[4rem] rounded-[20px] border-[3px] border-black shadow-mainCard hover:translate-y-[-4px] transition-all ${
                refreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className={`w-6 h-6 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="font-bold text-[1.25rem]">
                {refreshing ? "Refreshing..." : "Refresh Rooms"}
              </span>
            </button>

            {error && (
              <div className="bg-[#FD6687] text-white px-4 py-3 rounded-[20px] border-[3px] border-black shadow-mainCard text-center font-bold">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white text-center py-6 rounded-[20px] border-[3px] border-black shadow-mainCard">
                <p className="text-xl font-bold mb-2">No rooms available</p>
                <p className="text-gray-600">Create a room to start playing!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => handleJoinRoom(room.id)}
                    className="bg-[#D8DCFF] p-4 rounded-[20px] border-[3px] border-black shadow-mainCard hover:translate-y-[-4px] transition-all w-full text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg">Room {room.id}</div>
                        <div className="text-sm">
                          Host: {room.players[0]?.displayName || "Anonymous"}
                        </div>
                        <div className="text-xs text-gray-600">
                          Created {formatTimeAgo(room.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {joiningRoom === room.id ? (
                          <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                            Joining...
                          </div>
                        ) : (
                          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                            Available
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <GameLinkButton
            to="/pvp/online"
            backgroundColor={"bg-[#FFF]"}
            color="black"
            imgSrc={back}
          >
            BACK
          </GameLinkButton>
        </div>
      </AnimatedMenu>
    </div>
  );
};
