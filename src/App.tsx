import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Home } from "./components/Home/Home";
import { Rules } from "./components/Rules/Rules";
import { PlayerVsPlayer } from "./components/PlayerVsPlayer/Player-Vs-Player";
import { Settings } from "./components/Settings/Settings";
import { SignIn } from "./components/SignIn/SignIn";
import firebase from "firebase/compat";
import { PVPMenu } from "./components/PlayerVsPlayer/PVPMenu";

function App() {
  const [difficulty, setDifficulty] = useState<number>(2);
  const [user, setUser] = useState<firebase.User | null>(null);

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
        <Route path="/pvp" element={<PVPMenu />} />
        <Route
          path="/pvp/offline"
          element={
            <PlayerVsPlayer
              CPUMode={false}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
            />
          }
        />
        <Route
          path="/pvp/online"
          element={<SignIn user={user} setUser={setUser} />}
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
        <Route
          path={"/sign-in"}
          element={<SignIn user={user} setUser={setUser} />}
        />
      </Routes>
    </div>
  );
}

export default App;
