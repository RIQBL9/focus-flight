import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const TRACKS = [
  { title: 'Midnight Departure', bpm: 72, mood: 'Smooth' },
  { title: 'Cloud Nine', bpm: 84, mood: 'Chill' },
  { title: 'Altitude Dreams', bpm: 68, mood: 'Mellow' },
  { title: 'Terminal Haze', bpm: 76, mood: 'Deep' },
  { title: 'First Class', bpm: 90, mood: 'Upbeat' },
]

function createLofiJazz(ctx, bpm, volume) {
  const masterGain = ctx.createGain()
  masterGain.gain.value = volume * 0.6
  masterGain.connect(ctx.destination)

  const reverb = ctx.createConvolver()
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0.25
  const impulseLen = ctx.sampleRate * 2
  const impulse = ctx.createBuffer(2, impulseLen, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = impulse.getChannelData(ch)
    for (let i = 0; i < impulseLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / impulseLen, 2)
  }
  reverb.buffer = impulse
  reverb.connect(reverbGain)
  reverbGain.connect(masterGain)

  const vinylNoise = ctx.createBufferSource()
  const noiseLen = ctx.sampleRate * 4
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
  const nd = noiseBuf.getChannelData(0)
  for (let i = 0; i < noiseLen; i++) nd[i] = (Math.random() * 2 - 1) * 0.015
  vinylNoise.buffer = noiseBuf
  vinylNoise.loop = true
  const vinylFilter = ctx.createBiquadFilter()
  vinylFilter.type = 'bandpass'
  vinylFilter.frequency.value = 2000
  vinylFilter.Q.value = 0.5
  const vinylGain = ctx.createGain()
  vinylGain.gain.value = 0.12
  vinylNoise.connect(vinylFilter)
  vinylFilter.connect(vinylGain)
  vinylGain.connect(masterGain)
  vinylNoise.start()

  const beat = 60 / bpm
  const notes = [261.6, 293.7, 329.6, 349.2, 392, 440, 493.9, 523.3]
  const jazzChords = [
    [261.6, 329.6, 392, 493.9],
    [293.7, 369.9, 440, 554.4],
    [349.2, 440, 523.3, 659.3],
    [329.6, 415.3, 493.9, 587.3],
  ]
  let chordIndex = 0
  const sourceRefs = []

  function playChord(time, chord, duration, gain = 0.06) {
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = i === 0 ? 'triangle' : 'sine'
      osc.frequency.value = freq * (i > 2 ? 0.5 : 1)
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, time)
      g.gain.linearRampToValueAtTime(gain, time + 0.02)
      g.gain.exponentialRampToValueAtTime(gain * 0.3, time + duration * 0.6)
      g.gain.linearRampToValueAtTime(0.0001, time + duration)
      const filt = ctx.createBiquadFilter()
      filt.type = 'lowpass'
      filt.frequency.value = 1800
      osc.connect(filt)
      filt.connect(g)
      g.connect(masterGain)
      g.connect(reverb)
      osc.start(time)
      osc.stop(time + duration + 0.05)
      sourceRefs.push(osc)
    })
  }

  function playMelodyNote(time, freq, duration) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq * 2
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, time)
    g.gain.linearRampToValueAtTime(0.04, time + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, time + duration)
    const filt = ctx.createBiquadFilter()
    filt.type = 'lowpass'
    filt.frequency.value = 2400
    osc.connect(filt)
    filt.connect(g)
    g.connect(masterGain)
    g.connect(reverb)
    osc.start(time)
    osc.stop(time + duration + 0.05)
    sourceRefs.push(osc)
  }

  function playHihat(time, open = false) {
    const bufLen = Math.floor(ctx.sampleRate * (open ? 0.18 : 0.04))
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filt = ctx.createBiquadFilter()
    filt.type = 'highpass'
    filt.frequency.value = 6000
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.08, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + (open ? 0.18 : 0.04))
    src.connect(filt)
    filt.connect(g)
    g.connect(masterGain)
    src.start(time)
    sourceRefs.push(src)
  }

  function playKick(time) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, time)
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.2)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.5, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.25)
    osc.connect(g)
    g.connect(masterGain)
    osc.start(time)
    osc.stop(time + 0.3)
    sourceRefs.push(osc)
  }

  function playSnare(time) {
    const bufLen = Math.floor(ctx.sampleRate * 0.12)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.5)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const filt = ctx.createBiquadFilter()
    filt.type = 'bandpass'
    filt.frequency.value = 1200
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.18, time)
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.12)
    src.connect(filt)
    filt.connect(g)
    g.connect(masterGain)
    src.start(time)
    sourceRefs.push(src)
  }

  const melodyPatterns = [
    [0, 2, 4, 5, 7, 5, 4, 2],
    [4, 5, 7, 9, 7, 5, 4, 2],
    [7, 9, 11, 9, 7, 5, 4, 5],
    [5, 4, 2, 0, 2, 4, 5, 7],
  ]
  let melodyPatternIdx = 0
  let scheduleTime = ctx.currentTime + 0.05
  let barCount = 0

  function schedule() {
    const bar = beat * 4
    const now = ctx.currentTime
    while (scheduleTime < now + 1.5) {
      const t = scheduleTime
      const chord = jazzChords[chordIndex % jazzChords.length]
      playChord(t, chord, bar * 0.9)
      playKick(t)
      playSnare(t + beat * 2)
      playKick(t + beat * 3.5)
      for (let i = 0; i < 8; i++) {
        const swing = i % 2 === 1 ? beat * 0.04 : 0
        playHihat(t + i * beat * 0.5 + swing, i % 4 === 2)
      }
      const pattern = melodyPatterns[melodyPatternIdx % melodyPatterns.length]
      pattern.forEach((noteIdx, i) => {
        if (Math.random() > 0.25) {
          const baseFreq = notes[noteIdx % notes.length]
          playMelodyNote(t + i * (beat * 0.5) + Math.random() * 0.03, baseFreq, beat * 0.45)
        }
      })
      scheduleTime += bar
      barCount++
      if (barCount % 2 === 0) chordIndex++
      if (barCount % 4 === 0) melodyPatternIdx++
    }
  }

  const intervalId = setInterval(schedule, 200)

  return {
    stop: () => {
      clearInterval(intervalId)
      sourceRefs.forEach(s => { try { s.stop() } catch (e) {} })
      try { masterGain.disconnect() } catch (e) {}
    },
    setVolume: v => {
      try { masterGain.gain.setValueAtTime(v * 0.6, ctx.currentTime) } catch (e) {}
    }
  }
}

export default function MusicPlayer({ playing, setPlaying }) {
  const ctxRef = useRef(null)
  const engineRef = useRef(null)
  const [trackIdx, setTrackIdx] = useState(0)
  const [volume, setVolume] = useLocalStorage('ff-volume', 0.7)
  const [elapsed, setElapsed] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (playing) {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
      if (engineRef.current) engineRef.current.stop()
      engineRef.current = createLofiJazz(ctxRef.current, TRACKS[trackIdx].bpm, volume)
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      if (engineRef.current) { engineRef.current.stop(); engineRef.current = null }
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [playing, trackIdx])

  // Update volume without restarting
  useEffect(() => {
    if (engineRef.current) engineRef.current.setVolume(volume)
  }, [volume])

  const nextTrack = () => { setTrackIdx(i => (i + 1) % TRACKS.length); setElapsed(0) }
  const prevTrack = () => { setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length); setElapsed(0) }
  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const track = TRACKS[trackIdx]

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(28,28,30,0.85)',
      backdropFilter: 'saturate(180%) blur(24px)',
      WebkitBackdropFilter: 'saturate(180%) blur(24px)',
      border: '0.5px solid rgba(255,255,255,0.12)',
      borderRadius: 'var(--radius-2xl)',
      padding: expanded ? '14px 20px 18px' : '10px 18px',
      display: 'flex', flexDirection: expanded ? 'column' : 'row', alignItems: expanded ? 'stretch' : 'center', gap: expanded ? 12 : 14,
      boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(0,0,0,0.1)',
      zIndex: 200,
      width: expanded ? 460 : 'auto', minWidth: 380,
      transition: 'all 0.25s var(--ease-spring)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Album art */}
        <div onClick={() => setExpanded(e => !e)} style={{
          width: 38, height: 38, borderRadius: 8,
          background: playing ? 'linear-gradient(135deg, #0071e3, #af52de)' : '#2c2c2e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, cursor: 'pointer',
          boxShadow: playing ? '0 4px 12px rgba(0,113,227,0.3)' : 'none',
          transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: 17, animation: playing ? 'float 3s ease-in-out infinite' : 'none' }}>🎷</span>
        </div>

        {/* Track info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{track.mood} · {track.bpm} BPM · Lofi Jazz</div>
        </div>

        {/* Visualizer (only when not expanded) */}
        {playing && !expanded && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 18 }}>
            {[0.5, 1, 0.7, 0.9, 0.5].map((h, i) => (
              <div key={i} style={{
                width: 2.5, borderRadius: 2,
                background: 'rgba(0,113,227,0.85)',
                height: `${h * 100}%`,
                animation: `pulse ${0.4 + i * 0.1}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={prevTrack} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, padding: '6px 4px', cursor: 'pointer' }}>⏮</button>
          <button onClick={() => setPlaying(p => !p)} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: playing ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
            border: 'none', color: 'white', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: playing ? '0 2px 12px rgba(0,113,227,0.6)' : 'none',
          }}>{playing ? '⏸' : '▶'}</button>
          <button onClick={nextTrack} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 14, padding: '6px 4px', cursor: 'pointer' }}>⏭</button>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', minWidth: 40, textAlign: 'right' }}>{formatTime(elapsed)}</div>

        <button onClick={() => setExpanded(e => !e)} style={{
          background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)',
          fontSize: 12, cursor: 'pointer', padding: '4px',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>▾</button>
      </div>

      {expanded && (
        <>
          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4 }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>🔈</span>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>🔊</span>
          </div>

          {/* Track list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Up Next</div>
            {TRACKS.map((t, i) => (
              <button key={t.title} onClick={() => { setTrackIdx(i); setElapsed(0) }} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 10px', borderRadius: 8,
                background: trackIdx === i ? 'rgba(0,113,227,0.2)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: trackIdx === i ? '#5ac8fa' : 'rgba(255,255,255,0.3)', width: 16 }}>{trackIdx === i && playing ? '♫' : String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div style={{ fontSize: 12, color: trackIdx === i ? 'white' : 'rgba(255,255,255,0.7)', fontWeight: trackIdx === i ? 500 : 400 }}>{t.title}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{t.mood}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>{t.bpm} BPM</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
