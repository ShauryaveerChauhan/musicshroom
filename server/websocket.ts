import { PrismaClient } from '../app/generated/prisma';
import { ServerWebSocket } from "bun";

console.log('Starting WebSocket server...');
process.stdout.write('Starting WebSocket server...\n');

const prisma = new PrismaClient();

interface Client {
  ws: ServerWebSocket<unknown>;
  roomCode: string | null;
  userId: string | null;
  joinedAt: Date;
  clientId: string;
}

const clients = new Map<string, Client>();

try {
  const server = Bun.serve({
    port: 3001,
    fetch(req, server) {
      const success = server.upgrade(req);
      if (success) {
        console.log('New WebSocket connection request');
        process.stdout.write('New WebSocket connection request\n');
        return undefined;
      }
      return new Response('Expected a websocket connection', { status: 400 });
    },
    websocket: {
      async message(ws, message) {
        try {
          const data = JSON.parse(message.toString());
          const client = Array.from(clients.values()).find(c => c.ws === ws);
          if (!client) return;

          console.log('Received message:', data.type);
          process.stdout.write(`Received message: ${data.type}\n`);

          switch (data.type) {
            case 'JOIN_ROOM':
              const { roomCode, userId } = data;
              if (!roomCode || !userId) {
                console.error('Missing roomCode or userId in JOIN_ROOM message');
                return;
              }
              
              client.roomCode = roomCode;
              client.userId = userId;
              
              // Notify others in the room
              const userInfo = await getUserInfo(userId);
              if (userInfo) {
                console.log(`User ${userId} joined room ${roomCode}`);
                process.stdout.write(`User ${userId} joined room ${roomCode}\n`);

                // First, send the new user their own info to ensure they're listed as a listener
                ws.send(JSON.stringify({
                  type: 'USER_JOINED',
                  user: {
                    ...userInfo,
                    isHost: data.isHost // Pass through the isHost flag
                  }
                }));

                // Let the joining client know about other users in the room
                const otherClients = Array.from(clients.values())
                  .filter(c => c.roomCode === roomCode && c.userId !== userId);
                
                console.log(`Found ${otherClients.length} other clients in room ${roomCode}`);
                process.stdout.write(`Found ${otherClients.length} other clients in room ${roomCode}\n`);
                
                for (const otherClient of otherClients) {
                  if (otherClient.userId) {
                    const otherUserInfo = await getUserInfo(otherClient.userId);
                    if (otherUserInfo) {
                      console.log(`Sending existing user ${otherClient.userId} info to new user ${userId}`);
                      ws.send(JSON.stringify({
                        type: 'USER_JOINED',
                        user: otherUserInfo
                      }));
                    }
                  }
                }
                
                // Notify others about the new user
                broadcastToRoom(roomCode, {
                  type: 'USER_JOINED',
                  user: {
                    ...userInfo,
                    isHost: data.isHost // Pass through the isHost flag
                  }
                }, client.clientId);
              }
              break;
              
            case 'UPDATE_ROOM':
              const { room } = data;
              if (client.roomCode && room) {
                console.log(`Room ${client.roomCode} updated`);
                process.stdout.write(`Room ${client.roomCode} updated\n`);
                broadcastToRoom(client.roomCode, {
                  type: 'ROOM_UPDATED',
                  room
                });
              }
              break;
          }
        } catch (error) {
          console.error('Error handling message:', error);
          process.stderr.write(`Error handling message: ${error}\n`);
        }
      },
      open(ws) {
        const clientId = Math.random().toString(36).substring(7);
        clients.set(clientId, { 
          ws,
          roomCode: null, 
          userId: null, 
          joinedAt: new Date(),
          clientId
        });
        console.log(`Client connected: ${clientId}`);
        process.stdout.write(`Client connected: ${clientId}\n`);
      },
      close(ws, code, reason) {
        const client = Array.from(clients.values()).find(c => c.ws === ws);
        if (client?.roomCode && client?.userId) {
          console.log(`User ${client.userId} left room ${client.roomCode}`);
          process.stdout.write(`User ${client.userId} left room ${client.roomCode}\n`);
          broadcastToRoom(client.roomCode, {
            type: 'USER_LEFT',
            userId: client.userId
          }, client.clientId);
        }
        clients.delete(client?.clientId ?? '');
        console.log(`Client disconnected: ${client?.clientId}`);
        process.stdout.write(`Client disconnected: ${client?.clientId}\n`);
      },
    }
  });

  console.log(`WebSocket server is running at ws://localhost:${server.port}`);
  process.stdout.write(`WebSocket server is running at ws://localhost:${server.port}\n`);

} catch (error) {
  console.error('Failed to start WebSocket server:', error);
  process.stderr.write(`Failed to start WebSocket server: ${error}\n`);
  process.exit(1);
}

async function getUserInfo(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    process.stderr.write(`Error getting user info: ${error}\n`);
    return null;
  }
}

function broadcastToRoom(roomCode: string, message: any, excludeClientId?: string) {
  const roomClients = Array.from(clients.values())
    .filter(c => c.roomCode === roomCode && c.clientId !== excludeClientId);

  console.log(`Broadcasting to ${roomClients.length} clients in room ${roomCode}`);
  process.stdout.write(`Broadcasting to ${roomClients.length} clients in room ${roomCode}\n`);
  
  for (const client of roomClients) {
    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error broadcasting to client ${client.clientId}:`, error);
      process.stderr.write(`Error broadcasting to client ${client.clientId}: ${error}\n`);
    }
  }
}
