import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const PRIORITIES = [
  { label: 'Critical', color: '#ff3b30', bg: '#ffe9e8' },
  { label: 'High', color: '#ff9500', bg: '#fff4e0' },
  { label: 'Normal', color: '#0071e3', bg: '#e8f1fb' },
]

export default function TaskLog() {
  const [tasks, setTasks] = useLocalStorage('ff-tasks', [
    { id: 1, text: 'Read chapter notes', done: false, priority: 2 },
    { id: 2, text: 'Complete practice paper', done: false, priority: 0 },
    { id: 3, text: 'Review flashcards', done: true, priority: 1 },
  ])
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState(2)

  const addTask = () => {
    if (!input.trim()) return
    const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1
    setTasks(t => [...t, { id: nextId, text: input.trim(), done: false, priority }])
    setInput('')
  }

  const toggleTask = id => setTasks(t => t.map(task => task.id === id ? { ...task, done: !task.done } : task))
  const removeTask = id => setTasks(t => t.filter(task => task.id !== id))
  const clearCompleted = () => setTasks(t => t.filter(task => !task.done))

  const remaining = tasks.filter(t => !t.done).length
  const total = tasks.length
  const hasCompleted = tasks.some(t => t.done)

  return (
    <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: 22, boxShadow: 'var(--shadow-card)', border: '0.5px solid var(--border-hairline)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Study Log</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hasCompleted && (
            <button onClick={clearCompleted} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: 11, cursor: 'pointer', padding: 0 }}>Clear done</button>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{remaining}/{total}</div>
        </div>
      </div>

      <div style={{ height: 3, background: 'var(--bg-inset)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--green)', borderRadius: 2, width: `${total > 0 ? ((total - remaining) / total) * 100 : 0}%`, transition: 'width 0.4s var(--ease-smooth)' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)', fontSize: 13 }}>
            No tasks yet — add one below ✈️
          </div>
        )}
        {[...tasks].sort((a, b) => (a.done - b.done) || (a.priority - b.priority)).map(task => {
          const p = PRIORITIES[task.priority]
          return (
            <div key={task.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 11px', borderRadius: 'var(--radius-sm)',
              background: task.done ? 'transparent' : 'var(--bg-elevated)',
              border: '0.5px solid var(--border)',
              transition: 'all 0.2s',
            }}>
              <button onClick={() => toggleTask(task.id)} style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                border: `1.5px solid ${task.done ? 'var(--green)' : p.color}`,
                background: task.done ? 'var(--green)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}>{task.done && <span style={{ color: 'white', fontSize: 11 }}>✓</span>}</button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: task.done ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.text}</div>
              </div>

              {!task.done && (
                <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 'var(--radius-full)', background: p.bg, color: p.color, flexShrink: 0, fontWeight: 500 }}>{p.label}</span>
              )}

              <button onClick={() => removeTask(task.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', fontSize: 16, cursor: 'pointer', padding: '0 2px', lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 6, borderTop: '0.5px solid var(--border)', paddingTop: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add a task..." style={{
            flex: 1, padding: '8px 11px', borderRadius: 'var(--radius-sm)',
            border: '0.5px solid var(--border)', background: 'var(--bg-elevated)',
            fontSize: 13, color: 'var(--text-primary)',
          }} />
        <select value={priority} onChange={e => setPriority(Number(e.target.value))} style={{
          padding: '8px 8px', borderRadius: 'var(--radius-sm)',
          border: '0.5px solid var(--border)', background: 'var(--bg-elevated)',
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          {PRIORITIES.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
        </select>
        <button onClick={addTask} style={{ background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', padding: '8px 14px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  )
}
