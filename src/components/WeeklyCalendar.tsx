'use client'

import { useState, Fragment } from 'react'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8:00 AM to 6:00 PM

interface Slot {
  day: string
  hour: number
}

export default function WeeklyCalendar({ advisorId }: { advisorId: string }) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  
  // Mock occupied slots for demonstration
  const occupiedSlots = [
    { day: 'Lunes', hour: 9 },
    { day: 'Miércoles', hour: 11 },
    { day: 'Viernes', hour: 15 },
  ]

  const isOccupied = (day: string, hour: number) => 
    occupiedSlots.some(s => s.day === day && s.hour === hour)

  const handleSlotClick = (day: string, hour: number) => {
    if (isOccupied(day, hour)) return
    setSelectedSlot({ day, hour })
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* Header - Days */}
      <div className="grid grid-cols-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="p-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Hora
        </div>
        {DAYS.map(day => (
          <div key={day} className="p-4 text-center text-sm font-bold text-zinc-900 dark:text-white border-l border-zinc-200 dark:border-zinc-800">
            {day}
          </div>
        ))}
      </div>

      {/* Grid - Hours and Slots */}
      <div className="grid grid-cols-6">
        {HOURS.map(hour => (
          <Fragment key={hour}>
            {/* Hour Label */}
            <div key={`${hour}-label`} className="p-4 text-center text-sm font-medium text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              {hour}:00
            </div>
            
            {/* Day Slots */}
            {DAYS.map(day => {
              const occupied = isOccupied(day, hour)
              const selected = selectedSlot?.day === day && selectedSlot?.hour === hour
              
              return (
                <div
                  key={`${day}-${hour}`}
                  onClick={() => handleSlotClick(day, hour)}
                  className={`
                    h-16 border-l border-b border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer
                    ${occupied ? 'bg-zinc-100 dark:bg-zinc-800/30 cursor-not-allowed' : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'}
                    ${selected ? 'bg-blue-500 dark:bg-blue-600 ring-2 ring-inset ring-blue-600 dark:ring-blue-400' : ''}
                  `}
                >
                  {occupied && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">Ocupado</span>
                    </div>
                  )}
                  {selected && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-[10px] font-bold uppercase text-white">Seleccionado</span>
                    </div>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>

      {/* Confirmation Section */}
      {selectedSlot && (
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-900/10 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Has seleccionado: <span className="font-bold">{selectedSlot.day} a las {selectedSlot.hour}:00</span>
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Ingresa tu correo para solicitar la asesoría.</p>
          </div>
          <div className="flex gap-3">
            <input 
              type="email" 
              placeholder="tu@correo.com"
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
