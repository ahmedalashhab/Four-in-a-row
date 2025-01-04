import { clsx } from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import back from "../../assets/images/back.svg";
import create_room from "../../assets/images/create-room.svg";
import join_a_room from "../../assets/images/join-a-room.svg";
import sign_out from "../../assets/images/sign-out.svg";
import { SignInWithGoogle, SignOut } from "../../firebase/Firebase";
import { gameService } from "../../firebase/services/database.service";
import { useAuth } from "../../hooks/useAuth";
import type { GamePlayer } from "../../types/User.types";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";

interface SignInProps {
  roomId: string | null;
  setRoomId: (roomId: string | null) => void;
}

// Add this type to fix the children prop type
type GameLinkButtonProps = {
  to?: string;
  backgroundColor: string;
  color: string;
  imgSrc?: string;
  onClick?: () => void;
  children: React.ReactNode; // Change from string to ReactNode
};

export const SignIn = ({ roomId, setRoomId }: SignInProps) => {
  const [signInError, setSignInError] = useState<string | null>(null);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const handleSignIn = async () => {
    try {
      setSignInError(null);
      await SignInWithGoogle();
    } catch (error) {
      setSignInError("Failed to sign in. Please try again.");
      console.error("Sign in error:", error);
    }
  };

  const handleCreateRoom = async () => {
    if (!user) {
      setSignInError("Please sign in first");
      return;
    }

    try {
      setIsCreatingRoom(true);
      setSignInError(null);
      console.log("Creating room with user:", user);

      const player: GamePlayer = {
        uid: user.uid,
        displayName: user.displayName || "Player 1",
        email: user.email,
        photoURL: user.photoURL,
        playerNumber: 1,
        score: 0,
      };

      console.log("Attempting to create room with player:", player);
      const newRoomId = await gameService.createRoom(player);
      console.log("Room created successfully:", newRoomId);

      setRoomId(newRoomId);
      navigate(`/pvp/online/room/${newRoomId}`);
    } catch (error) {
      console.error("Detailed error creating room:", error);
      setSignInError(
        error instanceof Error ? error.message : "Failed to create room",
      );
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomId: string) => {
    if (!user) return;

    try {
      const player: GamePlayer = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        playerNumber: 2,
        score: 0,
      };

      await gameService.joinRoom(roomId, player);
      setRoomId(roomId);
      navigate(`/pvp/online/room/${roomId}`);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await SignOut();
      // Optionally handle any cleanup needed after sign out
    } catch (error) {
      console.error("Error signing out:", error);
      setSignInError("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex select-none">
      <AnimatedMenu>
        <div className="flex flex-col justify-center gap-2 items-center">
          <div className="flex justify-center">
            <h1 className="font-bold text-white text-[3.5rem]">
              {user ? "ONLINE PVP" : "SIGN IN"}
            </h1>
          </div>

          {signInError && (
            <div className="text-red-500 mb-4">{signInError}</div>
          )}

          <button
            onClick={handleSignIn}
            disabled={loading || !!user}
            className={clsx(
              `lg:w-[25rem] w-[21rem] lg:h-[4.5rem] h-[4rem] flex justify-between items-center rounded-[20px]
              border-[3px] border-black px-[1.25rem] py-[0.625rem] mt-[3.75rem]
              text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300 select-none`,
              user
                ? "bg-[#D8DCFF] pointer-events-none shadow-mainCard"
                : "shadow-mainCard bg-[#FFCE67] text-white",
            )}
          >
            {loading ? (
              "Loading..."
            ) : user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-black font-bold">
                  {user.displayName || "Guest"}
                </span>
                <div className="bg-green-500 text-white px-2 py-0.5 rounded-full text-sm">
                  Signed In
                </div>
              </div>
            ) : (
              <div className="text-black">Sign in with Google</div>
            )}
          </button>

          {user ? (
            <>
              <GameLinkButton
                backgroundColor={"bg-[#FFCE67]"}
                color="black"
                onClick={handleCreateRoom}
                imgSrc={create_room}
              >
                {isCreatingRoom ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Creating Room...
                  </div>
                ) : (
                  "Create Room"
                )}
              </GameLinkButton>

              <GameLinkButton
                to={"rooms"}
                backgroundColor={"bg-[#31C3BD]"}
                color={"white"}
                imgSrc={join_a_room}
              >
                Join a room
              </GameLinkButton>

              <GameLinkButton
                backgroundColor={"bg-[#FD6687]"}
                color={"white"}
                onClick={handleSignOut}
                imgSrc={sign_out}
              >
                Sign Out
              </GameLinkButton>
            </>
          ) : null}

          <GameLinkButton
            to={"/pvp"}
            backgroundColor={"bg-white"}
            color={"black"}
            imgSrc={back}
          >
            Back
          </GameLinkButton>
        </div>
      </AnimatedMenu>
    </div>
  );
};
