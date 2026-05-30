import { AppDataSource } from "../config/configDb.js";
import ReservaSala from "../entitys/reservaSala.entity.js";

function getReservaRepository() {
  return AppDataSource.getRepository(ReservaSala);
}

export async function createReserva(data) {
  const reservaRepository = getReservaRepository();

  const nuevaReserva = reservaRepository.create(data);
  return await reservaRepository.save(nuevaReserva);
}

export async function getAllReservas() {
  const reservaRepository = getReservaRepository();

  return await reservaRepository.find({
    order: {
      fecha: "ASC",
      hora_inicio: "ASC",
      id_reserva: "ASC",
    },
  });
}

export async function getReservaById(id) {
  const reservaRepository = getReservaRepository();

  return await reservaRepository.findOneBy({
    id_reserva: Number(id),
  });
}

export async function updateReserva(id, data) {
  const reservaRepository = getReservaRepository();

  const reservaExistente = await getReservaById(id);

  if (!reservaExistente) {
    return null;
  }

  await reservaRepository.update(
    { id_reserva: Number(id) },
    data
  );

  return await getReservaById(id);
}

export async function deleteReserva(id) {
  const reservaRepository = getReservaRepository();

  const reservaExistente = await getReservaById(id);

  if (!reservaExistente) {
    return null;
  }

  await reservaRepository.delete({
    id_reserva: Number(id),
  });

  return reservaExistente;
}

export async function buscarChoqueHorario({
  id_sala,
  fecha,
  hora_inicio,
  hora_fin,
  id_reserva_excluida = null,
}) {
  const parametros = [
    Number(id_sala),
    fecha,
    hora_inicio,
    hora_fin,
  ];

  let consulta = `
    SELECT *
    FROM reservas_salas
    WHERE id_sala = $1
      AND fecha = $2
      AND estado <> 'cancelada'
      AND hora_inicio < $4
      AND hora_fin > $3
  `;

  if (id_reserva_excluida) {
    consulta += ` AND id_reserva <> $5`;
    parametros.push(Number(id_reserva_excluida));
  }

  consulta += ` LIMIT 1`;

  const resultado = await AppDataSource.query(consulta, parametros);

  if (resultado.length > 0) {
    return resultado[0];
  }

  return null;
}

export async function getReservasActivasPorSala(idSala) {
  const resultado = await AppDataSource.query(
    `
    SELECT *
    FROM reservas_salas
    WHERE id_sala = $1
      AND estado IN ('reservada', 'pendiente')
    ORDER BY fecha ASC, hora_inicio ASC
    `,
    [Number(idSala)]
  );

  return resultado;
}