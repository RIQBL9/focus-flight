import { useState, useMemo } from 'react'

const CLASS_CONFIG = {
  first: { rows: [1, 2], color: '#af52de', label: 'First Class', bg: '#f5e8fc', price: '£8,400', seatPrice: '£0' },
  business: { rows: [3, 4, 5, 6], color: '#0071e3', label: 'Business', bg: '#e8f1fb', price: '£3,200', seatPrice: '£0' },
  economy: { rows: Array.from({ length: 18 }, (_, i) => i + 7), color: '#34c759', label: 'Economy', bg: '#e8f8ec', price: '£580', seatPrice: '£0' },
  extra: { rows: [], color: '#ff9500', label: 'Extra Legroom', bg: '#fff4e0', seatPrice: '£24' },
}

// Deterministic seed from flight code so seat occupancy is stable per flight
function seededRandom(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function generateSeats(flightCode = 'DEFAULT') {
  const rng = seededRandom(flightCode)
  const seats = {}
  const extraLegroomRows = [7, 14] // Exit rows
  Object.entries(CLASS_CONFIG).forEach(([cls, cfg]) => {
    if (cls === 'extra') return
    cfg.rows.forEach(row => {
      const cols = cls === 'first' ? ['A', 'B', 'D', 'E'] : ['A', 'B', 'C', 'D', 'E', 'F']
      cols.forEach(col => {
        const id = `${row}${col}`
        const isExtra = extraLegroomRows.includes(row) && cls === 'economy'
        seats[id] = {
          id, row, col, class: isExtra ? 'extra' : cls,
          baseClass: cls,
          occupied: rng() < (cls === 'economy' ? 0.55 : cls === 'business' ? 0.40 : 0.30),
          window: col === 'A' || col === (cls === 'first' ? 'E' : 'F'),
          aisle: cls === 'first' ? col === 'B' || col === 'D' : col === 'C' || col === 'D',
          extraLegroom: isExtra,
        }
      })
    })
  })
  return seats
}

export default function SeatMap({ flight, selectedSeat, onSelect, onNext, onBack }) {
  const seats = useMemo(() => generateSeats(flight?.code), [flight?.code])
  const [hoveredSeat, setHoveredSeat] = useState(null)
  const [filter, setFilter] = useState('all')

  const seatCols_first = ['A', 'B', '', 'D', 'E']
  const seatCols_std = ['A', 'B', 'C', '', 'D', 'E', 'F']

  const stats = useMemo(() => {
    const total = Object.keys(seats).length
    const free = Object.values(seats).filter(s => !s.occupied).length
    const window = Object.values(seats).filter(s => !s.occupied && s.window).length
    const aisle = Object.values(seats).filter(s => !s.occupied && s.aisle).length
    return { total, free, window, aisle }
  }, [seats])

  const renderRow = (row, cls) => {
    const cols = cls === 'first' ? seatCols_first : seatCols_std
    const cfg = CLASS_CONFIG[cls]
    const isExitRow = [7, 14].includes(row)

    return (
      <div key={`${row}-${cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: cls === 'first' ? 6 : 4 }}>
        <div style={{ width: 24, textAlign: 'right', fontSize: 10, color: isExitRow ? 'var(--orange)' : 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontWeight: isExitRow ? 600 : 400 }}>{row}</div>
        <div style={{ display: 'flex', gap: 3, flex: 1, justifyContent: 'center' }}>
          {cols.map((col, i) => {
            if (!col) return <div key={`aisle-${i}`} style={{ width: cls === 'first' ? 22 : 16 }} />
            const id = `${row}${col}`
            const seat = seats[id]
            if (!seat) return null
            const isSelected = selectedSeat === id
            const isOccupied = seat.occupied
            const isHovered = hoveredSeat === id
            const seatClass = seat.class
            const seatCfg = CLASS_CONFIG[seatClass]

            const passFilter = filter === 'all' ||
              (filter === 'window' && seat.window) ||
              (filter === 'aisle' && seat.aisle) ||
              (filter === 'extra' && seat.extraLegroom)

            return (
              <div key={id}
                onClick={() => !isOccupied && onSelect(id)}
                onMouseEnter={() => setHoveredSeat(id)}
                onMouseLeave={() => setHoveredSeat(null)}
                style={{
                  width: cls === 'first' ? 34 : 26,
                  height: cls === 'first' ? 38 : 28,
                  borderRadius: cls === 'first' ? 6 : 4,
                  background: isOccupied ? 'var(--bg-inset)' :
                    isSelected ? seatCfg.color :
                    !passFilter ? 'var(--bg-inset)' :
                    isHovered ? seatCfg.bg : seatCfg.bg + '80',
                  border: `1.5px solid ${
                    isOccupied ? 'var(--border)' :
                    isSelected ? seatCfg.color :
                    !passFilter ? 'var(--border)' :
                    seatCfg.color + '60'
                  }`,
                  cursor: isOccupied ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s var(--ease-spring)',
                  position: 'relative',
                  opacity: !passFilter && !isSelected ? 0.3 : 1,
                  boxShadow: isSelected ? `0 4px 12px ${seatCfg.color}55` : 'none',
                  transform: isSelected ? 'scale(1.12)' : isHovered && !isOccupied ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                {isOccupied && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'var(--text-quaternary)', fontSize: 12, fontWeight: 600 }}>✕</span>
                  </div>
                )}
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700 }}>✓</div>
                )}
                {!isOccupied && !isSelected && seat.extraLegroom && (
                  <div style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: 'var(--orange)' }} />
                )}
              </div>
            )
          })}
        </div>
        {isExitRow && <div style={{ fontSize: 9, color: 'var(--orange)', fontWeight: 600, minWidth: 28 }}>EXIT</div>}
      </div>
    )
  }

  return (
    <div style={{ animation: 'slideIn 0.3s var(--ease-smooth) both' }}>
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{flight.aircraft}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1 }}>Pick Your Seat</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{flight.from} → {flight.to} · {stats.free} of {stats.total} seats available</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 240px', gap: 18, alignItems: 'start' }}>

        {/* Left: legend + filters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Card title="Cabin Classes">
            {Object.entries(CLASS_CONFIG).filter(([k]) => k !== 'extra').map(([cls, cfg]) => (
              <div key={cls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '0.5px solid var(--border-hairline)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: cfg.bg, border: `1.5px solid ${cfg.color}` }} />
                  <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{cfg.label}</span>
                </div>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{cfg.price}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: CLASS_CONFIG.extra.bg, border: `1.5px solid ${CLASS_CONFIG.extra.color}` }} />
              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>Extra legroom</span>
            </div>
          </Card>

          <Card title="Filter">
            {[['all', 'All', '·'], ['window', 'Window', '🪟'], ['aisle', 'Aisle', '🚶'], ['extra', 'Extra legroom', '✨']].map(([val, label, icon]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                padding: '7px 10px', borderRadius: 'var(--radius-sm)', marginBottom: 4,
                background: filter === val ? 'var(--accent-light)' : 'transparent',
                color: filter === val ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: filter === val ? 500 : 400,
                border: 'none', cursor: 'pointer',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  {label}
                </span>
                {filter === val && <span style={{ fontSize: 11 }}>✓</span>}
              </button>
            ))}
          </Card>

          <Card title="Available">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Stat label="Window" value={stats.window} />
              <Stat label="Aisle" value={stats.aisle} />
            </div>
          </Card>
        </div>

        {/* Center: seat map */}
        <div className="glass" style={{
          borderRadius: 'var(--radius-2xl)',
          padding: '28px 20px',
          boxShadow: 'var(--shadow-md)',
          border: '0.5px solid var(--border-hairline)',
          maxWidth: 380, margin: '0 auto', width: '100%',
        }}>
          {/* Nose */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{ display: 'inline-block', width: 80, height: 40, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', background: 'var(--bg-inset)', border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, borderRadius: '50%', background: 'rgba(0,0,0,0.06)' }} />
            </div>
          </div>

          <SectionLabel label="First Class" color={CLASS_CONFIG.first.color} />
          {CLASS_CONFIG.first.rows.map(r => renderRow(r, 'first'))}

          <Divider label="Business" />
          {CLASS_CONFIG.business.rows.map(r => renderRow(r, 'business'))}

          <Divider label="Economy" />
          {CLASS_CONFIG.economy.rows.map(r => renderRow(r, 'economy'))}

          {/* Tail */}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ display: 'inline-block', width: 50, height: 24, borderRadius: '0 0 50% 50% / 0 0 100% 100%', background: 'var(--bg-inset)', border: '1px solid var(--border)' }} />
          </div>
        </div>

        {/* Right: seat info + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hoveredSeat && !seats[hoveredSeat]?.occupied && hoveredSeat !== selectedSeat && (
            <Card style={{ animation: 'fadeIn 0.15s ease' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Preview</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>{hoveredSeat}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {[
                  seats[hoveredSeat]?.window && '🪟 Window',
                  seats[hoveredSeat]?.aisle && '🚶 Aisle',
                  seats[hoveredSeat]?.extraLegroom && '✨ Extra legroom',
                  CLASS_CONFIG[seats[hoveredSeat]?.baseClass]?.label,
                ].filter(Boolean).map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-inset)', color: 'var(--text-secondary)' }}>{tag}</span>
                ))}
              </div>
            </Card>
          )}

          {selectedSeat ? (
            <Card style={{ borderColor: 'var(--accent)', borderWidth: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Your seat</div>
              <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em', color: CLASS_CONFIG[seats[selectedSeat]?.baseClass]?.color, lineHeight: 1, marginBottom: 8 }}>{selectedSeat}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 500 }}>
                {seats[selectedSeat]?.window ? '🪟 Window seat' : seats[selectedSeat]?.aisle ? '🚶 Aisle seat' : '💺 Middle seat'}
                {seats[selectedSeat]?.extraLegroom && ' · Extra legroom'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{CLASS_CONFIG[seats[selectedSeat]?.baseClass]?.label}</div>
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <div style={{ fontSize: 32, marginBottom: 6 }}>💺</div>
              <div style={{ fontSize: 13 }}>Tap a seat to select</div>
            </Card>
          )}

          <button onClick={onNext} disabled={!selectedSeat} style={{
            background: selectedSeat ? 'var(--text-primary)' : 'var(--bg-inset)',
            color: selectedSeat ? 'white' : 'var(--text-tertiary)',
            border: 'none', borderRadius: 'var(--radius-full)',
            padding: '13px 20px', fontSize: 14, fontWeight: 500,
            cursor: selectedSeat ? 'pointer' : 'not-allowed',
            boxShadow: selectedSeat ? '0 4px 16px rgba(0,0,0,0.15)' : 'none',
          }}>Get Boarding Pass →</button>
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 13, padding: '8px', cursor: 'pointer' }}>← Change flight</button>
        </div>
      </div>
    </div>
  )
}

function Card({ title, children, style }) {
  return (
    <div className="glass" style={{
      borderRadius: 'var(--radius-lg)',
      padding: 14,
      boxShadow: 'var(--shadow-card)',
      border: '0.5px solid var(--border-hairline)',
      ...style,
    }}>
      {title && <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>}
      {children}
    </div>
  )
}

function SectionLabel({ label, color }) {
  return (
    <div style={{ fontSize: 10, textAlign: 'center', color: 'var(--text-tertiary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>
      {label}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div style={{ borderTop: '1.5px dashed var(--border)', margin: '14px 0 10px', position: 'relative' }}>
      <span style={{ position: 'absolute', left: '50%', top: -8, transform: 'translateX(-50%)', background: 'var(--bg-elevated)', padding: '0 8px', fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{label}</span>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ background: 'var(--bg-inset)', borderRadius: 'var(--radius-sm)', padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}
