import { clsx } from "clsx";
import { SignInWithGoogle } from "../../firebase/Firebase";
import { useUser } from "../../hooks/useUser";
import { AnimatedMenu, GameLinkButton } from "../Home/MainMenu";
import create_room from "../../assets/images/create-room.svg";
import back from "../../assets/images/back.svg";
import join_a_room from "../../assets/images/join-a-room.svg";

export const SignIn = () => {
  const { user, loading } = useUser();
  console.log(user);
  return (
    <div className="w-screen h-[100svh] bg-[#5C2DD5] justify-center items-center flex select-none">
      <AnimatedMenu>
        {/*  sign in with google*/}
        {!loading && (
          <div className="flex flex-col justify-center gap-2 items-center">
            <div className="flex justify-center">
              {!loading && (
                <h1 className="font-bold text-white text-[3.5rem]">
                  {user ? "ONLINE PVP" : "SIGN IN"}
                </h1>
              )}
            </div>
            <button
              onClick={() => SignInWithGoogle()}
              className={clsx(
                `lg:w-[25rem] w-[21rem] lg:h-[4.5rem] h-[4rem] flex justify-between items-center rounded-[20px]
        border-[3px]  border-black bg-black px-[1.25rem] py-[0.625rem] text-white mt-[3.75rem]
        text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300 select-none,
                ${
                  user
                    ? "pointer-events-none bg-[#e0e0e0]"
                    : "shadow-mainCard bg-[#FFCE67]"
                }`,
              )}
            >
              {loading
                ? "Loading..."
                : user
                  ? `Logged in as: ${user.displayName}`
                  : "Sign in with Google"}
            </button>
            {user && (
              <GameLinkButton
                to={"rooms"}
                backgroundColor={"bg-[#D8DCFF]"}
                color={"black"}
                imgSrc={join_a_room}
              >
                Join a room
              </GameLinkButton>
            )}
            {user && (
              <GameLinkButton
                to={"room/:id"}
                backgroundColor={"bg-[#AEADF0]"}
                color={"black"}
                imgSrc={create_room}
              >
                Create Room
              </GameLinkButton>
            )}
            <GameLinkButton
              to={"/pvp"}
              backgroundColor={"bg-white"}
              color={"black"}
              imgSrc={back}
            >
              Back
            </GameLinkButton>
          </div>
        )}
      </AnimatedMenu>
    </div>
  );
};
