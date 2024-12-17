import { useEffect, useState } from "react"
import io, { Socket } from "socket.io-client"

type EventHandler = (...args: any[]) => void
type EventsMap = Record<string, EventHandler>

interface UseWebSocketProps {
  url?: string
  events?: EventsMap
}

const WEBSOCKET_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_DEV_SOCKET_URL
    : import.meta.env.VITE_SOCKET_URL

let socketInstance: Socket | null = null

export const useWebSocket = ({
  url = WEBSOCKET_URL,
  events = {},
}: UseWebSocketProps = {}) => {
  const [isConnected, setIsConnected] = useState(false)

  if (!socketInstance) {
    socketInstance = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      secure: true,
      withCredentials: true,
      timeout: 20000,
    })
  }
  const socket = socketInstance

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket")
      setIsConnected(true)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket")
      setIsConnected(false)
    })

    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")

      Object.entries(events).forEach(([event]) => {
        socket.off(event)
      })
    }
  }, [events])

  return {
    socket,
    isConnected,
  }
}

export const useSocketEvent = <T = any>(
  eventName: string,
  handler: (data: T) => void
) => {
  const { socket } = useWebSocket()

  useEffect(() => {
    if (!socket) return

    socket.on(eventName, handler)

    return () => {
      socket.off(eventName, handler)
    }
  }, [socket, eventName, handler])
}
