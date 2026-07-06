export const HORA_INICIO_ATENCION = "09:00";
export const HORA_FIN_ATENCION = "20:00";

const nombrePersonaRegex = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

export function normalizarTexto(valor) {
  if (typeof valor !== "string") return valor;
  return valor.trim().replace(/\s+/g, " ");
}

export function normalizarRutBasico(valor) {
  const texto = normalizarTexto(valor);

  if (!texto) return texto;

  const sinPuntosNiEspacios = String(texto)
    .replace(/\./g, "")
    .replace(/\s/g, "")
    .toUpperCase();

  if (sinPuntosNiEspacios.includes("-")) {
    const partes = sinPuntosNiEspacios.split("-");

    if (partes.length !== 2 || !partes[0] || !partes[1]) {
      return sinPuntosNiEspacios;
    }

    return `${partes[0]}-${partes[1]}`;
  }

  if (sinPuntosNiEspacios.length < 2) return sinPuntosNiEspacios;

  return `${sinPuntosNiEspacios.slice(0, -1)}-${sinPuntosNiEspacios.slice(-1)}`;
}

export function validarRutBasico(valor) {
  const normalizado = normalizarRutBasico(valor);

  if (!normalizado) return "El RUT es obligatorio";

  if (!/^\d{7,8}-[\dkK]$/i.test(normalizado)) {
    return "El RUT debe tener un formato valido. Ejemplo: 12.345.678-9";
  }

  return null;
}

export function validarNombrePersona(valor, campo) {
  const normalizado = normalizarTexto(valor);

  if (!normalizado) return `El ${campo} es obligatorio`;
  if (normalizado.length < 2) return `El ${campo} debe tener al menos 2 caracteres`;
  if (normalizado.length > 50) return `El ${campo} no puede superar los 50 caracteres`;
  if (/\d/.test(normalizado)) return `El ${campo} no puede contener numeros`;
  if (!nombrePersonaRegex.test(normalizado)) {
    return `El ${campo} solo puede contener letras, espacios simples, apostrofe y guion`;
  }

  return null;
}

export function validarTelefonoChile(valor, requerido = false) {
  const normalizado = normalizarTexto(valor)?.replace(/\s/g, "") || "";

  if (!normalizado) return requerido ? "El telefono es obligatorio" : null;
  if (/[a-z]/i.test(normalizado)) return "El telefono no puede contener letras";
  if (!/^\+569\d{8}$/.test(normalizado)) {
    return "El telefono debe tener el formato chileno +569XXXXXXXX. Ejemplo: +56912345678";
  }

  return null;
}

export function convertirHoraAMinutos(hora) {
  if (!hora) return null;
  const [horas, minutos] = String(hora).slice(0, 5).split(":").map(Number);
  return horas * 60 + minutos;
}

export function validarHorarioAtencion(horaInicio, horaFin) {
  const inicio = convertirHoraAMinutos(horaInicio);
  const fin = convertirHoraAMinutos(horaFin);
  const apertura = convertirHoraAMinutos(HORA_INICIO_ATENCION);
  const cierre = convertirHoraAMinutos(HORA_FIN_ATENCION);

  if (inicio === null) return "Debe ingresar la hora de inicio";
  if (fin === null) return "Debe ingresar la hora de termino";
  if (inicio < apertura) return `La hora de inicio debe ser mayor o igual a ${HORA_INICIO_ATENCION}`;
  if (fin > cierre) return `La hora de termino debe ser menor o igual a ${HORA_FIN_ATENCION}`;
  if (fin <= inicio) return "La hora de termino debe ser mayor que la hora de inicio";

  return null;
}
