'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) {
    redirect('/login?error=' + encodeURIComponent(authError.message))
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: email,
          full_name: email.split('@')[0],
          bio: 'Nuevo asesor en la plataforma.'
        }
      ])

    if (profileError) {
      console.error('Error creating profile:', profileError.message)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const fullName = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const selectedSubjects = formData.getAll('subjects') as string[]

  // 1. Actualizar perfil básico
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      full_name: fullName, 
      bio: bio,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error updating profile:', profileError.message)
  }

  // 2. Actualizar materias (borrar y re-insertar)
  await supabase
    .from('advisor_subjects')
    .delete()
    .eq('advisor_id', user.id)

  if (selectedSubjects.length > 0) {
    const subjectsToInsert = selectedSubjects.map(id => ({
      advisor_id: user.id,
      subject_id: id
    }))
    await supabase.from('advisor_subjects').insert(subjectsToInsert)
  }

  // 3. Actualizar disponibilidad (borrar y re-insertar)
  const days = formData.getAll('availability_day') as string[]
  const starts = formData.getAll('availability_start') as string[]
  const ends = formData.getAll('availability_end') as string[]

  await supabase
    .from('availability')
    .delete()
    .eq('advisor_id', user.id)

  const availabilityToInsert = days.map((day, i) => ({
    advisor_id: user.id,
    day_of_week: parseInt(day),
    start_time: starts[i],
    end_time: ends[i]
  })).filter(slot => slot.start_time && slot.end_time)

  if (availabilityToInsert.length > 0) {
    const { error: availError } = await supabase
      .from('availability')
      .insert(availabilityToInsert)
    
    if (availError) console.error('Error saving availability:', availError.message)
  }

  revalidatePath('/profile')
  revalidatePath('/')
  redirect('/profile?message=Perfil actualizado correctamente')
}

export async function updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('advisor_id', user.id) // Seguridad extra

  if (error) {
    console.error('Error updating appointment:', error.message)
  }

  revalidatePath('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
