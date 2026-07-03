"use strict";

export function normalizarCorreo(correo) {
  return String(correo || "").trim().toLowerCase();
}

export function obtenerRolPorDominio(correo) {
  const correoNormalizado = normalizarCorreo(correo);

  if (correoNormalizado.endsWith("@admin.condugest.cl")) {
    return "secretaria";
  }

  if (correoNormalizado.endsWith("@alumnos.condugest.cl")) {
    return "alumno";
  }

  if (correoNormalizado.endsWith("@condugest.cl")) {
    return "profesor";
  }

  return null;
}