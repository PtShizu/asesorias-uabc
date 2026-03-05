import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  // Consultar asesores que tengan materias asignadas
  const { data: advisors, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      bio,
      advisor_subjects!inner (
        subjects (
          name
        )
      )
    `)

  if (error) {
    console.error('Error fetching advisors:', error)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Encuentra tu asesoría académica
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Explora los perfiles de asesores disponibles y solicita una sesión en segundos.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {advisors?.map((advisor) => (
          <div
            key={advisor.id}
            className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                {advisor.full_name}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {/* @ts-ignore - Estructura de join en Supabase */}
                {advisor.advisor_subjects?.map((as) => (
                  <span
                    key={as.subjects.name}
                    className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {as.subjects.name}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
                {advisor.bio || 'Sin biografía disponible.'}
              </p>
            </div>
            <Link 
              href={`/advisor/${advisor.id}`}
              className="mt-8 w-full text-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Ver Horario Completo
            </Link>
          </div>
        ))}

        {(!advisors || advisors.length === 0) && (
          <div className="col-span-full text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">
              No hay asesores con materias asignadas aún.
              <br />
              Si eres asesor, ve a "Mi Perfil" para agregar tus materias.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
