import PartySocket from "partysocket";
import "./styles.css";

declare const PARTYKIT_HOST: string;

// Types matching server messages
interface ServerMessage {
  type: string;
  payload: any;
}

interface GameState {
  roomId: string;
  state: any; // TODO: Define proper game state type
  connections: number;
}

class GameClient {
  private socket: PartySocket;
  private gameState?: GameState;

  constructor(roomId: string = 'lobby') {
    this.socket = new PartySocket({
      host: PARTYKIT_HOST,
      room: roomId
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.socket.addEventListener('close', () => {
      console.log('Disconnected from server');
    });

    this.socket.addEventListener('open', () => {
      console.log('Connected to server');
    });
  }

  private handleMessage(message: ServerMessage) {
    switch (message.type) {
      case 'ROOM_STATE':
        this.gameState = message.payload;
        this.updateUI();
        break;

      case 'ROOM_CREATED':
      case 'PLAYER_JOINED':
      case 'PLAYER_LEFT':
        this.updateUI();
        break;

      case 'ERROR':
        console.error('Server error:', message.payload);
        break;
    }
  }

  public createRoom() {
    this.socket.send(JSON.stringify({
      type: 'CREATE_ROOM',
      payload: {}
    }));
  }

  public joinRoom(roomId: string) {
    this.socket.send(JSON.stringify({
      type: 'JOIN_ROOM',
      payload: { roomId }
    }));
  }

  public sendGameAction(action: any) {
    this.socket.send(JSON.stringify({
      type: 'GAME_ACTION',
      payload: action
    }));
  }

  private updateUI() {
    // TODO: Implement UI updates based on game state
    const app = document.getElementById('app');
    if (!app) return;

    if (!this.gameState) {
      app.textContent = 'Loading...';
      return;
    }

    app.innerHTML = `
      <div>
        <h2>Room: ${this.gameState.roomId}</h2>
        <p>Connected players: ${JSON.stringify(this, null, 2)}</p>
        <p>Connected players: ${JSON.stringify(this.gameState, null, 2)}</p>
        <p>Connected players: ${JSON.stringify(this.gameState.connections, null, 2)}</p>
      </div>
    `;
  }
}

// Initialize the game client
const gameClient = new GameClient();

// Export for debugging
(window as any).gameClient = gameClient;
