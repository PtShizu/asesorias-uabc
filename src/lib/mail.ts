import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendAppointmentRequestEmail({
  advisorEmail,
  guestEmail,
  subjectName,
  date,
  startTime,
  endTime,
}: {
  advisorEmail: string;
  guestEmail: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Asesorías UABC <onboarding@resend.dev>', // Usa tu dominio si tienes uno
      to: [advisorEmail],
      subject: `Nueva solicitud de asesoría: ${subjectName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #000;">Hola, tienes una nueva solicitud</h2>
          <p><strong>Estudiante:</strong> ${guestEmail}</p>
          <p><strong>Materia:</strong> ${subjectName}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Horario:</strong> ${startTime} - ${endTime}</p>
          <hr />
          <p>Puedes confirmar o rechazar esta solicitud desde tu <a href="${APP_URL}/dashboard">panel de control</a>.</p>
        </div>
      `,
    });

    if (error) {
      return console.error({ error });
    }

    return data;
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}

export async function sendStatusChangeEmail({
  guestEmail,
  advisorName,
  subjectName,
  status,
  date,
  startTime,
}: {
  guestEmail: string;
  advisorName: string;
  subjectName: string;
  status: 'confirmed' | 'cancelled';
  date: string;
  startTime: string;
}) {
  const isConfirmed = status === 'confirmed';
  const statusLabel = isConfirmed ? 'Confirmada' : 'Cancelada';
  const color = isConfirmed ? '#10b981' : '#ef4444';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Asesorías UABC <onboarding@resend.dev>',
      to: [guestEmail],
      subject: `Asesoría ${statusLabel}: ${subjectName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: ${color};">Tu asesoría ha sido ${statusLabel.toLowerCase()}</h2>
          <p><strong>Asesor:</strong> ${advisorName}</p>
          <p><strong>Materia:</strong> ${subjectName}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Hora:</strong> ${startTime}</p>
          <p>${isConfirmed 
            ? '¡Nos vemos pronto en la sesión!' 
            : 'Lamentablemente el asesor no podrá atenderte en este horario.'}</p>
        </div>
      `,
    });

    if (error) {
      return console.error({ error });
    }

    return data;
  } catch (error) {
    console.error('Error enviando correo:', error);
  }
}
