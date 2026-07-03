import React, { useEffect, useMemo, useState } from 'react';
import { formatearFechaVisual } from '../utils/formatearFecha';

const PanelPrincipal = ({ cambiarVista }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [clasesPracticas, setClasesPracticas] = useState([]);
  const [reservasSalas, setReservasSalas] = useState([]);
  const [salas, setSalas] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const obtenerFechaHoy = () => {
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  };

  useEffect(() => {
    cargarDatosPanel();
  }, []);

  const obtenerData = (respuestaServidor) => {
    if (Array.isArray(respuestaServidor)) {
      return respuestaServidor;
    }

    return respuestaServidor.data || [];
  };

  const cargarDatosPanel = async () => {
    try {
      setCargando(true);
      setError('');

      const [
        resAlumnos,
        resProfesores,
        resClasesPracticas,
        resReservasSalas,
        resSalas
      ] = await Promise.all([
        fetch(`${import.meta.env.VITE_BASE_URL}/alumnos`),
        fetch(`${import.meta.env.VITE_BASE_URL}/profesores`),
        fetch(`${import.meta.env.VITE_BASE_URL}/clases-practicas`),
        fetch(`${import.meta.env.VITE_BASE_URL}/reservas-salas`),
        fetch(`${import.meta.env.VITE_BASE_URL}/salas-psicotecnicas`)
      ]);

      const dataAlumnos = await resAlumnos.json();
      const dataProfesores = await resProfesores.json();
      const dataClasesPracticas = await resClasesPracticas.json();
      const dataReservasSalas = await resReservasSalas.json();
      const dataSalas = await resSalas.json();

      if (!resAlumnos.ok) {
        throw new Error(dataAlumnos.message || 'No se pudieron obtener los alumnos');
      }

      if (!resProfesores.ok) {
        throw new Error(dataProfesores.message || 'No se pudieron obtener los profesores');
      }

      if (!resClasesPracticas.ok) {
        throw new Error(dataClasesPracticas.message || 'No se pudieron obtener las clases prácticas');
      }

      if (!resReservasSalas.ok) {
        throw new Error(dataReservasSalas.message || 'No se pudieron obtener las reservas psicotécnicas');
      }

      if (!resSalas.ok) {
        throw new Error(dataSalas.message || 'No se pudieron obtener las salas psicotécnicas');
      }

      setAlumnos(obtenerData(dataAlumnos));
      setProfesores(obtenerData(dataProfesores));
      setClasesPracticas(obtenerData(dataClasesPracticas));
      setReservasSalas(obtenerData(dataReservasSalas));
      setSalas(obtenerData(dataSalas));
    } catch (error) {
      console.error(error);
      setError(error.message || 'Error al cargar el panel principal');
    } finally {
      setCargando(false);
    }
  };

  const formatearFechaInput = (fecha) => {
    if (!fecha) return '';

    const fechaTexto = String(fecha);

    if (fechaTexto.includes('T')) {
      return fechaTexto.split('T')[0];
    }

    return fechaTexto;
  };

  const formatearFechaVisual = (fecha) => {
    if (!fecha) return '';

    const fechaLimpia = formatearFechaInput(fecha);
    const [anio, mes, dia] = fechaLimpia.split('-');

    return `${dia}-${mes}-${anio}`;
  };

  const formatearHora = (hora) => {
    if (!hora) return '';
    return String(hora).slice(0, 5);
  };

  const normalizarEstado = (estado) => {
    return String(estado || '').toLowerCase();
  };

  const obtenerClaseEstado = (estado) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (
      estadoNormalizado === 'programada' ||
      estadoNormalizado === 'reservada' ||
      estadoNormalizado === 'confirmada'
    ) {
      return 'bg-green-100 text-green-700';
    }

    if (
      estadoNormalizado === 'pendiente' ||
      estadoNormalizado === 'en curso'
    ) {
      return 'bg-yellow-100 text-yellow-700';
    }

    if (estadoNormalizado === 'realizada') {
      return 'bg-blue-100 text-blue-700';
    }

    if (estadoNormalizado === 'cancelada') {
      return 'bg-red-100 text-red-700';
    }

    return 'bg-slate-100 text-slate-700';
  };

  const mostrarEstado = (estado) => {
    if (!estado) return 'Sin estado';

    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === 'programada') return 'Programada';
    if (estadoNormalizado === 'realizada') return 'Realizada';
    if (estadoNormalizado === 'cancelada') return 'Cancelada';
    if (estadoNormalizado === 'reservada') return 'Reservada';
    if (estadoNormalizado === 'pendiente') return 'Pendiente';

    return estado;
  };

  const salasPorId = useMemo(() => {
    const mapa = new Map();

    salas.forEach((sala) => {
      mapa.set(Number(sala.id_sala), sala);
    });

    return mapa;
  }, [salas]);

  const eventosAgenda = useMemo(() => {
    const eventosPracticos = clasesPracticas.map((clase) => ({
      id: `practica-${clase.id_clase_practica}`,
      tipo: 'Práctica',
      fecha: formatearFechaVisual(clase.fecha),
      hora_inicio: clase.hora_inicio,
      hora_fin: clase.hora_fin,
      responsable: `${clase.profesor_nombre || ''} ${clase.profesor_apellido || ''}`.trim(),
      sede: clase.sede || 'Sin sede',
      estado: clase.estado || 'Programada',
      detalle: `${clase.alumno_nombre || ''} ${clase.alumno_apellido || ''}`.trim(),
      id_origen: clase.id_clase_practica,
      vistaDetalle: 'verClasePracticaAgenda'
    }));

    const eventosPsicotecnicos = reservasSalas.map((reserva) => {
      const sala = salasPorId.get(Number(reserva.id_sala));

      return {
        id: `psicotecnica-${reserva.id_reserva}`,
        tipo: 'Psicotécnica',
        fecha: formatearFechaVisual(reserva.fecha),
        hora_inicio: reserva.hora_inicio,
        hora_fin: reserva.hora_fin,
        responsable: sala?.nombre || `Sala ${reserva.id_sala}`,
        sede: sala?.sede || 'Sala psicotécnica',
        estado: reserva.estado || 'Reservada',
        detalle: `${reserva.cantidad_alumnos || 0} alumno(s)`,
        id_origen: reserva.id_reserva,
        vistaDetalle: null
      };
    });

    return [...eventosPracticos, ...eventosPsicotecnicos].sort((a, b) => {
      if (a.fecha !== b.fecha) {
        return a.fecha.localeCompare(b.fecha);
      }

      return String(a.hora_inicio).localeCompare(String(b.hora_inicio));
    });
  }, [clasesPracticas, reservasSalas, salasPorId]);

  const fechaHoy = obtenerFechaHoy();

  const eventosHoy = eventosAgenda
    .filter((evento) => evento.fecha === fechaHoy)
    .slice(0, 5);

  const solicitudesRecientes = useMemo(() => {
    const reservasPendientes = reservasSalas
      .filter((reserva) => {
        const estado = normalizarEstado(reserva.estado);
        return estado === 'pendiente' || estado === 'reservada';
      })
      .map((reserva) => {
        const sala = salasPorId.get(Number(reserva.id_sala));

        return {
          id: `reserva-${reserva.id_reserva}`,
          titulo: 'Reserva de sala psicotécnica',
          descripcion: `${sala?.nombre || `Sala ${reserva.id_sala}`} · ${formatearFechaVisual(reserva.fecha)}`,
          estado: reserva.estado || 'Pendiente'
        };
      });

    const clasesCanceladas = clasesPracticas
      .filter((clase) => normalizarEstado(clase.estado) === 'cancelada')
      .map((clase) => ({
        id: `clase-${clase.id_clase_practica}`,
        titulo: 'Clase práctica cancelada',
        descripcion: `${clase.alumno_nombre || ''} ${clase.alumno_apellido || ''} · ${formatearFechaVisual(clase.fecha)}`,
        estado: clase.estado
      }));

    return [...reservasPendientes, ...clasesCanceladas].slice(0, 3);
  }, [reservasSalas, clasesPracticas, salasPorId]);

  const alumnosActivos = alumnos.filter((alumno) => alumno.estado !== false).length;

  const clasesHoy = eventosAgenda.filter((evento) => evento.fecha === fechaHoy).length;

  const profesoresActivos = profesores.filter((profesor) => profesor.estado === true).length;

  const solicitudesPendientes = solicitudesRecientes.length;

  if (cargando) {
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando panel principal...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
          {error}
        </div>

        <button
          type="button"
          onClick={cargarDatosPanel}
          className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-7">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Panel de Secretaría
          </h1>

          <p className="text-slate-500 mt-2">
            Gestión operativa diaria de la escuela
          </p>
        </div>

        <button
          type="button"
          onClick={() => cambiarVista('registrarClasePractica')}
          className="px-6 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 active:scale-95 transition-all"
        >
          + Nueva gestión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {alumnosActivos}
          </p>

          <p className="text-slate-600 mt-4 text-lg">
            Alumnos activos
          </p>

          <p className="text-purple-600 mt-4 font-semibold">
            Registro actualizado
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {clasesHoy}
          </p>

          <p className="text-slate-600 mt-4 text-lg">
            Actividades de hoy
          </p>

          <p className="text-green-600 mt-4 font-semibold">
            {eventosHoy.length} visibles en agenda
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {profesoresActivos}
          </p>

          <p className="text-slate-600 mt-4 text-lg">
            Profesores activos
          </p>

          <p className="text-green-600 mt-4 font-semibold">
            Disponibles para asignación
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <p className="text-5xl font-bold text-slate-900">
            {solicitudesPendientes}
          </p>

          <p className="text-slate-600 mt-4 text-lg">
            Solicitudes pendientes
          </p>

          <p className="text-red-600 mt-4 font-semibold">
            Requieren revisión
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_430px] gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Agenda del día
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Hoy: {formatearFechaVisual(fechaHoy)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => cambiarVista('agenda')}
              className="text-blue-700 font-bold hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-bold">Hora</th>
                  <th className="py-3 pr-4 font-bold">Tipo</th>
                  <th className="py-3 pr-4 font-bold">Responsable</th>
                  <th className="py-3 pr-4 font-bold">Sede/Recurso</th>
                  <th className="py-3 pr-4 font-bold">Estado</th>
                </tr>
              </thead>

              <tbody>
                {eventosHoy.map((evento) => (
                  <tr
                    key={evento.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-4 pr-4 font-semibold text-slate-900">
                      {formatearHora(evento.hora_inicio)}
                    </td>

                    <td className="py-4 pr-4 text-slate-700">
                      {evento.tipo}
                    </td>

                    <td className="py-4 pr-4 text-slate-700">
                      {evento.responsable || 'Sin responsable'}
                    </td>

                    <td className="py-4 pr-4 text-slate-700">
                      {evento.sede}
                    </td>

                    <td className="py-4 pr-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${obtenerClaseEstado(evento.estado)}`}>
                        {mostrarEstado(evento.estado)}
                      </span>
                    </td>
                  </tr>
                ))}

                {eventosHoy.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No hay actividades registradas para hoy.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
          <div className="flex items-center justify-between mb-7">
            <h2 className="text-2xl font-bold text-slate-900">
              Solicitudes recientes
            </h2>

            <button
              type="button"
              onClick={() => cambiarVista('agenda')}
              className="text-blue-700 font-bold hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-4">
            {solicitudesRecientes.map((solicitud) => (
              <div
                key={solicitud.id}
                className="border border-slate-200 rounded-xl p-5 bg-slate-50"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {solicitud.titulo}
                </h3>

                <p className="text-slate-500 mt-2">
                  {solicitud.descripcion}
                </p>

                <span className={`inline-flex mt-4 px-3 py-1 rounded-full text-sm font-bold ${obtenerClaseEstado(solicitud.estado)}`}>
                  {mostrarEstado(solicitud.estado)}
                </span>
              </div>
            ))}

            {solicitudesRecientes.length === 0 && (
              <div className="border border-green-200 bg-green-50 text-green-700 rounded-xl p-5 font-medium">
                No hay solicitudes recientes pendientes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelPrincipal;