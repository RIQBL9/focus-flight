import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const PRESETS = [
  { label: 'Short Hop', minutes: 15, icon: '🛫', color: '#34c759' },
  { label: 'Domestic', minutes: 25, icon: '✈️', color: '#0071e3' },
  { label: 'Long Haul', minutes: 45, icon: '🌍', color: '#af52de' },
  { label: 'Ultra Long', minutes: 90, icon: '🚀', color: '#ff9500' },
]

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      osc.type = 'sine'
      const t = ctx.currentTime + i * 0.15
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.7)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch (e) {}
}

export default function StudyTimer({ flight }) {
  const [presetIdx, setPresetIdx] = useLocalStorage('ff-preset', 1)
  const [sessions, setSessions] = useLocalStorage('ff-sessions', 0)
  const [totalMinutes, setTotalMinutes] = useLocalStorage('ff-total-mins', 0)
  const preset = PRESETS[presetIdx]
  const [seconds, setSeconds] = useState(preset.minutes * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setSessions(n => n + 1)
            setTotalMinutes(m => m + preset.minutes)
            playChime()
            return preset.minutes * 60
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, preset, setSessions, setTotalMinutes])

  const reset = () => { setRunning(false); setSeconds(preset.minutes * 60) }
  const selectPreset = i => { setPresetIdx(i); setSeconds(PRESETS[i].minutes * 60); setRunning(false) }

  const total = preset.minutes * 60
  const pct = (total - seconds) / total
  const r = 60
  const circ = 2 * Math.PI * r
  const dash = pct * circ

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 22, boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border-hairline)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Study Timer</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total</div>
      </div>

      {/* Presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 22 }}>
        {PRESETS.map((p, i) => (
          <button key={p.label} onClick={() => selectPreset(i)} style={{
            padding: '7px 10px', borderRadius: 'var(--radius-sm)',
            background: presetIdx === i ? p.color : 'var(--bg-inset)',
            color: presetIdx === i ? 'white' : 'var(--text-secondary)',
            border: 'none', fontSize: 12, fontWeight: presetIdx === i ? 500 : 400,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            boxShadow: presetIdx === i ? `0 2px 8px ${p.color}40` : 'none',
          }}>
            <span style={{ fontSize: 12 }}>{p.icon}</span>
            <span>{p.label} · {p.minutes}m</span>
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ position: 'relative', width: 140, height: 140 }}>
          <svg width={140} height={140} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={70} cy={70} r={r} fill="none" stroke="var(--bg-inset-strong)" strokeWidth={6} />
            <circle cx={70} cy={70} r={r} fill="none" stroke={preset.color} strokeWidth={6}
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.5s var(--ease-smooth)', filter: `drop-shadow(0 0 6px ${preset.color}60)` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{preset.label}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={reset} style={{
            background: 'var(--bg-inset)', color: 'var(--text-secondary)', border: 'none',
            borderRadius: 'var(--radius-full)', padding: '8px 16px', fontSize: 13, cursor: 'pointer',
          }}>Reset</button>
          <button onClick={() => setRunning(r => !r)} style={{
            background: running ? 'var(--red)' : preset.color,
            color: 'white', border: 'none', borderRadius: 'var(--radius-full)',
            padding: '8px 26px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            boxShadow: `0 3px 10px ${running ? 'rgba(255,59,48,0.35)' : preset.color + '55'}`,
          }}>{running ? 'Pause' : 'Start'}</button>
        </div>
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Sessions completed</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {sessions} <span style={{ fontSize: 11 }}>✈</span>
        </div>
      </div>
    </div>
  )
}
