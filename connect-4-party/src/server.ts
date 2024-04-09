import type * as Party from "partykit/server";
import { generate } from "random-words";

export default class Server implements Party.Server {
  connections: Record<string, number> | undefined;
  rooms: { [id: string]: Party.Room } = {};

  constructor(readonly room: Party.Room) {
    this.rooms[room.id] = room;
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    //In the onConnect method, when a new connection is established,
    //add the room to the rooms object.
    this.rooms[this.room.id] = this.room;
    // Fetch the total number of connections, it's an async function
    const totalConnections = this.room.getConnections();

    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  Connections: ${this.room.getConnections()}
  url: ${new URL(ctx.request.url).pathname}
  server: 🤣🤣🤣🤣🤣,`,
    );

    // let's send a message to the connection
    conn.send(
      JSON.stringify({
        event: "rooms",
        rooms: this.rooms,
      }),
    );
  }
}

Server satisfies Party.Worker;

//TODO: handle logic to send a message to the server from the client to create a room and add it into the rooms object.
//TODO: then create a function to retrieve all the rooms in the rooms object and send it to the client where it will be displayed in a list of button.
//TODO: Each button will have a click event listener that will send a message to the server to join the room. The user will then be redirected to the game page.
