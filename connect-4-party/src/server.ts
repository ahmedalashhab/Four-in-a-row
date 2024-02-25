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
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: "new-party-room"
  url: ${new URL(ctx.request.url).pathname}`,
    );

    // let's send a message to the connection
    conn.send(
      `hello from the supreme server, you are a connected to room ${
        this.room.id
      }
      and also, there are ${this.room.getConnections()} connections in this room`,
    );
  }
}

Server satisfies Party.Worker;

//TODO: handle logic to send a message to the server from the client to create a room and add it into the rooms object.
//TODO: then create a function to retrieve all the rooms in the rooms object and send it to the client where it will be displayed in a list of button.
//TODO: Each button will have a click event listener that will send a message to the server to join the room. The user will then be redirected to the game page.
