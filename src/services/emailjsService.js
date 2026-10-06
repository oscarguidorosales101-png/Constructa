/**
 * CONSTRUCTA - Servicio de Notificaciones EmailJS
 * 
 * Configuración segura mediante variables de entorno Vite:
 * - VITE_EMAILJS_SERVICE_ID
 * - VITE_EMAILJS_TEMPLATE_ID
 * - VITE_EMAILJS_PUBLIC_KEY
 * 
 * Si las variables no están configuradas en .env o .env.local, el servicio
 * opera en modo de persistencia local / simulado sin romper la interfaz de usuario.
 */

export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
};

export const isEmailJSConfigured = () => {
  return Boolean(
    emailjsConfig.serviceId &&
    emailjsConfig.templateId &&
    emailjsConfig.publicKey
  );
};

/**
 * Envía un correo electrónico a través de la API REST oficial de EmailJS
 * @param {Object} data Datos del formulario de contacto
 * @returns {Promise<{success: boolean, simulated?: boolean, error?: string}>}
 */
export async function sendContactEmail(data) {
  const now = new Date();
  const fecha = now.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const hora = now.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const templateParams = {
    from_name: data.nombre || 'Contacto Web',
    from_email: data.email || '',
    phone: data.telefono || 'No especificado',
    requirement_type: data.asunto || 'Cotización de Obra Nueva',
    subject: `[CONSTRUCTA] Nuevo mensaje desde el sitio web — ${data.asunto || 'Requerimiento'}`,
    message: data.mensaje || '',
    date: fecha,
    time: hora,
    empresa: data.empresa || 'No especificada',
    submitted_at: `${fecha} a las ${hora}`
  };

  // Si no hay credenciales configuradas en el entorno, reportamos el fallo de manera honesta
  if (!isEmailJSConfigured()) {
    if (import.meta.env.DEV) {
      console.warn('[EmailJS] Variables de entorno VITE_EMAILJS_* no configuradas.');
    }
    return {
      success: false,
      error: 'El mensaje no pudo enviarse. Inténtalo nuevamente.'
    };
  }

  // Si las credenciales están presentes, ejecutar petición HTTP a EmailJS
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: emailjsConfig.serviceId,
        template_id: emailjsConfig.templateId,
        user_id: emailjsConfig.publicKey,
        template_params: templateParams
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (import.meta.env.DEV) {
        console.error('[EmailJS] Error HTTP desde EmailJS:', response.status, errorText);
      }
      return {
        success: false,
        error: `Error de envío (${response.status})`
      };
    }

    return {
      success: true,
      simulated: false
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('[EmailJS] Error en la conexión de red:', err);
    }
    return {
      success: false,
      error: err.message || 'Error de conexión'
    };
  }
}

export default {
  emailjsConfig,
  isEmailJSConfigured,
  sendContactEmail
};
