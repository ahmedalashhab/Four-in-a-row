import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/Home/Home";
import { Rules } from "./components/Rules/Rules";
import { PlayerVsPlayer } from "./components/PlayerVsPlayer/Player-Vs-Player";

function App() {
  React.useEffect(() => {
    document.documentElement.style.height = `${window.innerHeight}px`;
  }, []);

  return (
    <div className="h-full m-0 p-0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/player-vs-player" element={<PlayerVsPlayer />} />
      </Routes>
    </div>
  );
}

export default App;
