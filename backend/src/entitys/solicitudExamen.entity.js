"use strict";

import { EntitySchema } from "typeorm";

const SolicitudExamen = new EntitySchema({
  name: "SolicitudExamen",
  tableName: "solicitudes_examen",
  columns: {
    id_solicitud_examen: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_alumno: {
      type: "int",
      nullable: false,
    },
    id_matricula: {
      type: "int",
      nullable: false,
    },
    tipo_vehiculo: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    fecha_solicitada: {
      type: "date",
      nullable: false,
    },
    mensaje: {
      type: "text",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Pendiente",
    },
    respuesta_secretaria: {
      type: "text",
      nullable: true,
    },
    resultado_examen: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Pendiente",
    },
    fecha_solicitud: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  foreignKeys: [
    {
      name: "fk_solicitud_examen_alumno",
      target: "Alumno",
      columnNames: ["id_alumno"],
      referencedColumnNames: ["id_alumno"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_solicitud_examen_matricula",
      target: "Matricula",
      columnNames: ["id_matricula"],
      referencedColumnNames: ["id_matricula"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default SolicitudExamen;
