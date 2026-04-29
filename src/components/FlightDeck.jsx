import { useState, useEffect, useRef } from 'react'

function Gauge({ label, value, max, unit, color = '#0071e3', size = 110 }) {
  const pct = Math.min(Math.max(value / max, 0), 1)
  const r = size / 2 - 12
  const circumference = 2 * Math.PI * r
  const sweepRange = 270 / 360
  const sweep = pct * sweepRange * circumference
  const trackDash = sweepRange * circumference

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={5}
          strokeDasharray={`${trackDash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={`${sweep} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s var(--ease-smooth)', filter: `drop-shadow(0 0 6px ${color}80)` }} />
        <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fill="white" fontSize="16" fontWeight="600" fontFamily="'DM Mono', monospace" letterSpacing="-0.02em">{Math.round(value).toLocaleString()}</text>
        <text x={size / 2} y={size / 2 + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">{unit}</text>
      </svg>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: -2, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function ToggleSwitch({ label, on, toggle }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button onClick={toggle} style={{
        width: 38, height: 22, borderRadius: 11,
        background: on ? '#34c759' : 'rgba(255,255,255,0.1)',
        position: 'relative', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.15)',
        padding: 0, transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: 'white',
          transition: 'left 0.2s var(--ease-spring)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }} />
      </button>
      <div style={{ fontSize: 9, color: on ? '#34c759' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

const ATC_MESSAGES = [
  ['TWR', 'Cleared for takeoff runway 27R, wind 230 at 8'],
  ['DEP', 'Climb maintain flight level 350'],
  ['CTR', 'Contact next sector on 132.85, good day'],
  ['ATC', 'Roger, maintaining heading 245'],
  ['ACR', 'Light chop reported at FL360, smooth above'],
  ['CTR', 'Direct to waypoint, descent at pilot discretion'],
]

export default function FlightDeck({ flight }) {
  const [instruments, setInstruments] = useState({ altitude: 0, speed: 0, vspeed: 0, heading: 245, fuel: 92, temp: -56 })
  const [switches, setSwitches] = useState({ autopilot: true, seatbelt: true, landing: false, beacon: true, nav: true, strobe: true, cabin: true, apu: false })
  const [phase, setPhase] = useState('Pre-departure')
  const [time, setTime] = useState(new Date())
  const [flightTime, setFlightTime] = useState(0)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const iv = setInterval(() => {
      setTime(new Date())
      setFlightTime(t => t + 1)
      setInstruments(prev => {
        const climbRate = switches.autopilot ? 700 : 250
        const newAlt = Math.min(prev.altitude + climbRate + Math.random() * 200, 38000)
        const newSpeed = Math.min(prev.speed + 8 + Math.random() * 4, 580)
        const vspeed = (newAlt - prev.altitude) * 6
        if (newAlt < 1000) setPhase('Pre-departure')
        else if (newAlt < 10000) setPhase('Climbing')
        else if (newAlt < 36000) setPhase('Ascending')
        else setPhase('Cruising')
        return {
          altitude: newAlt,
          speed: newSpeed,
          vspeed: Math.max(0, vspeed),
          heading: prev.heading,
          fuel: Math.max(prev.fuel - 0.015, 0),
          temp: -56 + Math.random() * 4 - 2,
        }
      })
    }, 1200)
    return () => clearInterval(iv)
  }, [switches.autopilot])

  // ATC chatter
  useEffect(() => {
    const addMessage = () => {
      const msg = ATC_MESSAGES[Math.floor(Math.random() * ATC_MESSAGES.length)]
      setMessages(m => [{ src: msg[0], text: msg[1], time: new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5), id: Date.now() + Math.random() }, ...m].slice(0, 4))
    }
    addMessage()
    const iv = setInterval(addMessage, 8000)
    return () => clearInterval(iv)
  }, [])

  const formatFlightTime = s => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const toggle = key => setSwitches(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div style={{ paddingTop: 32, animation: 'fadeUp 0.4s var(--ease-smooth) both' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Cockpit View</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', letterSpacing: '-0.03em', marginBottom: 4, lineHeight: 1 }}>Flight Deck</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{flight?.aircraft} · {flight?.code} · <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{phase}</span></p>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-tertiary)' }}>
          {flight?.from} → {flight?.to}
        </div>
      </div>

      <div style={{ background: '#0d0d10', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(255,255,255,0.06)' }}>

        {/* Top status bar */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: switches.autopilot ? '#34c759' : '#ff9500', animation: 'blink 2s infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{switches.autopilot ? 'AP ENGAGED' : 'MANUAL CONTROL'}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#34c759', letterSpacing: '0.08em', fontWeight: 500 }}>
            {time.toUTCString().slice(17, 25)} UTC
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>FLT {formatFlightTime(flightTime)}</div>
        </div>

        {/* Primary instruments */}
        <div style={{ padding: '32px 24px 16px', display: 'flex', justifyContent: 'center', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
          <Gauge label="Altitude" value={instruments.altitude} max={42000} unit="ft" color="#5ac8fa" />
          <Gauge label="Airspeed" value={instruments.speed} max={650} unit="kts" color="#0071e3" />
          <Gauge label="V/Speed" value={instruments.vspeed} max={3000} unit="fpm" color="#af52de" />
          <Gauge label="Heading" value={instruments.heading} max={360} unit="deg" color="#ff9500" />
          <Gauge label="Fuel" value={instruments.fuel} max={100} unit="%" color={instruments.fuel < 20 ? '#ff3b30' : '#34c759'} />
        </div>

        {/* Phase indicator */}
        <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'center', gap: 6 }}>
          {['Pre-departure', 'Climbing', 'Ascending', 'Cruising'].map(p => (
            <div key={p} style={{
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              background: phase === p ? 'rgba(0,113,227,0.25)' : 'rgba(255,255,255,0.04)',
              border: `0.5px solid ${phase === p ? 'rgba(0,113,227,0.5)' : 'rgba(255,255,255,0.08)'}`,
              fontSize: 11, color: phase === p ? '#5ac8fa' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s', fontWeight: phase === p ? 500 : 400,
            }}>{p}</div>
          ))}
        </div>

        {/* Two-panel: switches + ATC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
          {/* Switches */}
          <div style={{ background: '#0a0a0c', padding: '20px 28px', borderRight: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 18, fontWeight: 500 }}>Overhead Panel</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, justifyItems: 'center' }}>
              {Object.entries(switches).map(([key, val]) => (
                <ToggleSwitch key={key} label={key} on={val} toggle={() => toggle(key)} />
              ))}
            </div>
          </div>

          {/* ATC chatter */}
          <div style={{ background: '#070708', padding: '20px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>ATC Comms</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759', animation: 'blink 1.5s infinite' }} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>121.5 MHz</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.map(m => (
                <div key={m.id} style={{ animation: 'fadeIn 0.3s ease both' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>{m.time}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#5ac8fa', fontWeight: 500 }}>{m.src}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, paddingLeft: 36, lineHeight: 1.4 }}>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MFD */}
        <div style={{ background: '#06070a', borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500 }}>Navigation Display</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>RANGE 200NM</div>
          </div>
          <div style={{ position: 'relative', height: 160, background: 'radial-gradient(circle at 50% 100%, rgba(0,113,227,0.08), transparent 70%)', borderRadius: 14, border: '0.5px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            {/* Range rings */}
            {[40, 80, 120].map(r => (
              <div key={r} style={{ position: 'absolute', left: '50%', bottom: -r, width: r * 2, height: r * 2, borderRadius: '50%', border: '0.5px dashed rgba(0,113,227,0.15)', transform: 'translateX(-50%)' }} />
            ))}
            {/* Heading line */}
            <div style={{ position: 'absolute', left: '50%', bottom: 30, top: 12, width: 1, background: 'linear-gradient(to bottom, transparent, rgba(0,113,227,0.3))' }} />
            {/* Aircraft */}
            <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)', color: '#ff9500', fontSize: 22 }}>✈</div>
            {/* Waypoints */}
            {[{ x: 0.3, y: 0.4 }, { x: 0.6, y: 0.25 }, { x: 0.75, y: 0.5 }].map((p, i) => (
              <div key={i} style={{ position: 'absolute', left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: 6, height: 6, borderRadius: '50%', background: '#5ac8fa', boxShadow: '0 0 8px rgba(90,200,250,0.5)' }} />
            ))}
            {/* Top labels */}
            <div style={{ position: 'absolute', top: 8, left: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>SPD {Math.round(instruments.speed)}</div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>ALT {Math.round(instruments.altitude).toLocaleString()}</div>
            </div>
            <div style={{ position: 'absolute', top: 8, right: 16, fontSize: 11, color: '#ff9500', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>HDG {String(Math.round(instruments.heading)).padStart(3, '0')}°</div>
            <div style={{ position: 'absolute', bottom: 8, left: 16, fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>{flight?.from}</div>
            <div style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 10, color: '#5ac8fa', fontFamily: 'var(--font-mono)' }}>{flight?.to}</div>
          </div>
        </div>

      </div>
    </div>
  )
}
