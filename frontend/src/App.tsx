
import './App.css'
import { useEffect, useRef, useState } from 'react'

type LogEntry = {
  time: string
  message: string
  level: 'info' | 'success' | 'error'
}

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [connected, setConnected] = useState(false)
  const [message, setMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const addLog = (message: string, level: LogEntry['level'] = 'info') => {
      setLogs((current) => [...current.slice(-99), {
        time: new Date().toLocaleTimeString(), message, level,
      }])
    }

    const socket = new WebSocket('ws://localhost:8081')
    socketRef.current = socket
    socket.addEventListener('open', () => {
      setConnected(true)
      addLog('WebSocket connection established', 'success')
    })
    socket.addEventListener('message', (event) => {
      if (typeof event.data === 'string') {
        addLog(event.data + 'Binary message received')
      } else {
        addLog('Binary message received')
      }
    })
    socket.addEventListener('error', () => addLog('WebSocket connection error', 'error'))
    socket.addEventListener('close', () => {
      setConnected(false)
      addLog('WebSocket connection closed', 'error')
    })

    return () => {
      socketRef.current = null
      socket.close()
    }
  }, [])

  const sendMessage = () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || socketRef.current?.readyState !== WebSocket.OPEN) return

    socketRef.current.send(trimmedMessage)
    setMessage('')
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', padding: 32, fontFamily: 'monospace' }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: 'sans-serif' }}>Live WebSocket Logs</h1>
            <small style={{ color: '#94a3b8' }}>ws://localhost:8081</small>
          </div>
          <strong style={{ color: connected ? '#4ade80' : '#f87171' }}>
            ● {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </strong>
        </header>
        <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: 8, padding: 16, height: '60vh', overflowY: 'auto' }}>
          {logs.length === 0 && <div style={{ color: '#64748b' }}>Waiting for incoming messages...</div>}
          {logs.map((log, index) => (
            <div key={`${log.time}-${index}`} style={{ display: 'flex', gap: 12, marginBottom: 8, lineHeight: 1.5 }}>
              <span style={{ color: '#64748b' }}>[{log.time}]</span>
              <span style={{ color: log.level === 'success' ? '#4ade80' : log.level === 'error' ? '#f87171' : '#cbd5e1' }}>
                {log.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            sendMessage()
          }}
          style={{ display: 'flex', gap: 8, marginTop: 12 }}
        >
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type a message..."
            disabled={!connected}
            style={{ flex: 1, background: '#020617', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '10px 12px', fontFamily: 'monospace' }}
          />
          <button
            type="submit"
            disabled={!connected || !message.trim()}
            style={{ background: '#2563eb', color: '#fff', border: 0, borderRadius: 6, padding: '0 18px', cursor: 'pointer' }}
          >
            Send
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
