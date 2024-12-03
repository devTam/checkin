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
    const socket = initializeSocket()

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
        className="qr-wrapper dark:bg-white dark:p-3 dark:rounded-lg flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: qrCode }}
        style={{ width: 280, height: 280 }}
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors relative flex flex-col">
      <audio ref={audioRef} src={successSound} />

      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-2 px-4 shadow-lg transition-colors">
        <p className="text-gray-600 dark:text-gray-400 transition-colors text-base font-medium">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {checkInEvent ? (
          <div className="animate-fade-in text-center transform transition-all duration-500 scale-105">
            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full ring-6 ring-red-600 dark:ring-red-500 shadow-2xl">
              <img
                src={checkInEvent.user.avatar || "/default-avatar.png"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-gray-100">
              Welcome, {checkInEvent.user.firstName}!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-1">
              Check-in successful
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(checkInEvent.timestamp), "h:mm a")}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="mb-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 shadow-2xl transition-all hover:shadow-3xl">
              {renderQRCode()}
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Scan to check in
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-2 px-4 text-center text-gray-600 dark:text-gray-400 shadow-inner transition-colors">
        <p className="text-base">Please have your phone ready to scan</p>
      </footer>
    </div>
  )
}

export default QRDisplay
