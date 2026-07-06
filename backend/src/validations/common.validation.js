"use strict";

export const HORA_INICIO_ATENCION = "09:00";
export const HORA_FIN_ATENCION = "20:00";

const nombrePersonaRegex = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const cuerpo = sinPuntosNiEspacios.slice(0, -1);
  const digitoVerificador = sinPuntosNiEspacios.slice(-1);

  return `${cuerpo}-${digitoVerificador}`;
}

export function normalizarTelefonoChile(valor) {
  const texto = normalizarTexto(valor);

  if (!texto) return texto;

  return String(texto).replace(/\s/g, "");
}

export function normalizarEmail(valor) {
  const texto = normalizarTexto(valor);

  if (!texto) return texto;

  return String(texto).toLowerCase();
}

export function validarNombrePersona(valor, campo = "nombre", requerido = true) {
  const normalizado = normalizarTexto(valor);
  const etiqueta = campo || "nombre";

  if (!normalizado) {
    return {
      valido: !requerido,
      valor: normalizado,
      mensaje: `El ${etiqueta} es obligatorio.`,
    };
  }

  if (normalizado.length < 2) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: `El ${etiqueta} debe tener al menos 2 caracteres.`,
    };
  }

  if (normalizado.length > 50) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: `El ${etiqueta} no puede superar los 50 caracteres.`,
    };
  }

  if (/\d/.test(normalizado)) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: `El ${etiqueta} no puede contener numeros.`,
    };
  }

  if (!nombrePersonaRegex.test(normalizado)) {
    return {
      valido: false,
      valor: normalizado,
      mensaje:
        `El ${etiqueta} solo puede contener letras, espacios simples, apostrofe y guion.`,
    };
  }

  return {
    valido: true,
    valor: normalizado,
    mensaje: null,
  };
}

export function validarTelefonoChile(valor, requerido = false) {
  const normalizado = normalizarTelefonoChile(valor);

  if (!normalizado) {
    return {
      valido: !requerido,
      valor: normalizado,
      mensaje: "El telefono es obligatorio.",
    };
  }

  if (/[a-z]/i.test(normalizado)) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: "El telefono no puede contener letras.",
    };
  }

  if (normalizado.length !== 12) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: "El telefono debe tener el formato +56912345678.",
    };
  }

  if (!/^\+569\d{8}$/.test(normalizado)) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: "El telefono debe tener el formato chileno +569XXXXXXXX.",
    };
  }

  return {
    valido: true,
    valor: normalizado,
    mensaje: null,
  };
}

export function validarRutBasico(valor, requerido = true) {
  const normalizado = normalizarRutBasico(valor);

  if (!normalizado) {
    return {
      valido: !requerido,
      valor: normalizado,
      mensaje: "El RUT es obligatorio.",
    };
  }

  if (!/^\d{7,8}-[\dkK]$/i.test(normalizado)) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: "El RUT debe tener un formato valido, por ejemplo 12.345.678-9.",
    };
  }

  return {
    valido: true,
    valor: normalizado.toUpperCase(),
    mensaje: null,
  };
}

export function validarEmail(valor, requerido = false, campo = "correo") {
  const normalizado = normalizarEmail(valor);
  const etiqueta = campo || "correo";

  if (!normalizado) {
    return {
      valido: !requerido,
      valor: normalizado,
      mensaje: `El ${etiqueta} es obligatorio.`,
    };
  }

  if (!emailRegex.test(normalizado)) {
    return {
      valido: false,
      valor: normalizado,
      mensaje: `El ${etiqueta} debe tener un formato valido.`,
    };
  }

  return {
    valido: true,
    valor: normalizado,
    mensaje: null,
  };
}

export function convertirHoraAMinutos(hora) {
  if (!hora) return null;

  const horaLimpia = String(hora).slice(0, 5);

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(horaLimpia)) {
    return null;
  }

  const [horas, minutos] = horaLimpia.split(":").map(Number);

  return horas * 60 + minutos;
}

export function validarHorarioAtencion(horaInicio, horaFin) {
  const minutosInicio = convertirHoraAMinutos(horaInicio);
  const minutosFin = convertirHoraAMinutos(horaFin);
  const minutosApertura = convertirHoraAMinutos(HORA_INICIO_ATENCION);
  const minutosCierre = convertirHoraAMinutos(HORA_FIN_ATENCION);

  if (minutosInicio === null || minutosFin === null) {
    return {
      valido: false,
      mensaje: "Las horas deben tener formato HH:mm.",
    };
  }

  if (minutosInicio < minutosApertura) {
    return {
      valido: false,
      mensaje: `La hora de inicio debe ser mayor o igual a ${HORA_INICIO_ATENCION}.`,
    };
  }

  if (minutosFin > minutosCierre) {
    return {
      valido: false,
      mensaje: `La hora de termino debe ser menor o igual a ${HORA_FIN_ATENCION}.`,
    };
  }

  if (minutosFin <= minutosInicio) {
    return {
      valido: false,
      mensaje: "La hora de termino debe ser mayor que la hora de inicio.",
    };
  }

  return {
    valido: true,
    mensaje: null,
  };
}
