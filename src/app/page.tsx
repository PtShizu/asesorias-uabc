import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home({ 
  searchParams 
}: { 
  searchParams: { q?: string } 
}) {
  const supabase = await createClient()
  const query = (await searchParams).q

  // Construir la consulta a Supabase
  let supabaseQuery = supabase
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

  // Si hay una búsqueda, filtramos por el nombre de la materia
  if (query) {
    supabaseQuery = supabaseQuery.ilike('advisor_subjects.subjects.name', `%${query}%`)
  }

  const { data: advisors, error } = await supabaseQuery

  if (error) {
    console.error('Error fetching advisors:', error)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl font-serif">
          Encuentra tu asesoría académica
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Explora los perfiles de asesores de la UABC y solicita una sesión en segundos.
        </p>
      </div>

      {/* Buscador Funcional */}
      <div className="mt-12 flex justify-center">
        <form action="/" className="w-full max-w-lg">
          <div className="relative group">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="¿Qué materia necesitas aprender? (ej. Cálculo)"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-6 py-4 pr-12 text-zinc-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          {query && (
            <div className="mt-3 text-center">
              <Link href="/" className="text-xs text-zinc-500 hover:text-blue-500 underline underline-offset-4">
                Limpiar búsqueda
              </Link>
            </div>
          )}
        </form>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {advisors?.map((advisor) => (
          <div
            key={advisor.id}
            className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-500/20"
          >
            <div className="flex-1">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                {advisor.full_name}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {/* @ts-ignore */}
                {advisor.advisor_subjects?.map((as, idx) => {
                  const subjectName = Array.isArray(as.subjects) ? as.subjects[0]?.name : as.subjects?.name;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {subjectName}
                    </span>
                  )
                })}
              </div>
              <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                {advisor.bio || 'Sin biografía disponible.'}
              </p>
            </div>
            <Link 
              href={`/advisor/${advisor.id}`}
              className="mt-8 w-full text-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Consultar Horario
            </Link>
          </div>
        ))}

        {(!advisors || advisors.length === 0) && (
          <div className="col-span-full text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto w-12 h-12 text-zinc-300 mb-4">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 font-medium">
              {query 
                ? `No encontramos asesores para "${query}".` 
                : 'No hay asesores registrados aún.'}
            </p>
            {query && (
              <Link href="/" className="mt-4 inline-block text-sm text-blue-500 font-bold hover:underline">
                Ver todos los asesores
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
