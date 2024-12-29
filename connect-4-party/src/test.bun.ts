/// <reference types="bun-types" />

import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import PartySocket from 'partysocket';
import { WebSocket } from 'ws';

// Mock PartySocket since it's client-side only
global.WebSocket = WebSocket as any;

// Test configuration
const TEST_HOST = "localhost:1984";
const getTestRoom = () => `test-room-${Math.random().toString(36).substring(7)}`;

// Custom error type for timeout
class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TimeoutError';
    }
}

interface TestSocket extends PartySocket {
    waitForMessage: (type: string, timeout?: number) => Promise<any>;
}

// Test context type
interface TestContext {
    roomId: string;
    player1: TestSocket;
    player2?: TestSocket;
}

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
                reject(new TimeoutError(`Timeout waiting for message type: ${type}`));
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

describe('PartyKit Connect4 Tests', () => {
    let context: TestContext;

    beforeEach(async () => {
        const roomId = getTestRoom();
        const player1 = createTestSocket(roomId);
        await waitForConnection(player1);

        context = {
            roomId,
            player1
        };
    });

    afterEach(() => {
        if (context.player1) context.player1.close();
        if (context.player2) context.player2.close();
    });

    test('should connect to server', () => {
        expect(context.player1.readyState).toBe(WebSocket.OPEN);
    });

    test('should create a room', async () => {
        const { player1 } = context;

        player1.send(JSON.stringify({
            type: 'CREATE_ROOM',
            payload: {}
        }));

        const response = await player1.waitForMessage('ROOM_CREATED');
        expect(response.payload.roomId).toBeTruthy();
    });

    test('should allow second player to join', async () => {
        const { roomId, player1 } = context;

        // Create room first
        player1.send(JSON.stringify({
            type: 'CREATE_ROOM',
            payload: {}
        }));
        await player1.waitForMessage('ROOM_CREATED');

        // Connect second player
        const player2 = createTestSocket(roomId);
        await waitForConnection(player2);
        context.player2 = player2;

        player2.send(JSON.stringify({
            type: 'JOIN_ROOM',
            payload: { roomId }
        }));

        const response = await player2.waitForMessage('PLAYER_JOINED');
        expect(response.payload.roomId).toBe(roomId);
    });

    test('should update game state', async () => {
        const { player1 } = context;

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
        expect(response.payload.currentTurn).toBeTruthy();
        expect(response.payload.board).toBeTruthy();
    });

    test('should update player score', async () => {
        const { player1 } = context;

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
        expect(response.payload.newScore).toBe(1);
    });

    test('should handle player disconnection', async () => {
        const { roomId, player1 } = context;

        // Create room and add second player
        player1.send(JSON.stringify({
            type: 'CREATE_ROOM',
            payload: {}
        }));
        await player1.waitForMessage('ROOM_CREATED');

        const player2 = createTestSocket(roomId);
        await waitForConnection(player2);
        context.player2 = player2;

        player2.send(JSON.stringify({
            type: 'JOIN_ROOM',
            payload: { roomId }
        }));
        await player2.waitForMessage('PLAYER_JOINED');

        // Setup listener for disconnect event before closing
        const disconnectPromise = player2.waitForMessage('PLAYER_LEFT');
        player1.close();

        const response = await disconnectPromise;
        expect(response.payload.playerId).toBeTruthy();
    });

    test('should destroy room', async () => {
        const { player1 } = context;

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
        expect(response.payload.roomId).toBeTruthy();
    });

    test('should reject third player joining', async () => {
        const { roomId, player1 } = context;

        // Create room first
        player1.send(JSON.stringify({
            type: 'CREATE_ROOM',
            payload: {}
        }));
        await player1.waitForMessage('ROOM_CREATED');

        // Add second player
        const player2 = createTestSocket(roomId);
        await waitForConnection(player2);
        context.player2 = player2;

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
            throw new Error('Should not allow third player to join');
        } catch (error) {
            if (error instanceof TimeoutError) {
                expect(error.message).toBe('Timeout waiting for message type: PLAYER_JOINED');
            } else {
                throw error;
            }
        } finally {
            player3.close();
        }
    });
}); 