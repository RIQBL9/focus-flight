import { useState } from 'react'

function Barcode() {
  const bars = Array.from({ length: 50 }, () => ({
    width: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
    gap: Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1,
  }))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: 44, gap: 0, padding: '0 2px' }}>
      {bars.map((bar, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: bar.gap + 'px' }}>
          <div style={{ width: bar.width, height: i % 5 === 0 ? 44 : 36, background: '#1d1d1f', borderRadius: 0.5 }} />
        </div>
      ))}
    </div>
  )
}

function QRCode({ size = 64 }) {
  // Pseudo QR pattern - decorative
  const grid = []
  for (let i = 0; i < 9; i++) {
    const row = []
    for (let j = 0; j < 9; j++) {
      const isCorner = (i < 3 && j < 3) || (i < 3 && j > 5) || (i > 5 && j < 3)
      const isCornerInner = (i === 1 && j === 1) || (i === 1 && j === 7) || (i === 7 && j === 1)
      row.push(isCorner ? (isCornerInner ? 0 : 1) : Math.random() > 0.5 ? 1 : 0)
    }
    grid.push(row)
  }
  const cell = size / 9
  return (
    <svg width={size} height={size}>
      {grid.flatMap((row, i) => row.map((v, j) => v ? <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell} fill="#1d1d1f" /> : null))}
    </svg>
  )
}

export default function BoardingPass({ flight, seat, passengerName, onBack }) {
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => { setScanning(false); setScanned(true) }, 1800)
  }

  const seatNum = seat ? parseInt(seat) : 7
  const seatClass = seatNum <= 2 ? 'First' : seatNum <= 6 ? 'Business' : 'Economy'
  const classColor = seatNum <= 2 ? '#af52de' : seatNum <= 6 ? '#0071e3' : '#34c759'
  const sequence = `00${Math.floor((seat?.charCodeAt(0) || 65) * 1.7)}`.slice(-3)

  return (
    <div style={{ animation: 'fadeUp 0.4s var(--ease-smooth) both', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{scanned ? 'Boarded' : 'Final Step'}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', letterSpacing: '-0.03em', marginBottom: 4, lineHeight: 1 }}>
          {scanned ? 'Have a great flight' : 'Your Boarding Pass'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {scanned ? 'Switch to Study Mode to begin your session' : 'Scan to board your study session'}
        </p>
      </div>

      {/* Pass card */}
      <div style={{
        width: '100%', maxWidth: 580,
        background: 'white',
        borderRadius: 'var(--radius-2xl)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {scanning && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'linear-gradient(rgba(52,199,89,0.18), rgba(52,199,89,0))',
            animation: 'boardingScan 1.8s ease forwards',
            transformOrigin: 'left',
            pointerEvents: 'none',
          }} />
        )}

        {/* Top: airline strip */}
        <div style={{ background: classColor, padding: '22px 28px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Boarding Pass · {seatClass} Class</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 2, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{passengerName || 'Passenger'}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.7 }}>{flight?.code} · {flight?.aircraft}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Gate</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{flight?.gate}</div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div style={{ padding: '26px 28px', borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>{flight?.from}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{flight?.fromCity}</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>{flight?.duration}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: classColor }} />
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                <span style={{ color: classColor, fontSize: 16 }}>✈</span>
                <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: classColor }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>{flight?.distance?.toLocaleString()} km · {flight?.tz}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1 }}>{flight?.to}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{flight?.toCity}</div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: '18px 28px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderBottom: '1px dashed rgba(0,0,0,0.1)' }}>
          {[
            { label: 'Departs', value: flight?.dep },
            { label: 'Arrives', value: flight?.arr },
            { label: 'Seat', value: seat || '—' },
            { label: 'Terminal', value: flight?.terminal },
            { label: 'Sequence', value: sequence },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Tear line */}
        <div style={{ position: 'relative', height: 24, background: 'white' }}>
          <div style={{ position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)' }} />
          <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: 'var(--bg)' }} />
          <div style={{ position: 'absolute', left: 12, right: 12, top: '50%', borderTop: '1.5px dashed rgba(0,0,0,0.12)' }} />
        </div>

        {/* Barcode + QR + seat */}
        <div style={{ padding: '20px 28px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <Barcode />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)', marginTop: 8, letterSpacing: '0.15em' }}>
              {flight?.code}-{seat || 'XX'}-{passengerName?.replace(/\s/g, '').toUpperCase().slice(0, 6) || 'PSGR'}-{sequence}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <QRCode size={56} />
            <div style={{
              width: 70, height: 70, borderRadius: 14,
              background: scanned ? 'var(--green-light)' : `${classColor}15`,
              border: `2px solid ${scanned ? 'var(--green)' : classColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 8, color: scanned ? 'var(--green)' : classColor, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Seat</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: scanned ? 'var(--green)' : classColor, lineHeight: 1, marginTop: 2 }}>{seat || '—'}</div>
            </div>
          </div>
        </div>

        {scanned && (
          <div style={{
            position: 'absolute', top: 60, right: 24,
            border: '3px solid var(--green)', borderRadius: 8,
            padding: '7px 14px', transform: 'rotate(-8deg)',
            background: 'rgba(255,255,255,0.95)',
            animation: 'stampIn 0.5s var(--ease-spring) both',
            zIndex: 5,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>BOARDED</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onBack} style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          color: 'var(--text-secondary)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          padding: '12px 22px', fontSize: 14, fontWeight: 500,
        }}>← Change seat</button>
        {!scanned ? (
          <button onClick={handleScan} disabled={scanning || !seat} style={{
            background: scanning ? 'var(--orange)' : !seat ? 'var(--bg-inset)' : 'var(--text-primary)',
            color: !seat ? 'var(--text-tertiary)' : 'white',
            border: 'none', borderRadius: 'var(--radius-full)',
            padding: '12px 32px', fontSize: 15, fontWeight: 500,
            boxShadow: !seat ? 'none' : '0 4px 16px rgba(0,0,0,0.2)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            cursor: !seat ? 'not-allowed' : 'pointer',
          }}>
            {scanning ? (
              <><span style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>⟳</span> Scanning...</>
            ) : '📱 Scan to Board'}
          </button>
        ) : (
          <div style={{ background: 'var(--green-light)', color: 'var(--green)', border: '0.5px solid var(--green)', borderRadius: 'var(--radius-full)', padding: '12px 22px', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ✓ Ready for takeoff
          </div>
        )}
      </div>
    </div>
  )
}
