'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function AvatarUpload({ 
  uid, 
  url, 
  onUpload 
}: { 
  uid: string, 
  url?: string, 
  onUpload: (url: string) => void 
}) {
  const supabase = createClient()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url || null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (url) setAvatarUrl(url)
  }, [url])

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${uid}-${Math.random()}.${fileExt}`

      // 1. Eliminar foto anterior si existe
      if (avatarUrl) {
        try {
          // Extraer el nombre del archivo de la URL pública
          const urlParts = avatarUrl.split('/')
          const oldFileName = urlParts[urlParts.length - 1]

          await supabase.storage
            .from('avatars')
            .remove([oldFileName])
        } catch (error) {
          console.error('Error eliminando foto antigua:', error)
          // No bloqueamos la subida si falla el borrado de la vieja
        }
      }

      // 2. Subir imagen nueva al bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)


      if (uploadError) throw uploadError

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      onUpload(publicUrl)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32 overflow-hidden rounded-3xl border-4 border-white bg-zinc-100 shadow-xl dark:border-zinc-800 dark:bg-zinc-800 group">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {/* Overlay de carga */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
            <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      <label className="cursor-pointer rounded-xl bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors">
        {uploading ? 'Subiendo...' : 'Cambiar Foto'}
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
