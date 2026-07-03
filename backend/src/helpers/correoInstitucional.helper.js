export function normalizarTextoCorreo(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s.]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}

export function obtenerDominioProfesor() {
  return process.env.DOMINIO_PROFESORES || "condugest.cl";
}

export function generarCorreoBaseProfesor(nombre, apellido) {
  const nombreNormalizado = normalizarTextoCorreo(nombre);
  const apellidoNormalizado = normalizarTextoCorreo(apellido);

  return `${nombreNormalizado}.${apellidoNormalizado}`;
}

export function obtenerDominioAlumno() {
  return process.env.DOMINIO_ALUMNOS || "alumnos.condugest.cl";
}

export function generarCorreoBaseAlumno(nombre, apellido) {
  const nombreNormalizado = normalizarTextoCorreo(nombre);
  const apellidoNormalizado = normalizarTextoCorreo(apellido);

  return `${nombreNormalizado}.${apellidoNormalizado}`
    .replace(/\.+/g, ".")
    .replace(/^\.|\.$/g, "");
}