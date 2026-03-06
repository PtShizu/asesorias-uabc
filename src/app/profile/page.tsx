import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export default async function ProfilePage({ searchParams }: { searchParams: { message?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { message } = await searchParams

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil actual
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Obtener todas las carreras
  const { data: careers } = await supabase
    .from('careers')
    .select('*')
    .order('name')

  // Obtener todas las materias con sus carreras asociadas (N:N)
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('*, subject_careers(career_id)')
    .order('name')

  const allSubjects = subjectsData?.map(s => ({
    ...s,
    // @ts-ignore
    career_ids: s.subject_careers?.map((sc: any) => sc.career_id) || []
  })) || []

  const { data: advisorSubjects } = await supabase
    .from('advisor_subjects')
    .select('subject_id')
    .eq('advisor_id', user.id)

  const selectedSubjectIds = advisorSubjects?.map(as => as.subject_id) || []

  const { data: availability } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time')
    .eq('advisor_id', user.id)
    .order('day_of_week')

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Mi Perfil de Asesor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Configura tu información pública y las materias que impartes.
        </p>
      </div>

      <ProfileClient 
        profile={profile}
        careers={careers}
        allSubjects={allSubjects}
        selectedSubjectIds={selectedSubjectIds}
        availability={availability}
        message={message}
      />
    </main>
  )
}
