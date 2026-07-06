"use strict";

import { EntitySchema } from "typeorm";

const MaterialEstudio = new EntitySchema({
  name: "MaterialEstudio",
  tableName: "materiales_estudio",
  columns: {
    id_material: {
      type: "int",
      primary: true,
      generated: true,
    },
    titulo: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    descripcion: {
      type: "text",
      nullable: true,
    },
    tipo: {
      type: "varchar",
      length: 30,
      nullable: false,
    },
    url_material: {
      type: "text",
      nullable: false,
    },
    id_clase_teorica: {
      type: "int",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Activo",
    },
    fecha_creacion: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  foreignKeys: [
    {
      name: "fk_material_estudio_clase_teorica",
      target: "ClaseTeorica",
      columnNames: ["id_clase_teorica"],
      referencedColumnNames: ["id_clase_teorica"],
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
  ],
});

export default MaterialEstudio;
