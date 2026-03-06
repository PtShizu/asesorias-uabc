'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { sendAppointmentRequestEmail, sendStatusChangeEmail } from '@/lib/mail'
import { formatDate, formatTime } from '@/lib/date-utils'

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

export async function createAppointment(data: {
  advisorId: string,
  subjectId: string,
  guestEmail: string,
  startAt: string,
  endAt: string
}) {
  const supabase = await createClient()

  const { data: appointment, error: insertError } = await supabase
    .from('appointments')
    .insert([{
      advisor_id: data.advisorId,
      subject_id: data.subjectId,
      guest_email: data.guestEmail,
      start_at: data.startAt,
      end_at: data.endAt,
      status: 'pending'
    }])
    .select('*, subjects(name), profiles:advisor_id(email, full_name)')
    .single()

  if (insertError) throw new Error(insertError.message)

  if (appointment) {
    // @ts-ignore
    const advisorEmail = appointment.profiles?.email
    // @ts-ignore
    const subjectName = appointment.subjects?.name
    const dateStr = formatDate(data.startAt)
    const startTimeStr = formatTime(data.startAt)
    const endTimeStr = formatTime(data.endAt)

    if (advisorEmail) {
      await sendAppointmentRequestEmail({
        advisorEmail,
        guestEmail: data.guestEmail,
        subjectName,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr
      })
    }
  }

  revalidatePath(`/advisor/${data.advisorId}`)
}

export async function updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'cancelled') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 1. Obtener detalles antes de actualizar para el correo
  const { data: app } = await supabase
    .from('appointments')
    .select('*, subjects(name), profiles:advisor_id(full_name)')
    .eq('id', appointmentId)
    .single()

  // 2. Actualizar
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('advisor_id', user.id)

  if (error) {
    console.error('Error updating appointment:', error.message)
    return
  }

  // 3. Enviar correo al alumno
  if (app) {
    // @ts-ignore
    const advisorName = app.profiles?.full_name || 'Asesor'
    // @ts-ignore
    const subjectName = app.subjects?.name || 'Asesoría'
    
    await sendStatusChangeEmail({
      guestEmail: app.guest_email,
      advisorName,
      subjectName,
      status,
      date: formatDate(app.start_at),
      startTime: formatTime(app.start_at)
    })
  }

  revalidatePath('/dashboard')
}

export async function deleteAppointment(appointmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', appointmentId)
    .eq('advisor_id', user.id) // Seguridad: solo borrar mis propias citas

  if (error) {
    console.error('Error deleting appointment:', error.message)
    return
  }

  revalidatePath('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
