import { useEffect, useRef, useState } from 'react'

export interface DashboardState {
  equity: number
  balance: number
  drawdown: number
  kill_switch: boolean
  trades: unknown[]
}

/**
 * Live connection to the GQR dashboard server (ws://host:8000/ws).
 * Returns [latestState | null, sendEmergencyStop]. A null state means
 * "engine unreachable" — the UI renders zeros until the first frame arrives.
 */
export function useWebSocket(url: string): [DashboardState | null, () => void] {
  const [data, setData] = useState<DashboardState | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws
    ws.onmessage = (event) => {
      try {
        setData(JSON.parse(event.data) as DashboardState)
      } catch {
        /* ignore malformed frames */
      }
    }
    return () => {
      wsRef.current = null
      ws.close()
    }
  }, [url])

  const sendEmergencyStop = () => {
    wsRef.current?.send(JSON.stringify({ command: 'emergency_stop' }))
  }

  return [data, sendEmergencyStop]
}
