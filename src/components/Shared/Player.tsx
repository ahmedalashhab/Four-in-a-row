// @ts-ignore
import player1 from "../../assets/images/player-one.svg";
// @ts-ignore
import player2 from "../../assets/images/player-two.svg";

interface PlayerProps {
  pNumber: number;
  score: number;
}

export const Player = ({ pNumber, score }: PlayerProps) => {
  const isPhone = window.innerWidth < 821;

  return (
    <div
      className={`${
        pNumber === 1 ? "lg:mr-12 lg:ml-0 ml-4" : "lg:ml-12 lg:mr-0 mr-4"
      } lg:h-[10rem] lg:scale-100 scale-90 lg:w-[8.8rem] w-[8.9rem] h-[5rem] select-none bg-white border-2 border-black shadow-mainCard rounded-[20px] flex justify-center relative font-main font-bold"`}
    >
      <img
        src={pNumber === 1 ? player1 : player2}
        className={`absolute lg:top-0 left-0 lg:w-[54px] lg:h-[59px] lg:translate-y-[-50%] w-[3.375rem] translate-y-[15%] lg:translate-x-[75%] ${
          isPhone
            ? pNumber === 1
              ? "translate-x-[-50%]"
              : "translate-x-[200%]"
            : ""
        }`}
        alt="player"
      />
      <div className="flex flex-col items-center justify-center lg:translate-y-5">
        <h3 className="lg:text-[20px] text-[16px]">PLAYER {pNumber}</h3>
        <span className="lg:text-[56px] text-[32px] mt-[-10px]">{score}</span>
      </div>
    </div>
  );
};
