import PartySocket from "partysocket";
import { useEffect, useState } from "react";

interface GameState {
    board: (string | null)[][];
    playerTurn: string;
    player1Score: number;
    player2Score: number;
    winner: string;
    time: number;
    lastGameWinner: string | null;
}

interface GameAction {
    type: "MAKE_MOVE";
    payload: {
        row: number;
        col: number;
        player: string;
    };
}

interface UsePartyServerProps {
    roomId: string | null;
    onGameStateUpdate?: (state: GameState) => void;
    onPlayerJoined?: () => void;
    onPlayerLeft?: () => void;
    initialGameState?: GameState;
}

export const usePartyServer = ({
    roomId,
    onGameStateUpdate,
    onPlayerJoined,
    onPlayerLeft,
    initialGameState,
}: UsePartyServerProps) => {
    const [socket, setSocket] = useState<PartySocket | null>(null);
    const [isHost, setIsHost] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [playerNumber, setPlayerNumber] = useState<"PLAYER 1" | "PLAYER 2" | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const newSocket = new PartySocket({
            host: "localhost:1984",
            room: roomId,
        });

        newSocket.addEventListener("open", () => {
            console.log("Connected to game server");
            setIsConnected(true);
            if (isHost && initialGameState) {
                newSocket.send(
                    JSON.stringify({
                        type: "GAME_STATE_UPDATE",
                        payload: initialGameState,
                    })
                );
            }
        });

        newSocket.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
        });

        newSocket.addEventListener("close", () => {
            console.log("Disconnected from game server");
            setIsConnected(false);
            setPlayerNumber(null);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [roomId, isHost]);

    const handleServerMessage = (message: any) => {
        switch (message.type) {
            case "ROOM_CREATED":
                setIsHost(true);
                setPlayerNumber("PLAYER 1");
                break;

            case "PLAYER_JOINED":
                onPlayerJoined?.();
                if (!playerNumber) {
                    setPlayerNumber("PLAYER 2");
                }
                break;

            case "GAME_STATE_UPDATE":
                onGameStateUpdate?.(message.payload);
                break;

            case "PLAYER_LEFT":
                onPlayerLeft?.();
                break;

            case "ASSIGN_PLAYER":
                setPlayerNumber(message.payload.playerNumber);
                break;
        }
    };

    const createRoom = async (customRoomId?: string) => {
        const newRoomId = customRoomId || `game-${Math.random().toString(36).substring(7)}`;
        const newSocket = new PartySocket({
            host: "localhost:1984",
            room: newRoomId,
        });

        return new Promise<string>((resolve, reject) => {
            newSocket.addEventListener("open", () => {
                newSocket.send(
                    JSON.stringify({
                        type: "CREATE_ROOM",
                        payload: {
                            gameState: initialGameState,
                        },
                    })
                );
                setIsHost(true);
                setPlayerNumber("PLAYER 1");
                setSocket(newSocket);
                resolve(newRoomId);
            });

            newSocket.addEventListener("error", (error) => {
                reject(error);
            });
        });
    };

    const joinRoom = async (roomIdToJoin: string) => {
        if (!socket) {
            const newSocket = new PartySocket({
                host: "localhost:1984",
                room: roomIdToJoin,
            });

            return new Promise<void>((resolve, reject) => {
                newSocket.addEventListener("open", () => {
                    newSocket.send(
                        JSON.stringify({
                            type: "JOIN_ROOM",
                            payload: { roomId: roomIdToJoin },
                        })
                    );
                    setSocket(newSocket);
                    resolve();
                });

                newSocket.addEventListener("error", (error) => {
                    reject(error);
                });
            });
        } else {
            socket.send(
                JSON.stringify({
                    type: "JOIN_ROOM",
                    payload: { roomId: roomIdToJoin },
                })
            );
        }
    };

    const makeMove = (row: number, col: number) => {
        if (!socket || !playerNumber) return;

        const action: GameAction = {
            type: "MAKE_MOVE",
            payload: {
                row,
                col,
                player: playerNumber
            }
        };

        socket.send(JSON.stringify(action));
    };

    const updateGameState = (newState: GameState) => {
        if (!socket) return;
        socket.send(
            JSON.stringify({
                type: "GAME_STATE_UPDATE",
                payload: newState,
            })
        );
    };

    const destroyRoom = () => {
        if (!socket || !isHost) return;
        socket.send(
            JSON.stringify({
                type: "DESTROY_ROOM",
            })
        );
        socket.close();
        setSocket(null);
    };

    const isMyTurn = (currentTurn: string): boolean => {
        return playerNumber === currentTurn;
    };

    return {
        socket,
        isHost,
        isConnected,
        playerNumber,
        isMyTurn,
        createRoom,
        joinRoom,
        makeMove,
        updateGameState,
        destroyRoom,
    };
}; 