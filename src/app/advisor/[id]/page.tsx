import WeeklyCalendar from '@/components/WeeklyCalendar'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function AdvisorPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: advisor, error } = await supabase
    .from('profiles')
    .select(`
      full_name,
      bio,
      advisor_subjects (
        subjects (
          id,
          name
        )
      ),
      availability (
        day_of_week,
        start_time,
        end_time
      ),
      appointments (
        id,
        subject_id,
        start_at,
        end_at,
        status,
        subjects (
          name
        )
      )
    `)
    .eq('id', id)
    // Eliminamos el filtro de status para traer pendientes también
    .single()

  if (error || !advisor) {
    return notFound()
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-8"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver a la lista
      </Link>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full lg:w-1/3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{advisor.full_name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {/* @ts-ignore */}
              {advisor.advisor_subjects?.map((as, index) => {
                const subject = Array.isArray(as.subjects) ? as.subjects[0] : as.subjects;
                if (!subject) return null;
                return (
                  <span key={index} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {subject.name}
                  </span>
                )
              })}
            </div>
            <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {advisor.bio || "Este asesor aún no ha agregado una biografía."}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Horario de Asesorías</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Selecciona una o varias horas consecutivas. Si ya hay una materia programada, puedes unirte a ella.
            </p>
          </div>
          <WeeklyCalendar 
            advisorId={id} 
            initialAvailability={advisor.availability || []}
            initialAppointments={advisor.appointments || []}
            subjects={advisor.advisor_subjects?.map((as: any) => as.subjects) || []}
          />
        </div>
      </div>
    </main>
  )
}
