import { useState, useEffect } from 'react'
import { Card, Statistic, Button, Space } from 'antd'
import { useWebSocket } from './hooks/useWebSocket'

interface DashboardData {
  equity: number
  balance: number
  drawdown: number
  kill_switch: boolean
  trades: any[]
}

function App() {
  const [data, sendEmergencyStop] = useWebSocket('ws://localhost:8000/ws')

  return (
    <div style={{ padding: 24, background: '#0d1117', minHeight: '100vh', color: '#c9d1d9' }}>
      <h1>GQR Institutional Dashboard</h1>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Statistic title="Equity" value={data?.equity ?? 0} precision={2} prefix="$" />
          <Statistic title="Balance" value={data?.balance ?? 0} precision={2} prefix="$" />
          <Statistic title="Drawdown" value={((data?.drawdown ?? 0) * 100).toFixed(2)} suffix="%" />
        </Card>
        {data?.kill_switch && (
          <div style={{ color: 'red', fontSize: 24 }}>🚨 KILL SWITCH ACTIVE</div>
        )}
        <Button danger onClick={sendEmergencyStop}>
          EMERGENCY STOP
        </Button>
      </Space>
    </div>
  )
}

export default App