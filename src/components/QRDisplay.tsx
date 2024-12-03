import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import {
  initializeSocket,
  disconnectSocket,
} from "../services/socket"
import { getQRCode } from "../services/api"
import { CheckInEvent } from "../types"
import successSound from "../assets/success.mp3"

const QRDisplay = () => {
  const [qrCode, setQRCode] = useState<string>("")
  const [checkInEvent, setCheckInEvent] = useState<CheckInEvent | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    console.log('Socket URL:', import.meta.env.VITE_SOCKET_URL);
    const socket = initializeSocket({
      transports: ["websocket", "polling"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      secure: true,
      rejectUnauthorized: false
    })

    const handleConnect = () => {
      fetchQRCode()
      console.log("Connected to WebSocket")
      setError("")
    }

    const handleConnectError = (err: Error) => {
      console.error("Connection error:", err)
      setError(`Failed to connect to server: ${err.message}`)
    }

    const handleCheckInSuccess = (data: CheckInEvent) => {
      console.log("Check-in success received:", data)
      setCheckInEvent(data)
      audioRef.current?.play()
    }

    const handleQRCodeRefresh = (data: { qrCodeData: string }) => {
      console.log("QR code refresh received:", data)
      setQRCode(data.qrCodeData)
      setCheckInEvent(null)
    }

    const handleDisconnect = () => {
      console.log("Disconnected from WebSocket")
    }

    socket.on("connect", handleConnect)
    socket.on("connect_error", handleConnectError)
    socket.on("checkInSuccess", handleCheckInSuccess)
    socket.on("qrCodeRefresh", handleQRCodeRefresh)
    socket.on("disconnect", handleDisconnect)

    socket.on("reconnect_attempt", (attempt) => {
      console.log(`Reconnection attempt ${attempt}`)
    })

    socket.on("reconnect_error", (err) => {
      console.error("Reconnection error:", err)
      setError(`Failed to reconnect: ${err.message}`)
    })

    return () => {
      disconnectSocket()
    }
  }, [])

  const fetchQRCode = async () => {
    try {
      const data = await getQRCode()
      setQRCode(data.qrCodeData)
    } catch (err) {
      setError("Failed to fetch QR code")
    }
  }

  const renderQRCode = () => {
    if (!qrCode) return null

    return (
      <div
        className="qr-wrapper dark:bg-white dark:p-4 dark:rounded-lg flex items-center justify-center animate-pulse-slow"
        dangerouslySetInnerHTML={{ __html: qrCode }}
        style={{ width: 350, height: 350 }}
      />
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-900 to-red-950 dark:from-red-800 dark:to-red-900">
        <div className="text-center text-red-50 p-8 backdrop-blur-sm bg-white/10 rounded-xl">
          <h2 className="text-3xl font-bold mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <button
            onClick={fetchQRCode}
            className="mt-4 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700 transition-all hover:scale-105 active:scale-95 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors relative">
      <audio ref={audioRef} src={successSound} />

      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-lg transition-colors">
        <p className="text-gray-600 dark:text-gray-400 transition-colors text-lg font-medium">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </header>

      <main className="flex flex-1 items-center justify-center p-8 min-h-[calc(100vh-200px)]">
        {checkInEvent ? (
          <div className="animate-fade-in text-center transform transition-all duration-500 scale-105">
            <div className="mx-auto mb-8 h-40 w-40 overflow-hidden rounded-full ring-8 ring-red-600 dark:ring-red-500 shadow-2xl">
              <img
                src={checkInEvent.user.avatar || "/default-avatar.png"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mb-4 text-4xl font-bold text-gray-800 dark:text-gray-100">
              Welcome, {checkInEvent.user.firstName}!
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Check-in successful
            </p>
            <p className="text-md text-gray-500 dark:text-gray-400">
              {format(new Date(checkInEvent.timestamp), "h:mm a")}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="mb-6 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 shadow-2xl transition-all hover:shadow-3xl">
              {renderQRCode()}
            </div>
            <p className="text-2xl text-gray-600 dark:text-gray-300 font-medium">
              Scan to check in
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 text-center text-gray-600 dark:text-gray-400 shadow-inner transition-colors">
        <p className="text-lg">Please have your phone ready to scan</p>
      </footer>
    </div>
  )
}

export default QRDisplay
