import { io, Socket } from "socket.io-client"
import { config } from "../config/env"

let socket: Socket | null = null

export const initializeSocket = () => {
  if (!socket) {
    socket = io(config.WS_URL)
  }
  return socket
}

export const getSocket = () => socket
