import WeeklyCalendar from '@/components/WeeklyCalendar'
import Link from 'next/link'

export default async function AdvisorPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  // Mock data for the advisor
  const advisor = {
    name: "Dra. Ana García",
    subjects: ["Cálculo Diferencial", "Álgebra Lineal"],
    bio: "Especialista en análisis matemático con 10 años de experiencia docente."
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
        {/* Profile Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{advisor.name}</h1>
            <div className="mt-4 flex flex-wrap gap-2">
              {advisor.subjects.map(subject => (
                <span key={subject} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {subject}
                </span>
              ))}
            </div>
            <p className="mt-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {advisor.bio}
            </p>
          </div>
        </div>

        {/* Calendar Area */}
        <div className="w-full lg:w-2/3">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Horario de Disponibilidad</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Selecciona un espacio vacío para solicitar tu asesoría.
            </p>
          </div>
          <WeeklyCalendar advisorId={id} />
        </div>
      </div>
    </main>
  )
}
