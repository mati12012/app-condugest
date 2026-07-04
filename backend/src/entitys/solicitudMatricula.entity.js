"use strict";

import { EntitySchema } from "typeorm";

const SolicitudMatricula = new EntitySchema({
  name: "SolicitudMatricula",
  tableName: "solicitudes_matricula",
  columns: {
    id_solicitud: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    apellido: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    rut: {
      type: "varchar",
      length: 12,
      nullable: false,
    },
    correo: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    id_plan: {
      type: "int",
      nullable: false,
    },
    mensaje: {
      type: "text",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "Pendiente",
    },
    fecha_solicitud: {
      type: "timestamp",
      createDate: true,
    },
  },
  foreignKeys: [
    {
      name: "fk_solicitud_matricula_plan",
      target: "Plan",
      columnNames: ["id_plan"],
      referencedColumnNames: ["id_plan"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default SolicitudMatricula;
