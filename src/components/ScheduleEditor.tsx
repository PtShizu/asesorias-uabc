'use client'

import { useState } from 'react'

const DAYS = [
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
  { label: 'Sábado', value: 6 },
  { label: 'Domingo', value: 0 },
]

interface Slot {
  day_of_week: number
  start_time: string
  end_time: string
}

export default function ScheduleEditor({ initialSlots }: { initialSlots: Slot[] }) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots.length > 0 ? initialSlots : [{ day_of_week: 1, start_time: '08:00', end_time: '12:00' }])

  const addSlot = () => {
    setSlots([...slots, { day_of_week: 1, start_time: '', end_time: '' }])
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: keyof Slot, value: any) => {
    const newSlots = [...slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setSlots(newSlots)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-zinc-900 dark:text-white">
          Mi Disponibilidad Semanal
        </label>
        <button
          type="button"
          onClick={addSlot}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          + Añadir Rango
        </button>
      </div>

      {slots.length === 0 && (
        <p className="text-xs text-zinc-500 italic">No has definido horarios aún.</p>
      )}

      {slots.map((slot, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex-1 w-full">
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Día</label>
            <select
              name="availability_day"
              value={slot.day_of_week}
              onChange={(e) => updateSlot(index, 'day_of_week', parseInt(e.target.value))}
              className="w-full bg-transparent text-sm font-bold focus:outline-none dark:text-white"
            >
              {DAYS.map(day => (
                <option key={day.value} value={day.value} className="dark:bg-zinc-900">{day.label}</option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Desde</label>
            <input
              type="time"
              name="availability_start"
              value={slot.start_time}
              onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
              className="bg-transparent text-sm font-bold focus:outline-none dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              required
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="text-[10px] uppercase font-bold text-zinc-400 mb-1 block">Hasta</label>
            <input
              type="time"
              name="availability_end"
              value={slot.end_time}
              onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
              className="bg-transparent text-sm font-bold focus:outline-none dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              required
            />
          </div>

          <button
            type="button"
            onClick={() => removeSlot(index)}
            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
