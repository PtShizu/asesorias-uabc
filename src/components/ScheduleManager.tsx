'use client'

import { useState, Fragment, useMemo } from 'react'
import { createManualAppointment, deleteAppointment } from '@/app/auth/actions'
import { getHourInTimezone, getDayOfWeekInTimezone } from '@/lib/date-utils'
import { toast } from 'sonner'

const DAYS = [
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
]
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8:00 AM to 6:00 PM

interface Availability {
  day_of_week: number
  start_time: string
  end_time: string
}

interface Appointment {
  id: string
  subject_id: string
  guest_email: string
  start_at: string
  end_at: string
  status: 'pending' | 'confirmed' | 'cancelled'
  subjects: { name: string }
}

export default function ScheduleManager({ 
  advisorId, 
  initialAvailability,
  initialAppointments,
  subjects 
}: { 
  advisorId: string, 
  initialAvailability: Availability[],
  initialAppointments: Appointment[],
  subjects: { id: string, name: string }[]
}) {
  const [selectedHours, setSelectedHours] = useState<number[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  // Mapeo de citas por horario para visualización
  const occupiedSlots = useMemo(() => {
    const map = new Map<string, { 
      subjectId: string, 
      name: string, 
      status: string, 
      guests: string[],
      ids: string[]
    }>()

    initialAppointments.filter(a => a.status !== 'cancelled').forEach(app => {
      const hour = getHourInTimezone(app.start_at)
      const endHour = getHourInTimezone(app.end_at)
      const day = getDayOfWeekInTimezone(app.start_at)
      
      for (let h = hour; h < endHour; h++) {
        const key = `${day}-${h}`
        const existing = map.get(key)
        
        if (existing) {
          existing.guests.push(app.guest_email)
          existing.ids.push(app.id)
        } else {
          map.set(key, { 
            subjectId: app.subject_id, 
            name: (app.subjects as any)?.name || 'Materia',
            status: app.status,
            guests: [app.guest_email],
            ids: [app.id]
          })
        }
      }
    })
    return map
  }, [initialAppointments])

  const isAvailable = (dayValue: number, hour: number) => {
    return initialAvailability.some(a => {
      if (a.day_of_week !== dayValue) return false
      const startHour = parseInt(a.start_time.split(':')[0])
      const endHour = parseInt(a.end_time.split(':')[0])
      return hour >= startHour && hour < endHour
    })
  }

  const handleSlotClick = (dayValue: number, hour: number) => {
    if (!isAvailable(dayValue, hour)) return

    // Si hay una cita ya, no permitir seleccionar para "crear" nueva
    if (occupiedSlots.has(`${dayValue}-${hour}`)) return

    if (selectedDay !== dayValue) {
      setSelectedDay(dayValue)
      setSelectedHours([hour])
      return
    }

    if (selectedHours.includes(hour)) {
      const newHours = selectedHours.filter(h => h !== hour)
      setSelectedHours(newHours)
      if (newHours.length === 0) setSelectedDay(null)
    } else {
      const newHours = [...selectedHours, hour].sort((a, b) => a - b)
      const isConsecutive = newHours.every((h, i) => i === 0 || h === newHours[i - 1] + 1)
      
      if (!isConsecutive) {
        setSelectedHours([hour])
      } else {
        setSelectedHours(newHours)
      }
    }
  }

  const handleDeleteSlot = async (ids: string[]) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este bloque de asesoría?')) return
    
    try {
      for (const id of ids) {
        await deleteAppointment(id)
      }
      toast.success('Bloque eliminado')
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDay || selectedHours.length === 0 || !selectedSubject) return

    setStatus('loading')

    // Lógica de fechas (igual que en WeeklyCalendar)
    const targetDate = new Date()
    targetDate.setHours(0, 0, 0, 0)
    const currentDay = targetDate.getDay()
    let diff = selectedDay - currentDay
    if (diff < 0) diff += 7
    targetDate.setDate(targetDate.getDate() + diff)

    const startAt = new Date(targetDate)
    startAt.setHours(Math.min(...selectedHours), 0, 0, 0)
    
    const endAt = new Date(targetDate)
    endAt.setHours(Math.max(...selectedHours) + 1, 0, 0, 0)

    try {
      await createManualAppointment({
        advisorId,
        subjectId: selectedSubject,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString()
      })
      
      setStatus('success')
      setSelectedHours([])
      setSelectedDay(null)
      toast.success('Horario confirmado con éxito')
    } catch (err) {
      console.error(err)
      setStatus('error')
      toast.error('Error al confirmar horario')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <div className="grid grid-cols-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-center">
          <div className="p-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hora</div>
          {DAYS.map(day => (
            <div key={day.value} className="p-4 text-xs font-bold text-zinc-900 dark:text-white border-l border-zinc-200 dark:border-zinc-800">
              {day.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-6">
          {HOURS.map(hour => (
            <Fragment key={hour}>
              <div className="p-4 text-center text-[10px] font-bold text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 flex flex-col justify-center leading-tight">
                <span>{hour}:00</span>
                <span className="opacity-50">—</span>
                <span>{hour + 1}:00</span>
              </div>
              {DAYS.map(day => {
                const available = isAvailable(day.value, hour)
                const selected = selectedDay === day.value && selectedHours.includes(hour)
                const occupied = occupiedSlots.get(`${day.value}-${hour}`)
                
                return (
                  <div
                    key={`${day.value}-${hour}`}
                    onClick={() => handleSlotClick(day.value, hour)}
                    className={`
                      h-20 border-l border-b border-zinc-200 dark:border-zinc-800 transition-all relative flex flex-col items-center justify-center text-center p-1 group
                      ${!available ? 'bg-zinc-100/30 dark:bg-zinc-800/5 cursor-not-allowed' : 'cursor-pointer'}
                      ${available && !selected && !occupied ? 'hover:bg-blue-200 dark:hover:bg-blue-900/20' : ''}
                      ${selected ? 'bg-blue-600 dark:bg-blue-500 z-10' : ''}
                      ${available && !selected && !occupied ? 'bg-zinc-100 dark:bg-zinc-800/50' : ''}
                      ${occupied ? (occupied.status === 'confirmed' ? 'bg-blue-100 dark:bg-blue-900/25' : 'bg-amber-50/50 dark:bg-amber-900/10') : ''}
                    `}
                  >
                    {occupied && (
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[8px] font-bold uppercase leading-tight ${occupied.status === 'confirmed' ? 'text-blue-600 dark:text-blue-300' : 'text-amber-600 dark:text-amber-500'}`}>
                          {occupied.name}
                        </span>
                        <span className="text-[7px] font-bold text-zinc-700 dark:text-zinc-300 line-clamp-1 px-1">
                          {occupied.guests.length > 1 ? `${occupied.guests.length} alumnos` : occupied.guests[0]}
                        </span>
                        
                        {/* Botón de borrar que aparece en hover */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteSlot(occupied.ids) }}
                          className="absolute inset-0 bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-sm"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                    {selected && (
                      <span className="text-[9px] font-bold text-white uppercase">Seleccionado</span>
                    )}
                    {available && !selected && !occupied && (
                       <span className="text-[9px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">Libre</span>
                    )}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>

        {selectedDay && selectedHours.length > 0 && (
          <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-blue-50/30 dark:bg-blue-900/10">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Confirmar Horario Manualmente</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {DAYS.find(d => d.value === selectedDay)?.label} de {Math.min(...selectedHours)}:00 a {Math.max(...selectedHours) + 1}:00
                </p>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Materia para este bloque</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => {setSelectedDay(null); setSelectedHours([])}} className="px-4 py-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700 transition-colors">Cancelar</button>
                <button disabled={status === 'loading'} className="rounded-xl bg-zinc-900 dark:bg-white px-6 py-2 text-sm font-bold text-white dark:text-zinc-950 hover:opacity-90 transition-opacity">
                  {status === 'loading' ? 'Guardando...' : 'Confirmar Horas'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="flex gap-4 text-[10px] font-bold uppercase text-zinc-400 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"></div>
          <span>Ocupado / Confirmado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30"></div>
          <span>Pendiente de confirmar</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-500">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Pasa el cursor para borrar</span>
        </div>
      </div>
    </div>
  )
}
