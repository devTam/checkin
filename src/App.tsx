import { useState, createContext } from "react"
import QRDisplay from "./components/QRDisplay"
import { LoadingProvider } from "./contexts/LoadingContext"
import { AnimatePresence } from "framer-motion"

// Create theme context
export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
})

function App() {
  const [isDark, setIsDark] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <LoadingProvider>
        <div className={`app ${isDark ? 'dark' : ''}`}>
          <AnimatePresence mode="wait">
            <QRDisplay />
          </AnimatePresence>
        </div>
      </LoadingProvider>
    </ThemeContext.Provider>
  )
}

export default App
