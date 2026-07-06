import { AppDataSource } from "../config/configDb.js";
import MaterialEstudio from "../entitys/materialEstudio.entity.js";

function materialEstudioRepository() {
  return AppDataSource.getRepository(MaterialEstudio);
}

const SELECT_DETALLE_MATERIAL = `
  SELECT
    me.id_material,
    me.titulo,
    me.descripcion,
    me.tipo,
    me.url_material,
    me.id_clase_teorica,
    me.estado,
    me.fecha_creacion,
    ct.id_clase_teorica AS clase_id_clase_teorica,
    ct.tema AS clase_tema,
    ct.fecha AS clase_fecha,
    ct.hora_inicio AS clase_hora_inicio,
    ct.hora_fin AS clase_hora_fin,
    ct.sede AS clase_sede,
    ct.estado AS clase_estado
  FROM materiales_estudio me
  LEFT JOIN clases_teoricas ct
    ON me.id_clase_teorica = ct.id_clase_teorica
`;

function normalizarMaterial(row) {
  if (!row) return null;

  return {
    id_material: Number(row.id_material),
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    url_material: row.url_material,
    id_clase_teorica:
      row.id_clase_teorica !== null && row.id_clase_teorica !== undefined
        ? Number(row.id_clase_teorica)
        : null,
    estado: row.estado,
    fecha_creacion: row.fecha_creacion,
    clase_teorica: row.clase_id_clase_teorica
      ? {
          id_clase_teorica: Number(row.clase_id_clase_teorica),
          tema: row.clase_tema,
          fecha: row.clase_fecha,
          hora_inicio: row.clase_hora_inicio,
          hora_fin: row.clase_hora_fin,
          sede: row.clase_sede,
          estado: row.clase_estado,
        }
      : null,
  };
}

function normalizarMateriales(rows) {
  return rows.map((row) => normalizarMaterial(row));
}

export async function existeClaseTeorica(idClaseTeorica) {
  const resultado = await AppDataSource.query(
    `
    SELECT id_clase_teorica
    FROM clases_teoricas
    WHERE id_clase_teorica = $1
    LIMIT 1
    `,
    [Number(idClaseTeorica)]
  );

  return resultado.length > 0;
}

export async function getAllMaterialesEstudio() {
  const materiales = await AppDataSource.query(`
    ${SELECT_DETALLE_MATERIAL}
    ORDER BY me.fecha_creacion DESC, me.id_material DESC
  `);

  return normalizarMateriales(materiales);
}

export async function getMaterialesEstudioActivos() {
  const materiales = await AppDataSource.query(`
    ${SELECT_DETALLE_MATERIAL}
    WHERE me.estado = 'Activo'
    ORDER BY me.fecha_creacion DESC, me.id_material DESC
  `);

  return normalizarMateriales(materiales);
}

export async function getMaterialEstudioById(idMaterial) {
  const resultado = await AppDataSource.query(
    `
    ${SELECT_DETALLE_MATERIAL}
    WHERE me.id_material = $1
    LIMIT 1
    `,
    [Number(idMaterial)]
  );

  return resultado.length > 0 ? normalizarMaterial(resultado[0]) : null;
}

export async function createMaterialEstudio(materialData) {
  const nuevoMaterial = materialEstudioRepository().create(materialData);
  const materialGuardado = await materialEstudioRepository().save(nuevoMaterial);

  return await getMaterialEstudioById(materialGuardado.id_material);
}

export async function updateMaterialEstudio(idMaterial, materialData) {
  const material = await materialEstudioRepository().findOne({
    where: {
      id_material: Number(idMaterial),
    },
  });

  if (!material) {
    return null;
  }

  const materialActualizado = materialEstudioRepository().merge(
    material,
    materialData
  );

  await materialEstudioRepository().save(materialActualizado);

  return await getMaterialEstudioById(idMaterial);
}

export async function deleteMaterialEstudio(idMaterial) {
  const material = await materialEstudioRepository().findOne({
    where: {
      id_material: Number(idMaterial),
    },
  });

  if (!material) {
    return null;
  }

  const detalleMaterial = await getMaterialEstudioById(idMaterial);
  await materialEstudioRepository().remove(material);

  return detalleMaterial;
}
