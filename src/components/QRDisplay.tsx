import { useEffect, useRef, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { format } from "date-fns"
import { initializeSocket } from "../services/socket"
import { getQRCode } from "../services/api"
import { CheckInEvent } from "../types"
import successSound from "../assets/success.mp3"
import logo from "../assets/logo.svg"

const QRDisplay = () => {
  const [qrCode, setQRCode] = useState<string>("")
  const [checkInEvent, setCheckInEvent] = useState<CheckInEvent | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const socket = initializeSocket()
    // fetchQRCode()

    socket.on("connect", () => {
      console.log("Connected to WebSocket")
      fetchQRCode()
    })

    socket.on("checkInSuccess", (data: CheckInEvent) => {
      console.log("Check-in success received:", data)
      setCheckInEvent(data)
      audioRef.current?.play()
    })

    socket.on("qrCodeRefresh", (data: { qrCodeData: string }) => {
      console.log("QR code refresh received:", data)
      setQRCode(data.qrCodeData)
      setCheckInEvent(null)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket")
    })

    return () => {
      console.log("Cleaning up socket connection")
      socket.disconnect()
    }
  }, [])

  const fetchQRCode = async () => {
    try {
      const data = await getQRCode()
      console.log("Fetched new QR code:", data)
      setQRCode(data.qrCodeData)
    } catch (err) {
      setError("Failed to fetch QR code")
      console.error("QR code fetch error:", err)
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-950 dark:bg-red-900">
        <div className="text-center text-red-50">
          <h2 className="text-2xl font-bold">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchQRCode}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <audio ref={audioRef} src={successSound} />

      <header className="bg-white dark:bg-gray-800 p-4 shadow-lg transition-colors flex items-center justify-between">
        <div className="!w-[50px] shrink-0">
          <img
            src={logo}
            alt="Spin and Drive Logo"
            className="!w-[50px] h-auto"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 transition-colors">
          {format(new Date(), "EEEE, MMMM do yyyy")}
        </p>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        {checkInEvent ? (
          <div className="animate-fade-in text-center">
            <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full ring-4 ring-red-600 dark:ring-red-500">
              <img
                src={checkInEvent.user.avatar || "/default-avatar.png"}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-gray-100">
              Welcome, {checkInEvent.user.firstName}!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Check-in successful
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(checkInEvent.timestamp), "h:mm a")}
            </p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <div className="mb-4 inline-block rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all hover:shadow-2xl">
              <QRCodeSVG
                value={qrCode}
                size={400}
                level="H"
                className="dark:bg-white dark:p-4 dark:rounded-lg"
              />
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Scan to check in
            </p>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-800 p-6 text-center text-gray-600 dark:text-gray-400 shadow-inner transition-colors">
        <p>Please have your phone ready to scan</p>
      </footer>
    </div>
  )
}

export default QRDisplay
