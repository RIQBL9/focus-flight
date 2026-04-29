import { useState, useEffect, useRef } from 'react'
import BoardingPass from './components/BoardingPass.jsx'
import SeatMap from './components/SeatMap.jsx'
import FlightDeck from './components/FlightDeck.jsx'
import MusicPlayer from './components/MusicPlayer.jsx'
import StudyTimer from './components/StudyTimer.jsx'
import TaskLog from './components/TaskLog.jsx'
import FlightProgress from './components/FlightProgress.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'

export const FLIGHTS = [
  { code:'BA0117', from:'LHR', fromCity:'London', to:'JFK', toCity:'New York', dep:'08:45', arr:'11:30', duration:'7h 45m', distance:5541, aircraft:'Boeing 777', gate:'B22', terminal:'5', tz:'-5h' },
  { code:'TK1986', from:'IST', fromCity:'Istanbul', to:'JED', toCity:'Jeddah', dep:'02:15', arr:'05:50', duration:'3h 35m', distance:2562, aircraft:'Airbus A321', gate:'A18', terminal:'1', tz:'+0h' },
  { code:'EK0001', from:'DXB', fromCity:'Dubai', to:'LHR', toCity:'London', dep:'14:20', arr:'18:55', duration:'7h 35m', distance:5495, aircraft:'Airbus A380', gate:'A14', terminal:'3', tz:'-3h' },
  { code:'TK1985', from:'MAN', fromCity:'Manchester', to:'IST', toCity:'Istanbul', dep:'09:35', arr:'15:25', duration:'3h 50m', distance:2738, aircraft:'Boeing 737', gate:'D21', terminal:'2', tz:'+2h' },
  { code:'SV0124', from:'JED', fromCity:'Jeddah', to:'AGA', toCity:'Agadir', dep:'11:05', arr:'15:30', duration:'7h 25m', distance:5102, aircraft:'Airbus A330', gate:'C12', terminal:'1', tz:'-3h' },
  { code:'RAM0801', from:'AGA', fromCity:'Agadir', to:'MAN', toCity:'Manchester', dep:'07:40', arr:'12:55', duration:'4h 15m', distance:2235, aircraft:'Boeing 737', gate:'B05', terminal:'1', tz:'+0h' },
  { code:'SQ0317', from:'SIN', fromCity:'Singapore', to:'SYD', toCity:'Sydney', dep:'23:55', arr:'09:40', duration:'7h 45m', distance:6306, aircraft:'Boeing 787', gate:'C08', terminal:'1', tz:'+2h' },
  { code:'AF0084', from:'CDG', fromCity:'Paris', to:'LAX', toCity:'Los Angeles', dep:'11:10', arr:'13:25', duration:'11h 15m', distance:9085, aircraft:'Airbus A350', gate:'F32', terminal:'2E', tz:'-9h' },
  { code:'QR0001', from:'DOH', fromCity:'Doha', to:'HND', toCity:'Tokyo', dep:'02:30', arr:'17:15', duration:'9h 45m', distance:8113, aircraft:'Boeing 777X', gate:'D01', terminal:'Hamad', tz:'+6h' },
]

export default function App() {
  const [view, setView] = useLocalStorage('ff-view', 'boarding')
  const [selectedFlightCode, setSelectedFlightCode] = useLocalStorage('ff-flight', FLIGHTS[3].code)
  const [selectedSeat, setSelectedSeat] = useLocalStorage('ff-seat', null)
  const [passengerName, setPassengerName] = useLocalStorage('ff-name', 'Rayan')
  const [musicPlaying, setMusicPlaying] = useState(false)
  const [boardingProgress, setBoardingProgress] = useLocalStorage('ff-progress', 1)

  const selectedFlight = FLIGHTS.find(f => f.code === selectedFlightCode) || FLIGHTS[0]
  const setSelectedFlight = f => setSelectedFlightCode(f.code)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <Header view={view} setView={setView} />

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '0 20px' }}>
        {view === 'boarding' && (
          <BoardingView
            flights={FLIGHTS}
            selectedFlight={selectedFlight}
            setSelectedFlight={setSelectedFlight}
            selectedSeat={selectedSeat}
            setSelectedSeat={setSelectedSeat}
            passengerName={passengerName}
            setPassengerName={setPassengerName}
            boardingProgress={boardingProgress}
            setBoardingProgress={setBoardingProgress}
          />
        )}
        {view === 'cockpit' && <FlightDeck flight={selectedFlight} />}
        {view === 'focus' && (
          <FocusView flight={selectedFlight} seat={selectedSeat} passengerName={passengerName} musicPlaying={musicPlaying} />
        )}
      </main>

      <MusicPlayer playing={musicPlaying} setPlaying={setMusicPlaying} />
    </div>
  )
}

function Header({ view, setView }) {
  const tabs = [
    { id: 'boarding', label: 'Boarding', icon: '🎫' },
    { id: 'cockpit', label: 'Flight Deck', icon: '🛩️' },
    { id: 'focus', label: 'Study', icon: '📚' },
  ]

  return (
    <header style={{
      background: 'rgba(245,245,247,0.8)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '0.5px solid var(--border-hairline)',
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0 20px',
    }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #0071e3, #5856d6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 2px 8px rgba(0,113,227,0.3)',
          }}>✈️</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>FocusFlight</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Study at altitude</div>
          </div>
        </div>

        <nav style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-full)', padding: 3, gap: 2 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setView(t.id)} style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: view === t.id ? 500 : 400,
              background: view === t.id ? 'white' : 'transparent',
              color: view === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: view === t.id ? 'var(--shadow-sm)' : 'none',
              display: 'flex', alignItems: 'center', gap: 6,
              border: 'none',
            }}>
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'blink 2s infinite' }} />
          ON TIME
        </div>
      </div>
    </header>
  )
}

function BoardingView({ flights, selectedFlight, setSelectedFlight, selectedSeat, setSelectedSeat, passengerName, setPassengerName, boardingProgress, setBoardingProgress }) {
  const [step, setStep] = useState(Math.max(boardingProgress, 1))

  const goToStep = s => {
    setStep(s)
    setBoardingProgress(Math.max(boardingProgress, s))
  }

  return (
    <div style={{ paddingTop: 32, animation: 'fadeUp 0.4s var(--ease-smooth) both' }}>
      <ProgressBar step={step} setStep={goToStep} maxStep={boardingProgress} />

      {step === 1 && (
        <FlightPicker
          flights={flights}
          selected={selectedFlight}
          onSelect={f => { setSelectedFlight(f); setSelectedSeat(null); setBoardingProgress(1) }}
          passengerName={passengerName}
          setPassengerName={setPassengerName}
          onNext={() => goToStep(2)}
        />
      )}
      {step === 2 && (
        <SeatMap flight={selectedFlight} selectedSeat={selectedSeat} onSelect={setSelectedSeat} onNext={() => goToStep(3)} onBack={() => goToStep(1)} />
      )}
      {step === 3 && (
        <BoardingPass flight={selectedFlight} seat={selectedSeat} passengerName={passengerName} onBack={() => goToStep(2)} />
      )}
    </div>
  )
}

function ProgressBar({ step, setStep, maxStep }) {
  const steps = [{ n: 1, label: 'Flight' }, { n: 2, label: 'Seat' }, { n: 3, label: 'Board' }]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36 }}>
      {steps.map((s, i) => (
        <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => maxStep >= s.n && setStep(s.n)}
            disabled={maxStep < s.n}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
              background: step === s.n ? 'var(--accent)' : maxStep >= s.n ? 'white' : 'transparent',
              color: step === s.n ? 'white' : maxStep >= s.n ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: '0.5px solid',
              borderColor: step === s.n ? 'var(--accent)' : 'var(--border)',
              cursor: maxStep >= s.n ? 'pointer' : 'not-allowed',
              fontSize: 13, fontWeight: 500,
              boxShadow: step === s.n ? '0 2px 8px rgba(0,113,227,0.25)' : 'var(--shadow-xs)',
            }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: step === s.n ? 'rgba(255,255,255,0.25)' : 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.n}</span>
            <span>{s.label}</span>
          </button>
          {i < 2 && <div style={{ width: 32, height: 1, background: maxStep > s.n ? 'var(--accent)' : 'var(--border)', margin: '0 6px', transition: 'background 0.3s' }} />}
        </div>
      ))}
    </div>
  )
}

function FlightPicker({ flights, selected, onSelect, passengerName, setPassengerName, onNext }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)
  const [search, setSearch] = useState('')

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const filtered = flights.filter(f => {
    const q = search.toLowerCase()
    return !q || f.from.toLowerCase().includes(q) || f.to.toLowerCase().includes(q) ||
      f.fromCity.toLowerCase().includes(q) || f.toCity.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
          Welcome aboard, {passengerName}
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontStyle: 'italic', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 8 }}>
          Choose Your Flight
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
          Pick a destination and take off into a focused study session.
        </p>
      </div>

      {/* Passenger card + search */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="glass" style={{ borderRadius: 'var(--radius-full)', padding: '8px 16px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
            {passengerName?.[0]?.toUpperCase() || '?'}
          </div>
          {editing ? (
            <input ref={inputRef} value={passengerName} onChange={e => setPassengerName(e.target.value)}
              onBlur={() => setEditing(false)} onKeyDown={e => e.key === 'Enter' && setEditing(false)}
              style={{ border: 'none', background: 'transparent', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', width: 120 }} />
          ) : (
            <button onClick={() => setEditing(true)} style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', padding: 0 }}>
              {passengerName} <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>edit</span>
            </button>
          )}
        </div>

        <div className="glass" style={{ borderRadius: 'var(--radius-full)', padding: '8px 16px', boxShadow: 'var(--shadow-card)', display: 'flex', alignItems: 'center', gap: 8, minWidth: 220 }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search city, code, route..."
            style={{ border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', flex: 1 }}
          />
        </div>
      </div>

      {/* Flight cards */}
      <div style={{ display: 'grid', gap: 10, marginBottom: 32 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 14 }}>No flights match "{search}"</div>
        )}
        {filtered.map((f, i) => (
          <FlightCard key={f.code} flight={f} selected={selected?.code === f.code} onSelect={onSelect} delay={i * 30} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={onNext} style={{
          background: 'var(--text-primary)', color: 'white', border: 'none',
          borderRadius: 'var(--radius-full)', padding: '14px 40px',
          fontSize: 15, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>Choose your seat <span>→</span></button>
      </div>
    </div>
  )
}

function FlightCard({ flight, selected, onSelect, delay = 0 }) {
  return (
    <div onClick={() => onSelect(flight)} style={{
      background: selected ? 'var(--text-primary)' : 'var(--bg-card)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 22px',
      boxShadow: selected ? '0 8px 24px rgba(0,0,0,0.15)' : 'var(--shadow-card)',
      cursor: 'pointer',
      border: `1.5px solid ${selected ? 'var(--text-primary)' : 'transparent'}`,
      display: 'flex', alignItems: 'center', gap: 20,
      transform: selected ? 'translateY(-1px)' : 'translateY(0)',
      animation: `fadeUp 0.4s var(--ease-smooth) ${delay}ms both`,
      transition: 'all 0.25s var(--ease-smooth)',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'center', minWidth: 64 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: selected ? 'white' : 'var(--text-primary)', letterSpacing: '-0.03em' }}>{flight.from}</div>
          <div style={{ fontSize: 11, color: selected ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)', marginTop: 1 }}>{flight.fromCity}</div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ fontSize: 11, color: selected ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)' }}>{flight.duration}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: selected ? 'rgba(255,255,255,0.4)' : 'var(--border-strong)' }} />
            <div style={{ height: 1, flex: 1, background: selected ? 'rgba(255,255,255,0.3)' : 'var(--border)' }} />
            <span style={{ color: selected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', fontSize: 13 }}>✈</span>
            <div style={{ height: 1, flex: 1, background: selected ? 'rgba(255,255,255,0.3)' : 'var(--border)' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: selected ? 'rgba(255,255,255,0.4)' : 'var(--border-strong)' }} />
          </div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: selected ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)' }}>{flight.code} · {flight.distance.toLocaleString()} km</div>
        </div>

        <div style={{ textAlign: 'center', minWidth: 64 }}>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: selected ? 'white' : 'var(--text-primary)', letterSpacing: '-0.03em' }}>{flight.to}</div>
          <div style={{ fontSize: 11, color: selected ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)', marginTop: 1 }}>{flight.toCity}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, borderLeft: `1px solid ${selected ? 'rgba(255,255,255,0.15)' : 'var(--border)'}`, paddingLeft: 20 }}>
        <Stat label="DEP" value={flight.dep} selected={selected} />
        <Stat label="ARR" value={flight.arr} selected={selected} />
        <Stat label="GATE" value={flight.gate} selected={selected} />
      </div>

      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: selected ? 'white' : 'transparent',
        border: `1.5px solid ${selected ? 'white' : 'var(--border-strong)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {selected && <span style={{ color: 'var(--text-primary)', fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
    </div>
  )
}

function Stat({ label, value, selected }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 44 }}>
      <div style={{ fontSize: 10, color: selected ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)', marginBottom: 2, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: selected ? 'white' : 'var(--text-primary)' }}>{value}</div>
    </div>
  )
}

function FocusView({ flight, seat, passengerName, musicPlaying }) {
  return (
    <div style={{ paddingTop: 32, animation: 'fadeUp 0.4s var(--ease-smooth) both' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Now Cruising</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', letterSpacing: '-0.03em', marginBottom: 6, lineHeight: 1 }}>
          Study Mode
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          {flight ? `${flight.fromCity} → ${flight.toCity}` : 'Select a flight to begin'} {seat ? `· Seat ${seat}` : ''}
        </p>
      </div>

      <FlightProgress flight={flight} musicPlaying={musicPlaying} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
        <StudyTimer flight={flight} />
        <TaskLog />
      </div>
    </div>
  )
}
