import { useMemo, useState } from "react";
import { formatearFechaVisual } from "../../utils/formatearFecha";
import { EstadoClase } from "./profesorPanel.components";
import {
  formatearFechaInput,
  formatearHora,
  normalizarEstado,
  obtenerFechaHoy,
  obtenerNombreAlumno,
  obtenerVehiculo,
  ordenarClases,
} from "./profesorPanel.helpers";

const DIAS_SEMANA_PROFESOR = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

const HORAS_AGENDA_PROFESOR = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

function crearFechaLocal(fechaTexto) {
  return new Date(`${fechaTexto}T00:00:00`);
}

function convertirFechaTexto(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerInicioSemana(fechaTexto) {
  const fecha = crearFechaLocal(fechaTexto);
  const diaSemana = fecha.getDay();
  const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;

  fecha.setDate(fecha.getDate() + diferencia);

  return convertirFechaTexto(fecha);
}

function obtenerFechaDesdeInicio(inicioSemana, diasASumar) {
  const fecha = crearFechaLocal(inicioSemana);
  fecha.setDate(fecha.getDate() + diasASumar);

  return convertirFechaTexto(fecha);
}

function obtenerHoraBloque(hora) {
  const horaFormateada = formatearHora(hora);
  const [horas] = horaFormateada.split(":");

  return horas ? `${horas}:00` : "";
}

function obtenerClaseAgenda(estado) {
  const estadoNormalizado = normalizarEstado(estado);

  if (estadoNormalizado === "programada") {
    return "bg-blue-50 border-blue-200 text-blue-900";
  }

  if (estadoNormalizado === "realizada") {
    return "bg-green-50 border-green-200 text-green-900";
  }

  if (estadoNormalizado === "cancelada") {
    return "bg-red-50 border-red-200 text-red-900";
  }

  return "bg-slate-50 border-slate-200 text-slate-900";
}

function AgendaProfesor({ clases }) {
  const [fechaBase, setFechaBase] = useState(obtenerFechaHoy());

  const inicioSemana = obtenerInicioSemana(fechaBase);

  const diasSemana = useMemo(() => {
    return DIAS_SEMANA_PROFESOR.map((nombre, index) => ({
      nombre,
      fecha: obtenerFechaDesdeInicio(inicioSemana, index),
    }));
  }, [inicioSemana]);

  const clasesSemana = useMemo(() => {
    const fechasSemana = diasSemana.map((dia) => dia.fecha);

    return ordenarClases(clases).filter((clase) =>
      fechasSemana.includes(formatearFechaInput(clase.fecha))
    );
  }, [clases, diasSemana]);

  const cambiarSemana = (cantidadSemanas) => {
    const fecha = crearFechaLocal(fechaBase);
    fecha.setDate(fecha.getDate() + cantidadSemanas * 7);
    setFechaBase(convertirFechaTexto(fecha));
  };

  const volverSemanaActual = () => {
    setFechaBase(obtenerFechaHoy());
  };

  const obtenerClasesPorCelda = (fecha, hora) => {
    return clasesSemana.filter((clase) => {
      return (
        formatearFechaInput(clase.fecha) === fecha &&
        obtenerHoraBloque(clase.hora_inicio) === hora
      );
    });
  };

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Agenda semanal
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Semana del {formatearFechaVisual(diasSemana[0].fecha)} al{" "}
              {formatearFechaVisual(diasSemana[5].fecha)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cambiarSemana(-1)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 transition-all"
            >
              Semana anterior
            </button>

            <button
              type="button"
              onClick={volverSemanaActual}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 active:scale-95 transition-all"
            >
              Semana actual
            </button>

            <button
              type="button"
              onClick={() => cambiarSemana(1)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 transition-all"
            >
              Semana siguiente
            </button>
          </div>
        </div>

        {clasesSemana.length === 0 && (
          <div className="mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-500">
            No tienes clases practicas asignadas para esta semana.
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="min-w-[1080px] max-h-[660px] overflow-auto border border-slate-200 rounded-xl">
          <div className="grid grid-cols-[96px_repeat(6,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <div className="p-4 font-bold text-slate-800 text-center">
              Hora
            </div>

            {diasSemana.map((dia) => (
              <div
                key={dia.fecha}
                className="p-4 font-bold text-slate-800 text-center border-l border-slate-200"
              >
                <p>{dia.nombre}</p>
                <p className="text-xs text-slate-400 font-medium">
                  {formatearFechaVisual(dia.fecha)}
                </p>
              </div>
            ))}
          </div>

          {HORAS_AGENDA_PROFESOR.map((hora) => (
            <div
              key={hora}
              className="grid grid-cols-[96px_repeat(6,1fr)] min-h-[118px] border-b border-slate-200 last:border-b-0"
            >
              <div className="p-4 bg-slate-50 font-bold text-slate-800 text-center border-r border-slate-200">
                {hora}
              </div>

              {diasSemana.map((dia) => {
                const clasesCelda = obtenerClasesPorCelda(dia.fecha, hora);

                return (
                  <div
                    key={`${dia.fecha}-${hora}`}
                    className="p-2 border-r border-slate-200 last:border-r-0"
                  >
                    <div className="space-y-2">
                      {clasesCelda.map((clase, index) => (
                        <article
                          key={clase.id_clase_practica || `${dia.fecha}-${hora}-${index}`}
                          className={`rounded-xl border p-3 text-sm shadow-sm ${obtenerClaseAgenda(clase.estado)}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold leading-snug">
                              {obtenerNombreAlumno(clase) || "Sin alumno"}
                            </p>
                            <EstadoClase estado={clase.estado} />
                          </div>

                          <p className="text-xs mt-2 font-semibold opacity-80">
                            {formatearHora(clase.hora_inicio)} - {formatearHora(clase.hora_fin)}
                          </p>

                          <p className="text-xs mt-1 opacity-80">
                            {obtenerVehiculo(clase)}
                          </p>

                          <p className="text-xs mt-1 opacity-80">
                            {clase.sede || "Sin sede"}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AgendaProfesor;
