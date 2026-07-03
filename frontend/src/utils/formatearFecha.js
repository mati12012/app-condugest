export function formatearFechaVisual(fecha) {
  if (!fecha) return "Sin fecha";

  const fechaTexto = String(fecha);

  const fechaLimpia = fechaTexto.includes("T")
    ? fechaTexto.split("T")[0]
    : fechaTexto;

  const partes = fechaLimpia.split("-");

  if (partes.length !== 3) {
    return fechaTexto;
  }

  const [anio, mes, dia] = partes;

  return `${dia}-${mes}-${anio}`;
}