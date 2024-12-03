import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (options?: Partial<ManagerOptions & SocketOptions>) => {
  if (!socket) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "wss://spinanddrive-backend.onrender.com";
    console.log('Initializing socket connection to:', socketUrl);

    socket = io(socketUrl, {
      ...options,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      secure: true,
      withCredentials: true,
      timeout: 20000,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*"
      },
      path: '/socket.io'
    })

    // Debug listeners
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      console.log('Transport:', socket?.io?.engine?.transport?.name);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', {
        message: error.message,
        context: socket?.io?.engine?.transport?.name
      });
      
      if (socket?.io?.engine?.transport?.name === 'websocket') {
        console.log('Attempting to fallback to polling transport');
        socket.io.opts.transports = ['polling'];
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket');
    socket.disconnect()
    socket = null
  }
}
