import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateAppointmentStatus } from '@/app/auth/actions'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

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
  const confirmed = appointments?.filter(a => a.status === 'confirmed') || []

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
                      <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {DAYS[new Date(app.start_at).getDay()]}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(app.start_at).getHours()}:00 - {new Date(app.end_at).getHours()}:00
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
          <div className="space-y-3">
            {confirmed.length === 0 && (
              <p className="text-sm text-zinc-500 italic py-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                Aún no has confirmado ninguna asesoría.
              </p>
            )}
            {confirmed.map(app => {
              const subject = Array.isArray(app.subjects) ? app.subjects[0] : app.subjects;
              return (
                <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {new Date(app.start_at).getDate()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{subject?.name || 'Materia'}</p>
                    <p className="text-xs text-zinc-500">{app.guest_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {DAYS[new Date(app.start_at).getDay()]}
                    </p>
                    <p className="text-[10px] text-zinc-500 uppercase">
                      {new Date(app.start_at).getHours()}:00
                    </p>
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
