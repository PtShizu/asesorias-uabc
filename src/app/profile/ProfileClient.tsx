'use client'

import { useState, useEffect } from 'react'
import AvatarUpload from '@/components/AvatarUpload'
import ScheduleEditor from '@/components/ScheduleEditor'
import SubjectPicker from '@/components/SubjectPicker'
import { updateProfile, updateAvatar } from '@/app/auth/actions'
import { toast } from 'sonner'

export default function ProfileClient({ 
  profile, 
  careers, 
  allSubjects, 
  selectedSubjectIds, 
  availability, 
  message 
}: any) {
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  useEffect(() => {
    if (message) {
      toast.success(message)
    }
  }, [message])

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url)
    try {
      await updateAvatar(url)
      toast.success('Foto de perfil actualizada')
    } catch (error) {
      toast.error('Error al guardar la foto en la base de datos')
    }
  }

  return (
    <form action={updateProfile} className="space-y-12">
      {/* Input oculto para el avatar URL */}
      <input type="hidden" name="avatar_url" value={avatarUrl} />

      <div className="grid gap-8">
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-2">Información Básica</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <AvatarUpload 
              uid={profile?.id} 
              url={avatarUrl} 
              onUpload={handleAvatarUpload} 
            />
            
            <div className="flex-1 w-full space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                  Nombre Completo
                </label>
                <input
                  name="full_name"
                  defaultValue={profile?.full_name || ''}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Dr. Juan Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
                  Carrera de adscripción (principal)
                </label>
                <select
                  name="career_id"
                  defaultValue={profile?.career_id || ''}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="" disabled>Selecciona tu carrera...</option>
                  {careers?.map((career: any) => (
                    <option key={career.id} value={career.id}>{career.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              Biografía / Presentación
            </label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={profile?.bio || ''}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cuenta un poco sobre tu experiencia académica..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-2">
              Ubicación por defecto de asesorías
            </label>
            <input
              name="default_location"
              defaultValue={profile?.default_location || ''}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ej. Cubículo 202 o Enlace de Google Meet"
            />
            <p className="mt-1.5 text-xs text-zinc-500">Este mensaje aparecerá al momento de confirmar una solicitud.</p>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-2">Especialidades</h2>
          <SubjectPicker 
            allSubjects={allSubjects || []} 
            careers={careers || []} 
            selectedSubjectIds={selectedSubjectIds} 
          />
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white border-b pb-2">Horarios</h2>
          <ScheduleEditor initialSlots={availability || []} />
        </section>
      </div>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <button
          type="submit"
          className="w-full sm:w-auto rounded-xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Guardar Todos los Cambios
        </button>
      </div>
    </form>
  )
}
