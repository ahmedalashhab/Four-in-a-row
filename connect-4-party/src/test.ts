import type { TestFn } from 'ava';
import anyTest from 'ava';
import PartySocket from 'partysocket';
import { WebSocket } from 'ws';

// Mock PartySocket since it's client-side only
global.WebSocket = WebSocket as any;

// Test configuration
const TEST_HOST = "localhost:1999";
const getTestRoom = () => `test-room-${Math.random().toString(36).substring(7)}`;

interface TestSocket extends PartySocket {
    waitForMessage: (type: string, timeout?: number) => Promise<any>;
}

// Define test context type
interface TestContext {
    roomId: string;
    player1: TestSocket;
    player2?: TestSocket;
}

// Create a properly typed test instance
const test = anyTest as TestFn<TestContext>;

// Helper to create a socket with message waiting capability
function createTestSocket(roomId: string): TestSocket {
    const socket = new PartySocket({
        host: TEST_HOST,
        room: roomId
    }) as TestSocket;

    socket.waitForMessage = (type: string, timeout = 5000) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error(`Timeout waiting for message type: ${type}`));
            }, timeout);

            const handler = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.type === type) {
                    cleanup();
                    resolve(data);
                }
            };

            const cleanup = () => {
                clearTimeout(timer);
                socket.removeEventListener('message', handler);
            };

            socket.addEventListener('message', handler);
        });
    };

    return socket;
}

// Helper to wait for socket connection
async function waitForConnection(socket: PartySocket): Promise<void> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Connection timeout'));
        }, 5000);

        socket.addEventListener('open', () => {
            clearTimeout(timer);
            resolve();
        });

        socket.addEventListener('error', (error) => {
            clearTimeout(timer);
            reject(error);
        });
    });
}

test.beforeEach(async t => {
    // Setup context with room ID and sockets
    const roomId = getTestRoom();
    const player1 = createTestSocket(roomId);
    await waitForConnection(player1);

    t.context = {
        roomId,
        player1
    };
});

test.afterEach.always(async t => {
    // Cleanup: close all sockets
    const { player1, player2 } = t.context;
    if (player1) player1.close();
    if (player2) player2.close();
});

test('should connect to server', async t => {
    const { player1 } = t.context;
    t.true(player1.readyState === WebSocket.OPEN, 'Socket should be open');
});

test('should create a room', async t => {
    const { player1 } = t.context;

    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));

    const response = await player1.waitForMessage('ROOM_CREATED');
    t.truthy(response.payload.roomId, 'Should receive room ID');
});

test('should allow second player to join', async t => {
    const { roomId, player1 } = t.context;

    // Create room first
    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));
    await player1.waitForMessage('ROOM_CREATED');

    // Connect second player
    const player2 = createTestSocket(roomId);
    await waitForConnection(player2);
    t.context.player2 = player2;

    player2.send(JSON.stringify({
        type: 'JOIN_ROOM',
        payload: { roomId }
    }));

    const response = await player2.waitForMessage('PLAYER_JOINED');
    t.is(response.payload.roomId, roomId, 'Should join the correct room');
});

test('should update game state', async t => {
    const { player1 } = t.context;

    // Create room first
    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));
    await player1.waitForMessage('ROOM_CREATED');

    // Update game state
    player1.send(JSON.stringify({
        type: 'GAME_ACTION',
        payload: {
            currentTurn: 2,
            board: Array(6).fill(null).map(() => Array(7).fill(0))
        }
    }));

    const response = await player1.waitForMessage('GAME_ACTION');
    t.truthy(response.payload.currentTurn, 'Should update turn');
    t.truthy(response.payload.board, 'Should update board');
});

test('should update player score', async t => {
    const { player1 } = t.context;

    // Create room first
    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));
    await player1.waitForMessage('ROOM_CREATED');

    // Update score
    player1.send(JSON.stringify({
        type: 'UPDATE_SCORE',
        payload: {}
    }));

    const response = await player1.waitForMessage('SCORE_UPDATED');
    t.is(response.payload.newScore, 1, 'Score should be incremented');
});

test('should handle player disconnection', async t => {
    const { roomId, player1 } = t.context;

    // Create room and add second player
    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));
    await player1.waitForMessage('ROOM_CREATED');

    const player2 = createTestSocket(roomId);
    await waitForConnection(player2);
    t.context.player2 = player2;

    player2.send(JSON.stringify({
        type: 'JOIN_ROOM',
        payload: { roomId }
    }));
    await player2.waitForMessage('PLAYER_JOINED');

    // Setup listener for disconnect event before closing
    const disconnectPromise = player2.waitForMessage('PLAYER_LEFT');
    player1.close();

    const response = await disconnectPromise;
    t.truthy(response.payload.playerId, 'Should notify about disconnected player');
});

test('should destroy room', async t => {
    const { player1 } = t.context;

    // Create room first
    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));
    await player1.waitForMessage('ROOM_CREATED');

    // Destroy room
    player1.send(JSON.stringify({
        type: 'DESTROY_ROOM',
        payload: {}
    }));

    const response = await player1.waitForMessage('ROOM_DESTROYED');
    t.truthy(response.payload.roomId, 'Should confirm room destruction');
});

test('should reject third player joining', async t => {
    const { roomId, player1 } = t.context;

    // Create room first
    player1.send(JSON.stringify({
        type: 'CREATE_ROOM',
        payload: {}
    }));
    await player1.waitForMessage('ROOM_CREATED');

    // Add second player
    const player2 = createTestSocket(roomId);
    await waitForConnection(player2);
    t.context.player2 = player2;

    player2.send(JSON.stringify({
        type: 'JOIN_ROOM',
        payload: { roomId }
    }));
    await player2.waitForMessage('PLAYER_JOINED');

    // Try to add third player
    const player3 = createTestSocket(roomId);
    await waitForConnection(player3);

    player3.send(JSON.stringify({
        type: 'JOIN_ROOM',
        payload: { roomId }
    }));

    // Should not receive PLAYER_JOINED message
    try {
        await player3.waitForMessage('PLAYER_JOINED', 2000);
        t.fail('Should not allow third player to join');
    } catch (error) {
        t.pass('Third player was rejected');
    } finally {
        player3.close();
    }
}); 