import { usePartySocket } from "partysocket/react";
import { generate } from "random-words";
import { useCallback, useState } from "react";
import { addresses } from "../Shared/addresses";

export const useRemoteGameboard = (roomId: string) => {
  if (!roomId) {
    //generate random room id
    roomId = (
      generate({ exactly: 3, minLength: 4, maxLength: 4 }) as string[]
    ).join("-");
    console.log("GENERATED NEW ROOM ID", roomId);
  }

  const [playerTurn, setPlayerTurn] = useState(null);
  const [connected, setIsConnected] = useState(false);
  // State to manage the WebSocket connection
  const socket = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: addresses.local, // or localhost:1999 in dev
    room: roomId,
    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
    onOpen() {
      console.log("connected");
      setIsConnected(true);
    },

    onMessage(e) {
      try {
        const j = JSON.parse(e.data);
        if (j.event !== "drop_counter") return;
        return setPlayerTurn(j);
      } catch (error) {
        console.error(error);
      }
    },
    onClose() {
      console.log("closed");
      setIsConnected(false);
    },
    onError(e) {
      console.log("error");
      setIsConnected(false);
    },
  });
  // State to store the event data from the opponent
  //state for columnIndex
  // Function to send counter event to the WebSocket server
  const sendCounterEvent = useCallback(
    ({ columnIndex, player }: { columnIndex: number; player: string }) => {
      if (socket) {
        socket.send(
          JSON.stringify({
            event: "drop_counter",
            player: "PLAYER 1",
            columnIndex,
          }),
        );
      }
    },
    [socket],
  );

  // Return the sendCounterEvent function and playerTurn state
  return [sendCounterEvent, playerTurn, roomId];
};
