import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/Home/Home";
import { Rules } from "./components/Rules/Rules";
import { PlayerVsPlayer } from "./components/PlayerVsPlayer/Player-Vs-Player";

function App() {
  const updateHeight = () => {
    document.documentElement.style.height = `${window.innerHeight}px`;
  };

  React.useEffect(() => {
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div className="max-h-screen min-h-fit m-0 p-0">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/player-vs-player" element={<PlayerVsPlayer />} />
      </Routes>
    </div>
  );
}

export default App;
