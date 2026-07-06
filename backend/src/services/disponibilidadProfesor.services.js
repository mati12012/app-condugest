import { AppDataSource } from "../config/configDb.js";
import DisponibilidadProfesor from "../entitys/disponibilidadProfesor.entity.js";

function disponibilidadProfesorRepository() {
  return AppDataSource.getRepository(DisponibilidadProfesor);
}

const SELECT_DETALLE_DISPONIBILIDAD = `
  SELECT
    dp.id_disponibilidad,
    dp.id_profesor,
    dp.dia_semana,
    dp.hora_inicio,
    dp.hora_fin,
    dp.sede,
    dp.estado,
    p.rut AS profesor_rut,
    p.nombre AS profesor_nombre,
    p.apellido AS profesor_apellido,
    p.sede AS profesor_sede,
    p.estado AS profesor_estado
  FROM disponibilidad_profesores dp
  INNER JOIN profesores p
    ON dp.id_profesor = p.id_profesor
`;

const DIAS_POR_NUMERO = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

function normalizarDisponibilidad(row) {
  if (!row) return null;

  return {
    id_disponibilidad: Number(row.id_disponibilidad),
    id_profesor: Number(row.id_profesor),
    dia_semana: row.dia_semana,
    hora_inicio: row.hora_inicio,
    hora_fin: row.hora_fin,
    sede: row.sede,
    estado: row.estado,
    profesor: {
      id_profesor: Number(row.id_profesor),
      rut: row.profesor_rut,
      nombre: row.profesor_nombre,
      apellido: row.profesor_apellido,
      sede: row.profesor_sede,
      estado: row.profesor_estado,
    },
  };
}

function normalizarDisponibilidades(rows) {
  return rows.map((row) => normalizarDisponibilidad(row));
}

function normalizarFechaClase(fecha) {
  if (!fecha) return "";

  if (fecha instanceof Date) {
    const anio = fecha.getUTCFullYear();
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getUTCDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
  }

  const fechaTexto = String(fecha).trim();

  return fechaTexto.split("T")[0].split(" ")[0];
}

export function obtenerDiaSemanaDesdeFecha(fecha) {
  const fechaNormalizada = normalizarFechaClase(fecha);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNormalizada)) {
    return null;
  }

  const [anio, mes, dia] = fechaNormalizada.split("-").map(Number);
  const fechaUtc = new Date(Date.UTC(anio, mes - 1, dia, 12));

  return DIAS_POR_NUMERO[fechaUtc.getUTCDay()] || null;
}

export async function getAllDisponibilidadesProfesores() {
  const disponibilidades = await AppDataSource.query(`
    ${SELECT_DETALLE_DISPONIBILIDAD}
    ORDER BY
      p.apellido ASC,
      p.nombre ASC,
      dp.dia_semana ASC,
      dp.hora_inicio ASC,
      dp.id_disponibilidad ASC
  `);

  return normalizarDisponibilidades(disponibilidades);
}

export async function getDisponibilidadProfesorById(idDisponibilidad) {
  const resultado = await AppDataSource.query(
    `
    ${SELECT_DETALLE_DISPONIBILIDAD}
    WHERE dp.id_disponibilidad = $1
    LIMIT 1
    `,
    [Number(idDisponibilidad)]
  );

  return resultado.length > 0 ? normalizarDisponibilidad(resultado[0]) : null;
}

export async function getDisponibilidadesByProfesor(idProfesor) {
  const disponibilidades = await AppDataSource.query(
    `
    ${SELECT_DETALLE_DISPONIBILIDAD}
    WHERE dp.id_profesor = $1
    ORDER BY dp.dia_semana ASC, dp.hora_inicio ASC, dp.id_disponibilidad ASC
    `,
    [Number(idProfesor)]
  );

  return normalizarDisponibilidades(disponibilidades);
}

export async function buscarDisponibilidadSolapada({
  id_profesor,
  dia_semana,
  hora_inicio,
  hora_fin,
  sede,
  id_disponibilidad_excluida = null,
}) {
  const parametros = [
    Number(id_profesor),
    dia_semana,
    hora_inicio,
    hora_fin,
    sede,
  ];

  let consulta = `
    SELECT *
    FROM disponibilidad_profesores
    WHERE id_profesor = $1
      AND dia_semana = $2
      AND hora_inicio < $4::time
      AND hora_fin > $3::time
      AND sede = $5
      AND estado = 'Activa'
  `;

  if (id_disponibilidad_excluida) {
    consulta += ` AND id_disponibilidad <> $6`;
    parametros.push(Number(id_disponibilidad_excluida));
  }

  consulta += ` LIMIT 1`;

  const resultado = await AppDataSource.query(consulta, parametros);

  return resultado.length > 0 ? resultado[0] : null;
}

export async function profesorTieneDisponibilidadParaClase({
  id_profesor,
  fecha,
  hora_inicio,
  hora_fin,
  sede,
}) {
  const diaSemana = obtenerDiaSemanaDesdeFecha(fecha);

  if (!diaSemana || diaSemana === "Domingo") {
    return false;
  }

  const resultado = await AppDataSource.query(
    `
    SELECT id_disponibilidad
    FROM disponibilidad_profesores
    WHERE id_profesor = $1
      AND dia_semana = $2
      AND sede = $3
      AND estado = 'Activa'
      AND hora_inicio <= $4::time
      AND hora_fin >= $5::time
    LIMIT 1
    `,
    [Number(id_profesor), diaSemana, sede, hora_inicio, hora_fin]
  );

  return resultado.length > 0;
}

export async function createDisponibilidadProfesor(disponibilidadData) {
  const nuevaDisponibilidad =
    disponibilidadProfesorRepository().create(disponibilidadData);
  const disponibilidadGuardada = await disponibilidadProfesorRepository().save(
    nuevaDisponibilidad
  );

  return await getDisponibilidadProfesorById(
    disponibilidadGuardada.id_disponibilidad
  );
}

export async function updateDisponibilidadProfesor(
  idDisponibilidad,
  disponibilidadData
) {
  const disponibilidad = await disponibilidadProfesorRepository().findOne({
    where: {
      id_disponibilidad: Number(idDisponibilidad),
    },
  });

  if (!disponibilidad) {
    return null;
  }

  const disponibilidadActualizada = disponibilidadProfesorRepository().merge(
    disponibilidad,
    disponibilidadData
  );

  await disponibilidadProfesorRepository().save(disponibilidadActualizada);

  return await getDisponibilidadProfesorById(idDisponibilidad);
}

export async function deleteDisponibilidadProfesor(idDisponibilidad) {
  const disponibilidad = await disponibilidadProfesorRepository().findOne({
    where: {
      id_disponibilidad: Number(idDisponibilidad),
    },
  });

  if (!disponibilidad) {
    return null;
  }

  const detalleDisponibilidad = await getDisponibilidadProfesorById(
    idDisponibilidad
  );

  await disponibilidadProfesorRepository().remove(disponibilidad);

  return detalleDisponibilidad;
}
