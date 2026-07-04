import { AppDataSource } from "../config/configDb.js";
import Vehiculo from "../entitys/vehiculo.entity.js";

function vehiculoRepository() {
  return AppDataSource.getRepository(Vehiculo);
}

export async function getAllVehiculos() {
  return await vehiculoRepository().find({
    order: {
      id_vehiculo: "ASC",
    },
  });
}

export async function getVehiculoById(id) {
  return await vehiculoRepository().findOne({
    where: {
      id_vehiculo: Number(id),
    },
  });
}

export async function getVehiculoByPatente(patente) {
  return await vehiculoRepository().findOne({
    where: {
      patente,
    },
  });
}

export async function createVehiculo(vehiculoData) {
  const nuevoVehiculo = vehiculoRepository().create(vehiculoData);
  return await vehiculoRepository().save(nuevoVehiculo);
}

export async function updateVehiculo(id, vehiculoData) {
  const vehiculo = await getVehiculoById(id);

  if (!vehiculo) {
    return null;
  }

  const vehiculoActualizado = vehiculoRepository().merge(
    vehiculo,
    vehiculoData
  );

  return await vehiculoRepository().save(vehiculoActualizado);
}

export async function deleteVehiculo(id) {
  const vehiculo = await getVehiculoById(id);

  if (!vehiculo) {
    return null;
  }

  await vehiculoRepository().remove(vehiculo);

  return vehiculo;
}

export async function actualizarDocumentoVehiculo(idVehiculo, nombreArchivo) {
  const urlArchivo = `/uploads/vehiculos/${nombreArchivo}`;
  await AppDataSource.query(
    `UPDATE vehiculos SET url_revision_tecnica = $1 WHERE id_vehiculo = $2`,
    [urlArchivo, idVehiculo]
  );
  return urlArchivo;
}