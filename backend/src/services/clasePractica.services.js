import { AppDataSource } from "../config/configDb.js";
import ClasePractica from "../entitys/clasePractica.entity.js";

function clasePracticaRepository() {
  return AppDataSource.getRepository(ClasePractica);
}

export async function createClasePractica(data) {
  const nuevaClase = clasePracticaRepository().create(data);
  return await clasePracticaRepository().save(nuevaClase);
}

export async function getAllClasesPracticas() {
  const resultado = await AppDataSource.query(`
    SELECT
      cp.*,

      a.rut AS alumno_rut,
      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,

      p.rut AS profesor_rut,
      p.nombre AS profesor_nombre,
      p.apellido AS profesor_apellido,
      p.correo_institucional AS profesor_correo_institucional,

      v.patente AS vehiculo_patente,
      v.marca AS vehiculo_marca,
      v.modelo AS vehiculo_modelo,
      v.tipo_transmision AS vehiculo_tipo_transmision,
      v.licencia_requerida AS vehiculo_licencia_requerida

    FROM clases_practicas cp
    INNER JOIN alumnos a
      ON cp.id_alumno = a.id_alumno
    INNER JOIN profesores p
      ON cp.id_profesor = p.id_profesor
    INNER JOIN vehiculos v
      ON cp.id_vehiculo = v.id_vehiculo
    ORDER BY cp.fecha ASC, cp.hora_inicio ASC, cp.id_clase_practica ASC
  `);

  return resultado;
}

export async function getClasePracticaById(id) {
  return await clasePracticaRepository().findOneBy({
    id_clase_practica: Number(id),
  });
}

export async function getClasePracticaDetalleById(id) {
  const resultado = await AppDataSource.query(
    `
    SELECT
      cp.*,

      a.rut AS alumno_rut,
      a.nombre AS alumno_nombre,
      a.apellido AS alumno_apellido,

      p.rut AS profesor_rut,
      p.nombre AS profesor_nombre,
      p.apellido AS profesor_apellido,
      p.correo_institucional AS profesor_correo_institucional,

      v.patente AS vehiculo_patente,
      v.marca AS vehiculo_marca,
      v.modelo AS vehiculo_modelo,
      v.tipo_transmision AS vehiculo_tipo_transmision,
      v.licencia_requerida AS vehiculo_licencia_requerida

    FROM clases_practicas cp
    INNER JOIN alumnos a
      ON cp.id_alumno = a.id_alumno
    INNER JOIN profesores p
      ON cp.id_profesor = p.id_profesor
    INNER JOIN vehiculos v
      ON cp.id_vehiculo = v.id_vehiculo
    WHERE cp.id_clase_practica = $1
    LIMIT 1
    `,
    [Number(id)]
  );

  if (resultado.length === 0) {
    return null;
  }

  return resultado[0];
}

export async function updateClasePractica(id, data) {
  const claseExistente = await getClasePracticaById(id);

  if (!claseExistente) {
    return null;
  }

  await clasePracticaRepository().update(
    { id_clase_practica: Number(id) },
    data
  );

  return await getClasePracticaDetalleById(id);
}

export async function buscarChoqueClasePractica({
  id_alumno,
  id_profesor,
  id_vehiculo,
  fecha,
  hora_inicio,
  hora_fin,
  id_clase_excluida = null,
}) {
  const parametros = [
    Number(id_alumno),
    Number(id_profesor),
    Number(id_vehiculo),
    fecha,
    hora_inicio,
    hora_fin,
  ];

  let consulta = `
    SELECT
      cp.*,
      CASE
        WHEN cp.id_alumno = $1 THEN 'alumno'
        WHEN cp.id_profesor = $2 THEN 'profesor'
        WHEN cp.id_vehiculo = $3 THEN 'vehiculo'
        ELSE 'desconocido'
      END AS conflicto_tipo
    FROM clases_practicas cp
    WHERE cp.fecha = $4
      AND cp.estado <> 'Cancelada'
      AND cp.hora_inicio < $6
      AND cp.hora_fin > $5
      AND (
        cp.id_alumno = $1
        OR cp.id_profesor = $2
        OR cp.id_vehiculo = $3
      )
  `;

  if (id_clase_excluida) {
    consulta += ` AND cp.id_clase_practica <> $7`;
    parametros.push(Number(id_clase_excluida));
  }

  consulta += ` LIMIT 1`;

  const resultado = await AppDataSource.query(consulta, parametros);

  if (resultado.length > 0) {
    return resultado[0];
  }

  return null;
}

export async function getDisponibilidadClasesPracticasAlumno(
  idAlumno,
  idClaseExcluida = null
) {
  const matriculas = await AppDataSource.query(
    `
    SELECT
      id_matricula,
      id_alumno,
      cantidad_clases_practicas,
      estado
    FROM matriculas
    WHERE id_alumno = $1
      AND estado = 'Activa'
    ORDER BY fecha_matricula DESC, id_matricula DESC
    LIMIT 1
    `,
    [Number(idAlumno)]
  );

  if (matriculas.length === 0) {
    return {
      tieneMatriculaActiva: false,
      matricula: null,
      clasesContratadas: 0,
      clasesOcupadas: 0,
      clasesDisponibles: 0,
    };
  }

  const parametros = [Number(idAlumno)];
  let consultaClasesOcupadas = `
    SELECT COUNT(*)::int AS total
    FROM clases_practicas
    WHERE id_alumno = $1
      AND estado IN ('Programada', 'Realizada')
  `;

  if (idClaseExcluida) {
    consultaClasesOcupadas += ` AND id_clase_practica <> $2`;
    parametros.push(Number(idClaseExcluida));
  }

  const clasesOcupadasResultado = await AppDataSource.query(
    consultaClasesOcupadas,
    parametros
  );

  const matricula = matriculas[0];
  const clasesContratadas = Number(matricula.cantidad_clases_practicas);
  const clasesOcupadas = Number(clasesOcupadasResultado[0]?.total || 0);

  return {
    tieneMatriculaActiva: true,
    matricula,
    clasesContratadas,
    clasesOcupadas,
    clasesDisponibles: Math.max(clasesContratadas - clasesOcupadas, 0),
  };
}

export async function validarDisponibilidadClasePractica({
  id_alumno,
  estado,
  id_clase_excluida = null,
}) {
  if (estado === "Cancelada") {
    return {
      valido: true,
      consumeCupo: false,
    };
  }

  const disponibilidad = await getDisponibilidadClasesPracticasAlumno(
    id_alumno,
    id_clase_excluida
  );

  if (!disponibilidad.tieneMatriculaActiva) {
    return {
      valido: false,
      mensaje: "El alumno no tiene una matrícula activa.",
      disponibilidad,
    };
  }

  if (disponibilidad.clasesOcupadas >= disponibilidad.clasesContratadas) {
    return {
      valido: false,
      mensaje: "El alumno no tiene clases prácticas disponibles para agendar.",
      disponibilidad,
    };
  }

  return {
    valido: true,
    consumeCupo: true,
    disponibilidad,
  };
}

export async function actualizarAsistenciaPractica(id, nuevaAsistencia) {
  const clase = await getClasePracticaById(id);
  
  if (!clase) return null;

  const estadoClasePorAsistencia = {
    Presente: "Realizada",
    Ausente: "Realizada",
    Justificado: "Cancelada",
    Pendiente: "Programada",
  };

  await AppDataSource.query(
    `
    UPDATE clases_practicas
    SET asistencia = $1,
        estado = $2
    WHERE id_clase_practica = $3
    `,
    [nuevaAsistencia, estadoClasePorAsistencia[nuevaAsistencia], Number(id)]
  );

  return await getClasePracticaDetalleById(id);
}
