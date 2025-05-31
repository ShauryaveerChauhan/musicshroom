// WebSocket message types
export interface JoinRoomMessage {
  type: 'JOIN_ROOM';
  roomCode: string;
  userId: string;
}

export interface UpdateRoomMessage {
  type: 'UPDATE_ROOM';
  roomCode: string;
  room: RoomData;
}

export interface LeaveRoomMessage {
  type: 'LEAVE_ROOM';
  roomCode: string;
}

export interface PingMessage {
  type: 'PING';
}

export interface PongMessage {
  type: 'PONG';
}

export interface UserJoinedMessage {
  type: 'USER_JOINED';
  user: User;
}

export interface UserLeftMessage {
  type: 'USER_LEFT';
  userId: string;
}

export interface RoomUpdatedMessage {
  type: 'ROOM_UPDATED';
  room: RoomData;
}

export interface RoomStateMessage {
  type: 'ROOM_STATE';
  users: User[];
}

export interface ErrorMessage {
  type: 'ERROR';
  error: string;
}

export type WebSocketMessage = 
  | JoinRoomMessage
  | UpdateRoomMessage
  | LeaveRoomMessage
  | PingMessage
  | PongMessage
  | UserJoinedMessage
  | UserLeftMessage
  | RoomUpdatedMessage
  | RoomStateMessage
  | ErrorMessage;

export type User = {
  id: string;
  name: string;
  avatar: string | null;
};

export type RoomData = {
  name: string;
  code: string;
  hostId: string;
};

export interface WebSocketClient {
  ws: WebSocket;
  roomCode: string | null;
  userId: string | null;
  joinedAt: Date;
  clientId: string;
}

export interface WebSocketRoom {
  code: string;
  clients: Set<string>; // Set of client IDs
  lastActivity: Date;
}
