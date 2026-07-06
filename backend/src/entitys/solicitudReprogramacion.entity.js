"use strict";

import { EntitySchema } from "typeorm";

const SolicitudReprogramacion = new EntitySchema({
  name: "SolicitudReprogramacion",
  tableName: "solicitudes_reprogramacion",
  columns: {
    id_solicitud: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_alumno: {
      type: "int",
      nullable: false,
    },
    id_clase_practica: {
      type: "int",
      nullable: false,
    },
    motivo: {
      type: "text",
      nullable: false,
    },
    fecha_solicitada: {
      type: "date",
      nullable: false,
    },
    hora_inicio_solicitada: {
      type: "time",
      nullable: false,
    },
    hora_fin_solicitada: {
      type: "time",
      nullable: false,
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
    fecha_solicitud: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  foreignKeys: [
    {
      name: "fk_reprogramacion_alumno",
      target: "Alumno",
      columnNames: ["id_alumno"],
      referencedColumnNames: ["id_alumno"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_reprogramacion_clase_practica",
      target: "ClasePractica",
      columnNames: ["id_clase_practica"],
      referencedColumnNames: ["id_clase_practica"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default SolicitudReprogramacion;
