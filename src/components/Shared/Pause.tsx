import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Link } from "react-router-dom";

interface PauseProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  restartGame: () => void;
}

export default function Pause({ open, setOpen, restartGame }: PauseProps) {
  const restartButton = () => {
    restartGame();
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex items-center justify-center transform lg:h-[27rem] lg:w-[30rem] rounded-lg text-left transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="lg:h-[27rem] lg:w-[30rem] w-[21rem] flex items-center justify-center rounded-[2.5rem] bg-[#7945FF] border-[3px] border-black shadow-mainCard lg:px-[2.5rem] py-[2.5rem] lg:py-[3.75rem]">
                  <div className="flex flex-col items-center justify-center">
                    <h1 className="font-bold text-[56px] justify-center text-white mb-6 lg:mb-0">
                      PAUSE
                    </h1>
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex flex-row items-center">
                        <button
                          onClick={() => setOpen(false)}
                          className="lg:w-[25rem] lg:h-[4.5rem] w-[18.4rem] bg-white flex justify-center items-center rounded-[20px]
              border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem]
              transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                        >
                          <h3 className="font-bold text-black select-none font-main">
                            CONTINUE GAME
                          </h3>
                        </button>
                      </div>
                      <div className="flex items-center mt-[1.25rem]">
                        <button
                          onClick={restartButton}
                          className="lg:w-[25rem] lg:h-[4.5rem] w-[18.4rem] flex justify-center items-center rounded-[20px]
                bg-[#FFF] border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                        >
                          <h3 className="font-bold text-black select-none font-main">
                            RESTART
                          </h3>
                        </button>
                      </div>
                      <div className="flex items-center mt-[1.25rem]">
                        <Link to={"/"}>
                          <button
                            className="lg:w-[25rem] lg:h-[4.5rem] w-[18.4rem] bg-[#FD6687] flex justify-center items-center rounded-[20px]
                 border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                          >
                            <h3 className="font-bold text-white select-none font-main">
                              QUIT GAME
                            </h3>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
