import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const initializeSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || "http://localhost:9000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
  }

  return socket
}

export const getSocket = () => socket
