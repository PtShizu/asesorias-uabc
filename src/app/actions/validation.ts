'use server'

import dns from 'dns/promises'

export async function validateEmailDomain(email: string) {
  const parts = email.split('@')
  if (parts.length !== 2) return { valid: false, message: 'Formato de correo inválido' }
  
  const domain = parts[1].toLowerCase()
  
  // Sugerencia para errores comunes
  if (domain === 'uabc.edu') {
    return { valid: false, message: 'Dominio incorrecto. ¿Quisiste decir @uabc.edu.mx?' }
  }

  // Lista de dominios permitidos
  const allowedDomain = 'uabc.edu.mx'
  const isInstitutional = domain === allowedDomain || domain.endsWith('.' + allowedDomain)
  
  if (!isInstitutional) {
     return { valid: false, message: 'Por favor utiliza tu correo institucional (@uabc.edu.mx)' }
  }

  try {
    const mxRecords = await dns.resolveMx(domain)
    if (mxRecords && mxRecords.length > 0) {
      return { valid: true }
    } else {
      return { valid: false, message: `El dominio ${domain} no parece poder recibir correos.` }
    }
  } catch (error) {
    console.error('DNS validation error:', error)
    return { valid: false, message: `No se pudo verificar el dominio ${domain}.` }
  }
}
