export const ESTADOS_FILTRO_CLASES = [
  { valor: "todas", etiqueta: "Todas" },
  { valor: "programada", etiqueta: "Programadas" },
  { valor: "realizada", etiqueta: "Realizadas" },
  { valor: "cancelada", etiqueta: "Canceladas" },
];

export const CLASES_POR_PAGINA = 5;

export function obtenerFechaHoy() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

export function formatearFechaInput(fecha) {
  if (!fecha) return "";

  const fechaTexto = String(fecha);

  if (fechaTexto.includes("T")) {
    return fechaTexto.split("T")[0];
  }

  return fechaTexto;
}

export function formatearHora(hora) {
  if (!hora) return "";
  return String(hora).slice(0, 5);
}

export function normalizarEstado(estado) {
  return String(estado || "").toLowerCase();
}

export function obtenerClaseEstado(estado) {
  const estadoNormalizado = normalizarEstado(estado);

  if (estadoNormalizado === "programada") {
    return "bg-blue-100 text-blue-700";
  }

  if (estadoNormalizado === "realizada") {
    return "bg-green-100 text-green-700";
  }

  if (estadoNormalizado === "cancelada") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function mostrarEstado(estado) {
  const estadoNormalizado = normalizarEstado(estado);

  if (estadoNormalizado === "programada") return "Programada";
  if (estadoNormalizado === "realizada") return "Realizada";
  if (estadoNormalizado === "cancelada") return "Cancelada";

  return estado || "Sin estado";
}

export function obtenerNombreAlumno(clase) {
  return `${clase.alumno_nombre || ""} ${clase.alumno_apellido || ""}`.trim();
}

export function obtenerVehiculo(clase) {
  const patente = clase.vehiculo_patente || "Sin patente";
  const marcaModelo = `${clase.vehiculo_marca || ""} ${clase.vehiculo_modelo || ""}`.trim();

  return marcaModelo ? `${patente} - ${marcaModelo}` : patente;
}

export function obtenerTextoBusquedaClase(clase) {
  return [
    obtenerNombreAlumno(clase),
    clase.vehiculo_patente,
    clase.sede,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function ordenarClases(clases = []) {
  return [...clases].sort((a, b) => {
    const fechaA = formatearFechaInput(a.fecha);
    const fechaB = formatearFechaInput(b.fecha);

    if (fechaA !== fechaB) {
      return fechaA.localeCompare(fechaB);
    }

    return String(a.hora_inicio || "").localeCompare(String(b.hora_inicio || ""));
  });
}

export function obtenerResumenClases(clases = []) {
  const fechaHoy = obtenerFechaHoy();
  const clasesOrdenadas = ordenarClases(clases);

  const clasesHoy = clasesOrdenadas.filter(
    (clase) => formatearFechaInput(clase.fecha) === fechaHoy
  );

  const proximasClases = clasesOrdenadas.filter((clase) => {
    const fechaClase = formatearFechaInput(clase.fecha);
    const estado = normalizarEstado(clase.estado);

    return fechaClase >= fechaHoy && estado !== "realizada" && estado !== "cancelada";
  });

  const clasesRealizadas = clasesOrdenadas.filter(
    (clase) => normalizarEstado(clase.estado) === "realizada"
  );

  const clasesCanceladas = clasesOrdenadas.filter(
    (clase) => normalizarEstado(clase.estado) === "cancelada"
  );

  return {
    fechaHoy,
    clasesOrdenadas,
    clasesHoy,
    proximasClases,
    clasesRealizadas,
    clasesCanceladas,
  };
}
