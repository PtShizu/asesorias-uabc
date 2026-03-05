import Link from 'next/link'

export default function Home() {
  const advisors = [
    {
      id: 1,
      name: "Dra. Ana García",
      subjects: ["Cálculo Diferencial", "Álgebra Lineal"],
      availability: "Lun-Vie 8:00 - 12:00",
    },
    {
      id: 2,
      name: "Ing. Roberto Sánchez",
      subjects: ["Programación Orientada a Objetos", "Estructuras de Datos"],
      availability: "Lun-Mié 14:00 - 18:00",
    },
    {
      id: 3,
      name: "Mtra. Elena Torres",
      subjects: ["Física I", "Termodinámica"],
      availability: "Mar-Jue 10:00 - 14:00",
    },
  ];

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

      <div className="mt-12 flex justify-center">
        <div className="w-full max-w-lg">
          <input
            type="text"
            placeholder="Buscar por materia..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-6 py-4 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {advisors.map((advisor) => (
          <div
            key={advisor.id}
            className="group relative flex flex-col rounded-2xl border border-zinc-200 bg-white p-8 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                {advisor.name}
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {advisor.subjects.map((subject) => (
                  <span
                    key={subject}
                    className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {subject}
                  </span>
                ))}
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {advisor.availability}
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
      </div>
    </main>
  );
}
