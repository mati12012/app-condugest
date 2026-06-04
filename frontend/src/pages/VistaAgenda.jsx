import React, { useEffect, useMemo, useState } from 'react';

const VistaAgenda = ({ cambiarVista }) => {
    const obtenerFechaHoy = () => {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    };

    const obtenerInicioSemana = (fechaTexto) => {
        const fecha = new Date(`${fechaTexto}T00:00:00`);
        const diaSemana = fecha.getDay();
        const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;

        fecha.setDate(fecha.getDate() + diferencia);

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    };

    const [clasesPracticas, setClasesPracticas] = useState([]);
    const [reservasSalas, setReservasSalas] = useState([]);
    const [salas, setSalas] = useState([]);

    const [fechaBase, setFechaBase] = useState(obtenerFechaHoy());
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroSede, setFiltroSede] = useState('todas');
    const [filtroProfesor, setFiltroProfesor] = useState('todos');
    const [filtroEstado, setFiltroEstado] = useState('todos');

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        obtenerDatosAgenda();
    }, []);

    const obtenerDatosAgenda = async () => {
        try {
            setCargando(true);

            const [resClasesPracticas, resReservasSalas, resSalas] = await Promise.all([
                fetch(`${import.meta.env.VITE_BASE_URL}/clases-practicas`),
                fetch(`${import.meta.env.VITE_BASE_URL}/reservas-salas`),
                fetch(`${import.meta.env.VITE_BASE_URL}/salas-psicotecnicas`)
            ]);

            const dataClasesPracticas = await resClasesPracticas.json();
            const dataReservasSalas = await resReservasSalas.json();
            const dataSalas = await resSalas.json();

            if (!resClasesPracticas.ok) {
                throw new Error(dataClasesPracticas.message || 'No se pudieron obtener las clases prácticas');
            }

            if (!resReservasSalas.ok) {
                throw new Error(dataReservasSalas.message || 'No se pudieron obtener las reservas de salas');
            }

            if (!resSalas.ok) {
                throw new Error(dataSalas.message || 'No se pudieron obtener las salas psicotécnicas');
            }

            setClasesPracticas(dataClasesPracticas.data || []);
            setReservasSalas(dataReservasSalas.data || []);
            setSalas(dataSalas.data || []);
            setError(null);
        } catch (error) {
            console.error(error);
            setError(error.message || 'Error de conexión con el servidor');
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

    const obtenerHoraBloque = (hora) => {
        if (!hora) return '';

        const horaFormateada = formatearHora(hora);
        const [horas] = horaFormateada.split(':');

        return `${horas}:00`;
    };

    const normalizarEstado = (estado) => {
        return String(estado || '').toLowerCase();
    };

    const mostrarEstado = (estado) => {
        const estadoNormalizado = normalizarEstado(estado);

        if (estadoNormalizado === 'programada') return 'Programada';
        if (estadoNormalizado === 'realizada') return 'Realizada';
        if (estadoNormalizado === 'cancelada') return 'Cancelada';
        if (estadoNormalizado === 'reservada') return 'Reservada';
        if (estadoNormalizado === 'pendiente') return 'Pendiente';

        return estado || 'Sin estado';
    };

    const obtenerFechaDesdeInicio = (inicioSemana, diasASumar) => {
        const fecha = new Date(`${inicioSemana}T00:00:00`);
        fecha.setDate(fecha.getDate() + diasASumar);

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    };

    const cambiarSemana = (cantidadSemanas) => {
        const fecha = new Date(`${fechaBase}T00:00:00`);
        fecha.setDate(fecha.getDate() + cantidadSemanas * 7);

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        setFechaBase(`${anio}-${mes}-${dia}`);
    };

    const inicioSemana = obtenerInicioSemana(fechaBase);

    const diasSemana = [
        { nombre: 'Lunes', fecha: obtenerFechaDesdeInicio(inicioSemana, 0) },
        { nombre: 'Martes', fecha: obtenerFechaDesdeInicio(inicioSemana, 1) },
        { nombre: 'Miércoles', fecha: obtenerFechaDesdeInicio(inicioSemana, 2) },
        { nombre: 'Jueves', fecha: obtenerFechaDesdeInicio(inicioSemana, 3) },
        { nombre: 'Viernes', fecha: obtenerFechaDesdeInicio(inicioSemana, 4) },
        { nombre: 'Sábado', fecha: obtenerFechaDesdeInicio(inicioSemana, 5) },
    ];

    const horasAgenda = [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
    ];

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
            id_origen: clase.id_clase_practica,
            tipo: 'practica',
            titulo: 'Práctica',
            fecha: formatearFechaInput(clase.fecha),
            hora_inicio: clase.hora_inicio,
            hora_fin: clase.hora_fin,
            estado: clase.estado,
            sede: clase.sede,
            id_profesor: clase.id_profesor,
            principal: `${clase.alumno_nombre || ''} ${clase.alumno_apellido || ''}`.trim(),
            secundario: `Profesor: ${clase.profesor_nombre || ''} ${clase.profesor_apellido || ''}`.trim(),
            detalle: `${clase.vehiculo_patente || ''} · ${clase.vehiculo_marca || ''} ${clase.vehiculo_modelo || ''}`.trim(),
            vistaDetalle: 'verClasePractica',
        }));

        const eventosPsicotecnicos = reservasSalas.map((reserva) => {
            const sala = salasPorId.get(Number(reserva.id_sala));

            return {
                id: `psicotecnica-${reserva.id_reserva}`,
                id_origen: reserva.id_reserva,
                tipo: 'psicotecnica',
                titulo: 'Psicotécnica',
                fecha: formatearFechaInput(reserva.fecha),
                hora_inicio: reserva.hora_inicio,
                hora_fin: reserva.hora_fin,
                estado: reserva.estado,
                sede: sala?.sede || '',
                id_profesor: null,
                principal: sala?.nombre || `Sala ${reserva.id_sala}`,
                secundario: `${reserva.cantidad_alumnos} alumno(s)`,
                detalle: sala ? `${sala.sede} · Capacidad ${sala.capacidad}` : 'Sala psicotécnica',
                vistaDetalle: null,
            };
        });

        return [...eventosPracticos, ...eventosPsicotecnicos];
    }, [clasesPracticas, reservasSalas, salasPorId]);

    const sedesDisponibles = useMemo(() => {
        const sedes = eventosAgenda
            .map((evento) => evento.sede)
            .filter(Boolean);

        return [...new Set(sedes)];
    }, [eventosAgenda]);

    const profesoresDisponibles = useMemo(() => {
        const profesoresMap = new Map();

        clasesPracticas.forEach((clase) => {
            if (clase.id_profesor && clase.profesor_nombre) {
                profesoresMap.set(clase.id_profesor, {
                    id_profesor: clase.id_profesor,
                    nombre: `${clase.profesor_nombre} ${clase.profesor_apellido}`,
                });
            }
        });

        return Array.from(profesoresMap.values());
    }, [clasesPracticas]);

    const eventosSemana = eventosAgenda.filter((evento) => {
        const fechasSemana = diasSemana.map((dia) => dia.fecha);

        const coincideSemana = fechasSemana.includes(evento.fecha);

        const coincideTipo =
            filtroTipo === 'todos' ||
            evento.tipo === filtroTipo;

        const coincideSede =
            filtroSede === 'todas' ||
            evento.sede === filtroSede;

        const coincideProfesor =
            filtroProfesor === 'todos' ||
            String(evento.id_profesor) === String(filtroProfesor);

        const coincideEstado =
            filtroEstado === 'todos' ||
            normalizarEstado(evento.estado) === filtroEstado;

        return coincideSemana && coincideTipo && coincideSede && coincideProfesor && coincideEstado;
    });

    const obtenerEventosPorCelda = (fecha, hora) => {
        return eventosSemana
            .filter((evento) => {
                const horaBloque = obtenerHoraBloque(evento.hora_inicio);
                return evento.fecha === fecha && horaBloque === hora;
            })
            .sort((a, b) => String(a.hora_inicio).localeCompare(String(b.hora_inicio)));
    };

    const obtenerClaseEvento = (evento) => {
        const estado = normalizarEstado(evento.estado);

        if (evento.tipo === 'psicotecnica') {
            if (estado === 'cancelada') {
                return 'bg-red-100 text-red-800 border-red-200';
            }

            if (estado === 'pendiente') {
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            }

            return 'bg-violet-100 text-violet-800 border-violet-200';
        }

        if (estado === 'programada') {
            return 'bg-blue-100 text-blue-800 border-blue-200';
        }

        if (estado === 'realizada') {
            return 'bg-green-100 text-green-800 border-green-200';
        }

        if (estado === 'cancelada') {
            return 'bg-red-100 text-red-800 border-red-200';
        }

        return 'bg-slate-100 text-slate-800 border-slate-200';
    };

    const manejarClickEvento = (evento) => {
        if (evento.tipo === 'practica') {
            cambiarVista('verClasePracticaAgenda', evento.id_origen);
        }
    };

    const totalSemana = eventosSemana.length;
    const totalPracticas = eventosSemana.filter((evento) => evento.tipo === 'practica').length;
    const totalPsicotecnicas = eventosSemana.filter((evento) => evento.tipo === 'psicotecnica').length;

    const totalProgramadas = eventosSemana.filter(
        evento => normalizarEstado(evento.estado) === 'programada'
    ).length;

    const totalReservadas = eventosSemana.filter(
        evento => normalizarEstado(evento.estado) === 'reservada'
    ).length;

    const totalCanceladas = eventosSemana.filter(
        evento => normalizarEstado(evento.estado) === 'cancelada'
    ).length;

    if (cargando) {
        return (
            <div className="p-8 text-center text-slate-500">
                Cargando agenda semanal...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg">
                    {error}
                </div>

                <button
                    onClick={obtenerDatosAgenda}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-blue-700 text-white font-bold"
                >
                    Semana
                </button>

                <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    <option value="todos">Todos los eventos</option>
                    <option value="practica">Clases prácticas</option>
                    <option value="psicotecnica">Reservas psicotécnicas</option>
                </select>

                <select
                    value={filtroSede}
                    onChange={(e) => setFiltroSede(e.target.value)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    <option value="todas">Todas las sedes</option>
                    {sedesDisponibles.map((sede) => (
                        <option key={sede} value={sede}>
                            {sede}
                        </option>
                    ))}
                </select>

                <select
                    value={filtroProfesor}
                    onChange={(e) => setFiltroProfesor(e.target.value)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    <option value="todos">Todos los profesores</option>
                    {profesoresDisponibles.map((profesor) => (
                        <option key={profesor.id_profesor} value={profesor.id_profesor}>
                            {profesor.nombre}
                        </option>
                    ))}
                </select>

                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="programada">Programadas</option>
                    <option value="realizada">Realizadas</option>
                    <option value="reservada">Reservadas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="cancelada">Canceladas</option>
                </select>

                <button
                    type="button"
                    onClick={() => cambiarVista('registrarClasePractica')}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95 transition-all"
                >
                    + Nueva clase
                </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-x-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Agenda general semanal
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Semana del {formatearFechaVisual(diasSemana[0].fecha)} al {formatearFechaVisual(diasSemana[5].fecha)}
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
                                onClick={() => setFechaBase(obtenerFechaHoy())}
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

                    <div className="min-w-[1000px] max-h-[620px] overflow-y-auto border border-slate-200 rounded-xl">
                        <div className="grid grid-cols-[110px_repeat(6,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
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

                        {horasAgenda.map((hora) => (
                            <div
                                key={hora}
                                className="grid grid-cols-[110px_repeat(6,1fr)] min-h-[110px] border-b border-slate-200 last:border-b-0"
                            >
                                <div className="p-4 bg-slate-50 font-bold text-slate-800 text-center border-r border-slate-200">
                                    {hora}
                                </div>

                                {diasSemana.map((dia) => {
                                    const eventosCelda = obtenerEventosPorCelda(dia.fecha, hora);

                                    return (
                                        <div
                                            key={`${dia.fecha}-${hora}`}
                                            className="p-2 border-r border-slate-200 last:border-r-0"
                                        >
                                            <div className="space-y-2">
                                                {eventosCelda.map((evento) => (
                                                    <button
                                                        key={evento.id}
                                                        type="button"
                                                        onClick={() => manejarClickEvento(evento)}
                                                        className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${evento.vistaDetalle
                                                                ? 'hover:shadow-sm hover:-translate-y-[1px] cursor-pointer'
                                                                : 'cursor-default'
                                                            } ${obtenerClaseEvento(evento)}`}
                                                    >
                                                        <p className="font-bold">
                                                            {evento.titulo}
                                                        </p>

                                                        <p>
                                                            {evento.principal}
                                                        </p>

                                                        <p className="text-xs mt-1 opacity-80">
                                                            {formatearHora(evento.hora_inicio)} - {formatearHora(evento.hora_fin)}
                                                        </p>

                                                        <p className="text-xs opacity-80">
                                                            {evento.detalle}
                                                        </p>

                                                        <p className="text-[11px] mt-1 font-bold opacity-80">
                                                            {mostrarEstado(evento.estado)}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full xl:w-[360px]">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-5">
                            Resumen de la semana
                        </h2>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4">
                                <span className="text-slate-700">Eventos totales</span>
                                <span className="font-bold text-slate-900">{totalSemana}</span>
                            </div>

                            <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4">
                                <span className="text-slate-700">Clases prácticas</span>
                                <span className="font-bold text-blue-700">{totalPracticas}</span>
                            </div>

                            <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4">
                                <span className="text-slate-700">Reservas psicotécnicas</span>
                                <span className="font-bold text-violet-700">{totalPsicotecnicas}</span>
                            </div>

                            <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4">
                                <span className="text-slate-700">Programadas</span>
                                <span className="font-bold text-blue-700">{totalProgramadas}</span>
                            </div>

                            <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4">
                                <span className="text-slate-700">Reservadas</span>
                                <span className="font-bold text-violet-700">{totalReservadas}</span>
                            </div>

                            <div className="flex justify-between items-center border border-slate-200 rounded-xl p-4">
                                <span className="text-slate-700">Canceladas</span>
                                <span className="font-bold text-red-700">{totalCanceladas}</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-5">
                            La agenda integra clases prácticas y reservas de salas psicotécnicas. Las clases prácticas pueden abrirse para ver detalle.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VistaAgenda;