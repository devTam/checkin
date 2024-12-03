import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { ErrorBoundary } from "react-error-boundary"
import { Toaster } from "react-hot-toast"

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => (
  <div role="alert" className="flex h-screen items-center justify-center">
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong
      </h2>
      <pre className="text-sm text-gray-500 mb-4">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Try again
      </button>
    </div>
  </div>
)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
      <Toaster position="top-right" />
    </ErrorBoundary>
  </React.StrictMode>
)
