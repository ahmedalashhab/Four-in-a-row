import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/Home/Home";
import { Rules } from "./components/Rules/Rules";
import { PlayerVsPlayer } from "./components/PlayerVsPlayer/Player-Vs-Player";
import { Settings } from "./components/Settings/Settings";

function App() {
  const [difficulty, setDifficulty] = useState<number>(3);

  //on boot, the difficulty is set to the value stored in the local storage
  React.useEffect(() => {
    const difficulty = localStorage.getItem("difficulty");
    if (difficulty) {
      setDifficulty(JSON.parse(difficulty));
    }
  }, []);

  return (
    <div className="max-h-screen min-h-fit m-0 p-0 w-screen h-[100svh] flex justify-center items-center flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route
          path="/player-vs-player"
          element={
            <PlayerVsPlayer
              CPUMode={false}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          }
        />
        <Route
          path="/pve"
          element={
            <PlayerVsPlayer
              CPUMode={true}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          }
        />
        <Route
          path={"/settings"}
          element={
            <Settings difficulty={difficulty} setDifficulty={setDifficulty} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
