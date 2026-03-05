import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateProfile } from '@/app/auth/actions'
import ScheduleEditor from '@/components/ScheduleEditor'

export default async function ProfilePage({ searchParams }: { searchParams: { message?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { message } = await searchParams

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil actual
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Obtener todas las materias
  const { data: allSubjects } = await supabase
    .from('subjects')
    .select('*')
    .order('name')

  // Obtener materias que ya imparte el asesor
  const { data: advisorSubjects } = await supabase
    .from('advisor_subjects')
    .select('subject_id')
    .eq('advisor_id', user.id)

  const selectedSubjectIds = advisorSubjects?.map(as => as.subject_id) || []

  // Obtener disponibilidad actual
  const { data: availability } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('advisor_id', user.id)
    .order('day_of_week')

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Mi Perfil de Asesor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Configura tu información pública y las materias que impartes.
        </p>
      </div>

      <form action={updateProfile} className="space-y-12">
        {message && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {message}
          </div>
        )}

        <div className="grid gap-8">
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-2">Información Básica</h2>
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Nombre Completo
              </label>
              <input
                name="full_name"
                defaultValue={profile?.full_name || ''}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej. Dr. Juan Pérez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                Biografía / Presentación
              </label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile?.bio || ''}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cuenta un poco sobre tu experiencia académica..."
              />
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-2">Especialidades</h2>
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                Materias que impartes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allSubjects?.map(subject => (
                  <label 
                    key={subject.id}
                    className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name="subjects"
                      value={subject.id}
                      defaultChecked={selectedSubjectIds.includes(subject.id)}
                      className="h-5 w-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                    />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {subject.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-2">Horarios</h2>
            <ScheduleEditor initialSlots={availability || []} />
          </section>
        </div>

        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Guardar Todos los Cambios
          </button>
        </div>
      </form>
    </main>
  )
}
