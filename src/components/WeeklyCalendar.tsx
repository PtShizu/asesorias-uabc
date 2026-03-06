'use client'

import { useState, Fragment, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createAppointment } from '@/app/auth/actions'
import { formatTime, DEFAULT_TIMEZONE, getHourInTimezone, getDayOfWeekInTimezone } from '@/lib/date-utils'
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
  subject_id: string
  start_at: string
  end_at: string
  status: 'pending' | 'confirmed' | 'cancelled'
  subjects: { name: string }
}

export default function WeeklyCalendar({ 
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
  const [guestEmail, setGuestEmail] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const supabase = createClient()

  const occupiedSlots = useMemo(() => {
    const map = new Map<string, { subjectId: string, name: string, status: string }>()
    initialAppointments.filter(a => a.status !== 'cancelled').forEach(app => {
      const hour = getHourInTimezone(app.start_at)
      const endHour = getHourInTimezone(app.end_at)
      const day = getDayOfWeekInTimezone(app.start_at)
      
      for (let h = hour; h < endHour; h++) {
        map.set(`${day}-${h}`, { 
          subjectId: app.subject_id, 
          name: app.subjects.name,
          status: app.status 
        })
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

    if (selectedDay !== dayValue) {
      setSelectedDay(dayValue)
      setSelectedHours([hour])
      const occupied = occupiedSlots.get(`${dayValue}-${hour}`)
      if (occupied) setSelectedSubject(occupied.subjectId)
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
        const allOccupiedSubjects = newHours
          .map(h => occupiedSlots.get(`${dayValue}-${h}`))
          .filter(Boolean)
        
        const uniqueSubjects = [...new Set(allOccupiedSubjects.map(s => s!.subjectId))]
        if (uniqueSubjects.length > 1) {
          toast.error("Bloque con materias diferentes. Elige horas con la misma materia.")
          return
        }
        
        if (uniqueSubjects.length === 1) setSelectedSubject(uniqueSubjects[0])
        setSelectedHours(newHours)
      }
    }
  }

  const lockedSubject = useMemo(() => {
    if (!selectedDay) return null
    for (const h of selectedHours) {
      const occ = occupiedSlots.get(`${selectedDay}-${h}`)
      if (occ) return occ
    }
    return null
  }, [selectedDay, selectedHours, occupiedSlots])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDay || selectedHours.length === 0 || !guestEmail || !selectedSubject) return

    setStatus('loading')

    // 1. Obtener la fecha base (hoy a las 00:00:00)
    const targetDate = new Date()
    targetDate.setHours(0, 0, 0, 0)

    // 2. Calcular cuántos días faltan para el día seleccionado
    // selectedDay es 1 (Lunes) a 5 (Viernes)
    const currentDay = targetDate.getDay() // 0 (Dom) a 6 (Sab)
    let diff = selectedDay - currentDay
    if (diff < 0) diff += 7 // Si ya pasó esta semana, apuntar a la próxima

    targetDate.setDate(targetDate.getDate() + diff)

    // 3. Crear fechas de inicio y fin exactas
    const startAt = new Date(targetDate)
    startAt.setHours(Math.min(...selectedHours), 0, 0, 0)
    
    const endAt = new Date(targetDate)
    endAt.setHours(Math.max(...selectedHours) + 1, 0, 0, 0)

    try {
      await createAppointment({
        advisorId,
        subjectId: selectedSubject,
        guestEmail,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString()
      })
      
      setStatus('success')
      setSelectedHours([])
      setSelectedDay(null)
      setGuestEmail('')
      toast.success('Solicitud enviada con éxito. Revisa tu correo.')
    } catch (err) {
      console.error(err)
      setStatus('error')
      toast.error('Hubo un error al enviar la solicitud. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      <div className="grid grid-cols-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="p-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Hora</div>
        {DAYS.map(day => (
          <div key={day.value} className="p-4 text-center text-sm font-bold text-zinc-900 dark:text-white border-l border-zinc-200 dark:border-zinc-800">
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
                    h-16 border-l border-b border-zinc-200 dark:border-zinc-800 transition-all relative flex flex-col items-center justify-center text-center p-1
                    ${!available ? 'bg-zinc-100/30 dark:bg-zinc-800/5 cursor-not-allowed' : 'cursor-pointer'}
                    ${available && !selected && !occupied ? 'hover:bg-blue-50 dark:hover:bg-blue-900/10' : ''}
                    ${selected ? 'bg-blue-600 dark:bg-blue-500 z-10' : ''}
                    ${occupied && !selected ? (occupied.status === 'confirmed' ? 'bg-zinc-100 dark:bg-zinc-800 border-l-4 border-l-blue-500' : 'bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-l-amber-400') : ''}
                  `}
                >
                  {!selected && occupied && (
                    <>
                      <span className={`text-[9px] font-bold uppercase leading-tight ${occupied.status === 'confirmed' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-500'}`}>
                        {occupied.name}
                      </span>
                      <span className="text-[7px] uppercase font-bold text-zinc-400">
                        {occupied.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </span>
                    </>
                  )}
                  {selected && (
                    <span className="text-[9px] font-bold text-white uppercase">Seleccionado</span>
                  )}
                  {available && !selected && !occupied && (
                     <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-600 uppercase">Libre</span>
                  )}
                </div>
              )
            })}
          </Fragment>
        ))}
      </div>

      {selectedDay && selectedHours.length > 0 && (
        <div className="p-8 border-t border-zinc-200 dark:border-zinc-800 bg-blue-50/30 dark:bg-blue-900/10">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="flex-1 space-y-4">
              <h3 className="font-bold text-zinc-900 dark:text-white">Reservar Bloque</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {DAYS.find(d => d.value === selectedDay)?.label} de {Math.min(...selectedHours)}:00 a {Math.max(...selectedHours) + 1}:00
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Materia</label>
                  <select 
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!!lockedSubject}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-800 disabled:bg-zinc-100"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Tu Correo</label>
                  <input 
                    type="email" 
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="estudiante@uabc.edu.mx"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => {setSelectedDay(null); setSelectedHours([])}} className="px-4 py-2 text-sm font-semibold text-zinc-500">Cancelar</button>
              <button disabled={status === 'loading'} className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700">
                {status === 'loading' ? 'Procesando...' : 'Confirmar Todo'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
