import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface DropDownProps {
  difficulty: number;
  setDifficulty: (arg0: number) => void;
}

export const DropDown = ({ difficulty, setDifficulty }: DropDownProps) => {
  // whenever the user clicks on a difficulty, the difficulty state is updated in the local storage for persistance
  React.useEffect(() => {
    localStorage.setItem("difficulty", JSON.stringify(difficulty));
  }, [difficulty]);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {difficulty === 0 && <p>Beginner</p>}
          {difficulty === 1 && <p>Easy</p>}
          {difficulty === 2 && <p>Medium</p>}
          {difficulty === 4 && <p>Hard</p>}
          {difficulty === 7 && <p>Absolute Mad Lad</p>}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right bg-white shadow-mainCard
        border-[3px] rounded-[20px] ring-1 ring-black ring-opacity-5 focus:outline-none font-bold"
        >
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block w-full px-4 py-2 text-left text-sm",
                  )}
                  onClick={() => setDifficulty(0)}
                >
                  Beginner
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block w-full px-4 py-2 text-left text-sm",
                  )}
                  onClick={() => setDifficulty(1)}
                >
                  Easy
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block w-full px-4 py-2 text-left text-sm",
                  )}
                  onClick={() => setDifficulty(2)}
                >
                  Medium
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block w-full px-4 py-2 text-left text-sm",
                  )}
                  onClick={() => setDifficulty(4)}
                >
                  Hard
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "block w-full px-4 py-2 text-left text-sm",
                  )}
                  onClick={() => setDifficulty(7)}
                >
                  Absolute Mad Lad
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
