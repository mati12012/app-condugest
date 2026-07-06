export function formatearFechaVisual(fecha) {
  if (!fecha) return "Sin fecha";

  const fechaTexto = String(fecha).trim();
  const fechaLimpia = fechaTexto.split("T")[0].split(" ")[0];

  const partes = fechaLimpia.split("-");

  if (partes.length !== 3) {
    return fechaTexto;
  }

  const [anio, mes, dia] = partes;

  return `${dia}-${mes}-${anio}`;
}

export function formatearHoraVisual(hora) {
  if (!hora) return "Sin hora";

  const horaTexto = String(hora).trim();
  const horaLimpia = horaTexto.includes("T")
    ? horaTexto.split("T")[1]
    : horaTexto.includes(" ")
      ? horaTexto.split(" ")[1]
      : horaTexto;

  if (/^\d{4}-\d{2}-\d{2}$/.test(horaLimpia)) {
    return "Sin hora";
  }

  return horaLimpia ? horaLimpia.slice(0, 5) : "Sin hora";
}
