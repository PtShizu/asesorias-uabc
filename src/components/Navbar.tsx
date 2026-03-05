import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="border-b bg-white dark:bg-black dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
              Asesorías UABC
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
