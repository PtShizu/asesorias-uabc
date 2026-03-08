'use client'

import { useState, Suspense } from 'react'
import { login, signup } from '@/app/auth/actions'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const message = searchParams.get('message')

  return (
    <div className="w-full max-w-md space-y-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {isLogin ? 'Acceso para Asesores' : 'Registro de Asesores'}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {isLogin 
            ? 'Ingresa tus credenciales para gestionar tus asesorías' 
            : 'Crea tu perfil para empezar a ofrecer asesorías'}
        </p>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
            ¿Eres estudiante? <br/>
            No necesitas una cuenta para solicitar asesoría. <br/>
            Solo selecciona a un asesor en la página principal.
          </p>
        </div>
      </div>

      <form action={isLogin ? login : signup} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 focus:border-zinc-900 focus:ring-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-50"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-zinc-900 focus:border-zinc-900 focus:ring-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-50"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline"
        >
          {isLogin 
            ? '¿No tienes cuenta? Regístrate aquí' 
            : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-zinc-500 text-sm">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
