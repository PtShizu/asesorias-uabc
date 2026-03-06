import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home({ 
  searchParams 
}: { 
  searchParams: { q?: string; career?: string } 
}) {
  const supabase = await createClient()
  const { q: query, career: selectedCareer } = await searchParams

  // Obtener carreras para el filtro
  const { data: careers } = await supabase
    .from('careers')
    .select('id, name')
    .order('name')

  // Construir la consulta a Supabase
  let supabaseQuery = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      bio,
      career_id,
      avatar_url,
      careers (
        name
      ),
      advisor_subjects!inner (
        subjects (
          name
        )
      )
    `)

  // Filtro por materia (texto)
  if (query) {
    supabaseQuery = supabaseQuery.ilike('advisor_subjects.subjects.name', `%${query}%`)
  }

  // Filtro por carrera del asesor
  if (selectedCareer && selectedCareer !== 'all') {
    supabaseQuery = supabaseQuery.eq('career_id', selectedCareer)
  }

  const { data: advisors, error } = await supabaseQuery

  if (error) {
    console.error('Error fetching advisors:', error)
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl font-serif italic">
          Encuentra tu asesoría académica
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Explora los perfiles de asesores de la UABC y solicita una sesión en segundos.
        </p>
      </div>

      {/* Buscador y Filtros */}
      <div className="mt-12 flex justify-center">
        <form action="/" className="w-full max-w-2xl space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative group">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="¿Qué materia necesitas? (ej. Cálculo)"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-6 py-4 pr-12 text-zinc-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <select
              name="career"
              defaultValue={selectedCareer || 'all'}
              className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-zinc-900 shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white min-w-[200px]"
            >
              <option value="all">Todas las carreras</option>
              {careers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <button type="submit" className="rounded-2xl bg-zinc-900 px-8 py-4 font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 transition-colors">
              Filtrar
            </button>
          </div>

          {(query || (selectedCareer && selectedCareer !== 'all')) && (
            <div className="text-center">
              <Link href="/" className="text-xs text-zinc-500 hover:text-blue-500 underline underline-offset-4">
                Limpiar todos los filtros
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
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 shadow-sm">
                  {advisor.avatar_url ? (
                    <img
                      src={advisor.avatar_url}
                      alt={advisor.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-400">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white leading-tight">
                    {advisor.full_name}
                  </h3>
                  {/* @ts-ignore */}
                  {advisor.careers?.name && (
                    <p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mt-0.5 tracking-wider">
                      {/* @ts-ignore */}
                      {advisor.careers.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {/* @ts-ignore */}
                {advisor.advisor_subjects?.map((as: any, idx) => {
                  const subject = Array.isArray(as.subjects) ? as.subjects[0] : as.subjects;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 uppercase"
                    >
                      {subject?.name}
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
