export function obtenerNombreUsuario(usuario, fallback = "Usuario") {
  const nombreCompleto = usuario?.nombre_completo?.trim();

  if (nombreCompleto) return nombreCompleto;

  const nombreDesdePartes = [usuario?.nombre, usuario?.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (nombreDesdePartes) return nombreDesdePartes;

  return usuario?.correo || fallback;
}

export function obtenerCorreoUsuario(usuario, fallback = "Sin correo registrado") {
  return usuario?.correo || fallback;
}
