'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function DashboardToasts() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message')

  useEffect(() => {
    if (message) {
      toast.success(message)
      // Limpiar el mensaje de la URL sin recargar
      const params = new URLSearchParams(searchParams.toString())
      params.delete('message')
      const newPath = params.toString() ? `?${params.toString()}` : ''
      router.replace(`/dashboard${newPath}`, { scroll: false })
    }
  }, [message, searchParams, router])

  return null
}
