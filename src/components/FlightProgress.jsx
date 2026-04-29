import { useState, useEffect, useRef } from 'react'

// Approximate lat/lng for our airports
const AIRPORT_COORDS = {
  LHR: [51.47, -0.45], JFK: [40.64, -73.78], DXB: [25.25, 55.36],
  IST: [40.98, 28.81], JED: [21.68, 39.16], MAN: [53.35, -2.27],
  AGA: [30.32, -9.41], SIN: [1.36, 103.99], SYD: [-33.94, 151.18],
  CDG: [49.01, 2.55], LAX: [33.94, -118.41], DOH: [25.27, 51.62],
  HND: [35.55, 139.78],
}

export default function FlightProgress({ flight, musicPlaying }) {
  const [progress, setProgress] = useState(0) // 0 to 1
  const [paused, setPaused] = useState(false)
  const [altitude, setAltitude] = useState(0)
  const [speed, setSpeed] = useState(0)

  // Calculate flight stats based on progress
  useEffect(() => {
    // Climb to cruise altitude in first 15%, descend in last 15%
    let alt = 0
    if (progress < 0.15) alt = (progress / 0.15) * 38000
    else if (progress > 0.85) alt = ((1 - progress) / 0.15) * 38000
    else alt = 38000

    let spd = 0
    if (progress < 0.1) spd = (progress / 0.1) * 580
    else if (progress > 0.9) spd = ((1 - progress) / 0.1) * 580
    else spd = 580

    setAltitude(alt)
    setSpeed(spd)
  }, [progress])

  useEffect(() => {
    if (paused || !flight) return
    const iv = setInterval(() => {
      setProgress(p => Math.min(p + 0.0008, 1))
    }, 1000)
    return () => clearInterval(iv)
  }, [paused, flight])

  if (!flight) return null

  const fromCoord = AIRPORT_COORDS[flight.from] || [0, 0]
  const toCoord = AIRPORT_COORDS[flight.to] || [0, 0]

  // Estimated time remaining
  const totalSecs = parseDuration(flight.duration)
  const remainingSecs = Math.max(0, Math.round(totalSecs * (1 - progress)))
  const remainHrs = Math.floor(remainingSecs / 3600)
  const remainMin = Math.floor((remainingSecs % 3600) / 60)

  const distanceCovered = Math.round(flight.distance * progress)
  const distanceRemaining = flight.distance - distanceCovered

  // Phase
  let phase = 'Boarding'
  if (progress > 0 && progress < 0.05) phase = 'Takeoff'
  else if (progress < 0.15) phase = 'Climbing'
  else if (progress < 0.85) phase = 'Cruising'
  else if (progress < 0.95) phase = 'Descending'
  else if (progress >= 1) phase = 'Landed'
  else if (progress >= 0.95) phase = 'Approach'

  return (
    <div className="glass" style={{
      borderRadius: 'var(--radius-lg)',
      padding: 22,
      boxShadow: 'var(--shadow-card)',
      border: '0.5px solid var(--border-hairline)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Top row: airports + progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>From</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{flight.from}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{flight.fromCity}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{flight.dep}</div>
        </div>

        <div style={{ flex: 1, padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{phase}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {progress >= 1 ? 'Arrived' : `${remainHrs}h ${remainMin}m left`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
            {flight.code}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>To</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{flight.to}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{flight.toCity}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{flight.arr}</div>
        </div>
      </div>

      {/* Arc with plane */}
      <FlightArc progress={progress} musicPlaying={musicPlaying} />

      {/* Bottom row: live stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
        <Stat label="Altitude" value={Math.round(altitude).toLocaleString()} unit="ft" color="#5ac8fa" />
        <Stat label="Speed" value={Math.round(speed)} unit="kts" color="#0071e3" />
        <Stat label="Covered" value={distanceCovered.toLocaleString()} unit="km" color="#34c759" />
        <Stat label="Remaining" value={distanceRemaining.toLocaleString()} unit="km" color="#af52de" />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        <button onClick={() => setProgress(0)} style={{
          background: 'var(--bg-inset)', color: 'var(--text-secondary)',
          border: 'none', borderRadius: 'var(--radius-full)',
          padding: '7px 14px', fontSize: 12, cursor: 'pointer',
        }}>↺ Reset flight</button>
        <button onClick={() => setPaused(p => !p)} style={{
          background: paused ? 'var(--accent)' : 'var(--bg-inset)',
          color: paused ? 'white' : 'var(--text-secondary)',
          border: 'none', borderRadius: 'var(--radius-full)',
          padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
        }}>{paused ? '▶ Resume' : '⏸ Pause'}</button>
        <button onClick={() => setProgress(p => Math.min(p + 0.1, 1))} style={{
          background: 'var(--bg-inset)', color: 'var(--text-secondary)',
          border: 'none', borderRadius: 'var(--radius-full)',
          padding: '7px 14px', fontSize: 12, cursor: 'pointer',
        }}>+10% »</button>
      </div>
    </div>
  )
}

function FlightArc({ progress }) {
  const w = 720
  const h = 100
  // Arc path
  const startX = 40
  const endX = w - 40
  const peakY = 18
  const baseY = h - 20

  const planeX = startX + (endX - startX) * progress
  // Quadratic bezier — arc tangent for plane angle
  const t = progress
  const arcY = baseY + (peakY - baseY) * (4 * t * (1 - t))

  // Approximate rotation along arc
  const dy = (peakY - baseY) * 4 * (1 - 2 * t)
  const dx = endX - startX
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return (
    <div style={{ position: 'relative', width: '100%', height: 100 }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: '100%' }}>
        {/* Track behind */}
        <path d={`M ${startX} ${baseY} Q ${(startX + endX) / 2} ${peakY} ${endX} ${baseY}`}
          fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 4" />
        {/* Track covered */}
        <path d={`M ${startX} ${baseY} Q ${(startX + endX) / 2} ${peakY} ${endX} ${baseY}`}
          fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"
          strokeDasharray={`${progress * 800} 800`}
          style={{ transition: 'stroke-dasharray 0.5s var(--ease-smooth)' }} />

        {/* Origin */}
        <circle cx={startX} cy={baseY} r="6" fill="var(--bg-card-solid)" stroke="var(--accent)" strokeWidth="2" />
        <circle cx={startX} cy={baseY} r="3" fill="var(--accent)" />
        {/* Destination */}
        <circle cx={endX} cy={baseY} r="6" fill="var(--bg-card-solid)" stroke={progress >= 1 ? 'var(--green)' : 'var(--border-strong)'} strokeWidth="2" />
        <circle cx={endX} cy={baseY} r="3" fill={progress >= 1 ? 'var(--green)' : 'var(--text-tertiary)'} />

        {/* Plane */}
        <g transform={`translate(${planeX}, ${arcY}) rotate(${angle})`} style={{ transition: 'all 0.5s var(--ease-smooth)' }}>
          <circle cx="0" cy="0" r="14" fill="white" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="0" y="5" textAnchor="middle" fontSize="14">✈</text>
        </g>
      </svg>

      {/* Progress percent */}
      <div style={{
        position: 'absolute',
        left: `${progress * 100}%`,
        top: 0,
        transform: 'translateX(-50%)',
        fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 600,
        background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-xs)', transition: 'left 0.5s var(--ease-smooth)',
      }}>{Math.round(progress * 100)}%</div>
    </div>
  )
}

function Stat({ label, value, unit, color }) {
  return (
    <div style={{ background: 'var(--bg-inset)', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color, letterSpacing: '-0.02em' }}>{value}</span>
        <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{unit}</span>
      </div>
    </div>
  )
}

function parseDuration(str) {
  const match = str.match(/(\d+)h\s*(\d+)?m?/)
  if (!match) return 3600
  const h = parseInt(match[1]) || 0
  const m = parseInt(match[2]) || 0
  return h * 3600 + m * 60
}
