import PartySocket from "partysocket";

// connect to our server
const partySocket = new PartySocket({
    host: "localhost:65471",
    room: "my-room"
});

// send a message to the server
partySocket.send("Hello everyone");

// print each incoming message from the server to console
partySocket.addEventListener("message", (e) => {
    console.log(e.data);
});