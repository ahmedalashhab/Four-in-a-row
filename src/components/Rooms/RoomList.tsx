import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import back from "../../assets/images/back.svg";
import { gameService } from "../../firebase";
import { useAuth } from "../../hooks/useAuth";
import type { GamePlayer, GameRoom } from "../../types/User.types";

export const RoomList = () => {
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);

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
    console.log("🟣 RoomList component mounted");
    const unsubscribe = fetchRooms();

    return () => {
      console.log("🟣 RoomList component unmounting");
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
      console.log(`Attempting to join room ${roomId}`);

      const player: GamePlayer = {
        uid: user.uid,
        displayName: user.displayName || "Player 2",
        email: user.email,
        photoURL: user.photoURL,
        playerNumber: 2,
        score: 0,
      };

      await gameService.joinRoom(roomId, player);
      console.log("Successfully joined room");
      navigate(`/pvp/online/room/${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
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

  console.log("🟣 RoomList rendering with rooms:", rooms);

  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] flex justify-center items-center">
      <div className="bg-white rounded-[20px] p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Available Rooms</h2>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`flex items-center gap-2 bg-[#5C2DD5] text-white px-4 py-2 rounded hover:bg-[#4c25b0] transition-colors ${
                refreshing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <svg
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
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
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/pvp/online")}
              className="flex items-center gap-2 bg-[#5C2DD5] text-white px-4 py-2 rounded hover:bg-[#4c25b0] transition-colors"
            >
              <img src={back} alt="Back" className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C2DD5]"></div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xl mb-4">No rooms available</p>
            <button
              onClick={() => navigate("/pvp/online")}
              className="bg-[#5C2DD5] text-white px-6 py-3 rounded-lg hover:bg-[#4c25b0] transition-colors"
            >
              Create a Room
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-[#D8DCFF] p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-[#AEADF0] transition-colors"
                onClick={() => handleJoinRoom(room.id)}
              >
                <div>
                  <div className="font-bold">Room {room.id}</div>
                  <div className="text-sm">
                    Host: {room.players[0]?.displayName || "Anonymous"}
                  </div>
                  <div className="text-xs text-gray-600">
                    Created {formatTimeAgo(room.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {joiningRoom === room.id ? (
                    <div className="text-sm bg-gray-500 text-white px-2 py-1 rounded">
                      Joining...
                    </div>
                  ) : (
                    <div className="text-sm bg-green-500 text-white px-2 py-1 rounded">
                      Available
                    </div>
                  )}
                  <div className="text-xs mt-1">Click to join</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
