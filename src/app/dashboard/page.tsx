import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateAppointmentStatus, deleteAppointment } from '@/app/auth/actions'
import { formatTime, getDayName, getDateNumber } from '@/lib/date-utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener todas las citas relacionadas con este asesor
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      guest_email,
      start_at,
      end_at,
      status,
      subjects (
        name
      )
    `)
    .eq('advisor_id', user.id)
    .order('start_at', { ascending: true })

  if (error) {
    console.error('Error fetching dashboard:', error)
  }

  const pending = appointments?.filter(a => a.status === 'pending') || []
  const confirmedRaw = appointments?.filter(a => a.status === 'confirmed') || []

  // Agrupar confirmadas por horario y materia
  const groupedConfirmed = confirmedRaw.reduce((acc, app) => {
    const subject = Array.isArray(app.subjects) ? app.subjects[0] : app.subjects;
    const key = `${app.start_at}-${subject?.name}`;
    
    if (!acc[key]) {
      acc[key] = {
        subjectName: subject?.name || 'Materia',
        start_at: app.start_at,
        end_at: app.end_at,
        guests: [app.guest_email],
        ids: [app.id]
      }
    } else {
      acc[key].guests.push(app.guest_email);
      acc[key].ids.push(app.id);
    }
    return acc;
  }, {} as Record<string, any>);

  const confirmed = Object.values(groupedConfirmed);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Panel de Control</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Gestiona tus solicitudes de asesoría.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Solicitudes Pendientes */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              Pendientes
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full dark:bg-amber-900/30 dark:text-amber-300">
                {pending.length}
              </span>
            </h2>
          </div>

          <div className="space-y-4">
            {pending.length === 0 && (
              <p className="text-sm text-zinc-500 italic py-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                No tienes solicitudes nuevas.
              </p>
            )}
            {pending.map(app => {
              const subject = Array.isArray(app.subjects) ? app.subjects[0] : app.subjects;
              return (
                <div key={app.id} className="p-6 rounded-2xl border border-amber-200 bg-amber-50/10 dark:border-amber-900/30 dark:bg-zinc-900 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white">{subject?.name || 'Materia desconocida'}</h3>
                      <p className="text-sm text-zinc-500">{app.guest_email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400 capitalize">
                        {getDayName(app.start_at)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatTime(app.start_at)} - {formatTime(app.end_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <form action={async () => { 'use server'; await updateAppointmentStatus(app.id, 'confirmed') }} className="flex-1">
                      <button className="w-full rounded-xl bg-zinc-900 py-2 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors">
                        Confirmar
                      </button>
                    </form>
                    <form action={async () => { 'use server'; await updateAppointmentStatus(app.id, 'cancelled') }}>
                      <button className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                        Rechazar
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Agenda Confirmada */}
        <section>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Próximas Asesorías</h2>
          <div className="space-y-4">
            {confirmed.length === 0 && (
              <p className="text-sm text-zinc-500 italic py-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                Aún no has confirmado ninguna asesoría.
              </p>
            )}
            {confirmed.map((session: any, idx) => {
              return (
                <div key={idx} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 group transition-all hover:border-blue-500/30">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex flex-col items-center justify-center text-blue-600 font-bold shrink-0">
                        <span className="text-[10px] uppercase leading-none">{getDayName(session.start_at).substring(0, 3)}</span>
                        <span className="text-lg leading-none mt-1">{getDateNumber(session.start_at)}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white">{session.subjectName}</h3>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">
                          {formatTime(session.start_at)} — {formatTime(session.end_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                       <form action={async () => { 
                         'use server'; 
                         for (const id of session.ids) {
                           await deleteAppointment(id)
                         }
                       }}>
                        <button title="Finalizar sesión (borrar todos)" className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">Alumnos inscritos ({session.guests.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {session.guests.map((email: string, gIdx: number) => (
                        <span key={gIdx} className="text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 font-medium shadow-sm">
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
