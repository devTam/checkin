import { io, ManagerOptions, Socket, SocketOptions } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = (options?: Partial<ManagerOptions & SocketOptions>) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL, {
      ...options,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })
  }
  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
