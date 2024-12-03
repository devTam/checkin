import axios from "axios"
import { config } from "../config/env"

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export const getQRCode = async () => {
  const response = await api.get("/api/check-in/daily-qr-code")
  return response.data.data
}
