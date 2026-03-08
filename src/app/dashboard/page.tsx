import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateAppointmentStatus } from '@/app/auth/actions'
import { getDayName } from '@/lib/date-utils'
import DashboardToasts from '@/components/DashboardToasts'
import ScheduleManager from '@/components/ScheduleManager'
import { Suspense } from 'react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // 1. Obtener todas las citas
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      guest_email,
      start_at,
      end_at,
      status,
      subject_id,
      subjects (
        name
      )
    `)
    .eq('advisor_id', user.id)

  // 2. Obtener disponibilidad para el calendario
  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('advisor_id', user.id)

  // 3. Obtener materias del asesor para el selector
  const { data: advisorSubjects } = await supabase
    .from('advisor_subjects')
    .select('subject_id, subjects(id, name)')
    .eq('advisor_id', user.id)

  const subjects = advisorSubjects?.map((as: any) => as.subjects).filter(Boolean) || []

  // 4. Obtener perfil para ubicación por defecto
  const { data: profile } = await supabase
    .from('profiles')
    .select('default_location')
    .eq('id', user.id)
    .single()

  const pending = appointments?.filter(a => a.status === 'pending') || []

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Panel de Control</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Gestiona tus asesorías y disponibilidad.</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-12 items-start">
        {/* Solicitudes Pendientes (Columna más angosta) */}
        <section className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between mb-2">
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
                <div key={app.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/10 dark:border-amber-900/30 dark:bg-zinc-900/50 shadow-sm">
                  <div className="mb-4">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-sm">{subject?.name || 'Materia'}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">{app.guest_email}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="font-bold text-amber-600 dark:text-amber-400 capitalize bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                        {getDayName(app.start_at)}
                      </span>
                      <span className="text-zinc-500 font-medium">
                        {new Date(app.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <form action={updateAppointmentStatus} className="space-y-3">
                    <input type="hidden" name="appointmentId" value={app.id} />
                    <input type="hidden" name="status" value="confirmed" />
                    
                    <div>
                      <input 
                        name="location"
                        defaultValue={profile?.default_location || ''}
                        placeholder="Lugar o enlace"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] dark:border-zinc-800 dark:bg-zinc-800 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 rounded-lg bg-zinc-900 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors">
                        Confirmar
                      </button>
                      <button 
                        formAction={async (formData) => {
                          'use server';
                          formData.set('status', 'cancelled');
                          await updateAppointmentStatus(formData);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                      >
                        Rechazar
                      </button>
                    </div>
                  </form>
                </div>
              )
            })}
          </div>
        </section>

        {/* Agenda Interactiva (Columna ancha) */}
        <section className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Tu Agenda</h2>
          </div>
          <ScheduleManager 
            advisorId={user.id}
            initialAvailability={availability || []}
            initialAppointments={appointments as any || []}
            subjects={subjects as any}
          />
        </section>
      </div>
      
      <Suspense fallback={null}>
        <DashboardToasts />
      </Suspense>
    </main>
  )
}
