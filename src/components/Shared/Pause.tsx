import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import logo from "../../assets/images/logo.svg";
import { Link } from "react-router-dom";
import pvp from "../../assets/images/player-vs-player.svg";

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
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex items-center justify-center transform h-[27rem] w-[30rem]  rounded-lg text-left transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="h-[27rem] w-[30rem] flex items-center rounded-[2.5rem] bg-[#7945FF] border-[3px] border-black shadow-mainCard px-[2.5rem] py-[3.75rem]">
                  <div className="flex flex-col justify-center items-center">
                    <h1 className="font-bold text-[56px] text-white">PAUSE</h1>
                    <div className="flex flex-col justify-center items-center">
                      <div className="flex flex-row items-center">
                        <button
                          onClick={() => setOpen(false)}
                          className="w-[25rem] h-[4.5rem] bg-white flex justify-between items-center rounded-[20px]
              border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem]
              transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                        >
                          <h3 className="text-black font-main font-bold select-none">
                            CONTINUE
                          </h3>
                        </button>
                      </div>
                      <div className="flex items-center mt-[1.25rem]">
                        <button
                          onClick={restartButton}
                          className="w-[25rem] h-[4.5rem] flex justify-between items-center rounded-[20px]
                bg-[#FFF] border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                        >
                          <h3 className="text-black font-main font-bold select-none">
                            RESTART
                          </h3>
                        </button>
                      </div>
                      <div className="flex items-center mt-[1.25rem]">
                        <Link to={"/"}>
                          <button
                            className="w-[25rem] h-[4.5rem] bg-[#FD6687] flex justify-between items-center rounded-[20px]
                 border-[3px] border-black shadow-mainCard px-[1.25rem] py-[0.625rem] text-white text-[1.25rem] transition ease-in-out hover:-translate-y-1 hover:scale-110 duration-300"
                          >
                            <h3 className="text-white font-main font-bold select-none">
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
