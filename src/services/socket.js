import { io } from 'socket.io-client';

// Use the API URL for socket connection (backend server)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.isConnecting = false;
  }

  connect(token) {
    // Don't reconnect if already connected or connecting
    if (this.socket?.connected || this.isConnecting) {
      console.log('🔌 Socket already connected or connecting, skipping');
      return;
    }

    this.isConnecting = true;

    // Reuse existing socket if it exists (just reconnect)
    if (this.socket) {
      console.log('🔌 Reusing existing socket connection');
      if (!this.socket.connected) {
        this.socket.connect();
      }
      this.isConnecting = false;
      return;
    }

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      // Improved stability settings
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      // Don't force new connection - reuse existing
      forceNew: false
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      this.isConnecting = false;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnecting = false;
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      this.reconnectAttempts++;
      this.isConnecting = false;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
    });

    this.socket.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err.message);
    });
  }

  joinSession(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('join_session', sessionId);
    }
  }

  leaveSession(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_session', sessionId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
