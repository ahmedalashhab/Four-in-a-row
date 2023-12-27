import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/Home/Home";
import { Rules } from "./components/Rules/Rules";
import { PlayerVsPlayer } from "./components/PlayerVsPlayer/Player-Vs-Player";

function App() {
  return (
    <div className="max-h-screen min-h-fit m-0 p-0 w-screen h-[100svh] flex justify-center items-center flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route
          path="/player-vs-player"
          element={<PlayerVsPlayer CPUMode={false} />}
        />
        <Route path="/pve" element={<PlayerVsPlayer CPUMode={true} />} />
      </Routes>
    </div>
  );
}

export default App;
