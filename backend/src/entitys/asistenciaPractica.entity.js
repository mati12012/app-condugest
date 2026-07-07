"use strict";

import { EntitySchema } from "typeorm";

const AsistenciaPractica = new EntitySchema({
  name: "AsistenciaPractica",
  tableName: "asistencias_practicas",
  columns: {
    id_asistencia_practica: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_clase_practica: {
      type: "int",
      nullable: false,
    },
    id_alumno: {
      type: "int",
      nullable: false,
    },
    id_profesor: {
      type: "int",
      nullable: false,
    },
    estado_asistencia: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Pendiente",
    },
    observacion: {
      type: "text",
      nullable: true,
    },
    registrado_por: {
      type: "int",
      nullable: false,
    },
    fecha_registro: {
      type: "timestamp",
      createDate: true,
    },
  },
  uniques: [
    {
      name: "uq_asistencia_practica_clase",
      columns: ["id_clase_practica"],
    },
  ],
  foreignKeys: [
    {
      name: "fk_asistencia_practica_clase",
      target: "ClasePractica",
      columnNames: ["id_clase_practica"],
      referencedColumnNames: ["id_clase_practica"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_asistencia_practica_alumno",
      target: "Alumno",
      columnNames: ["id_alumno"],
      referencedColumnNames: ["id_alumno"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_asistencia_practica_profesor",
      target: "Profesor",
      columnNames: ["id_profesor"],
      referencedColumnNames: ["id_profesor"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_asistencia_practica_usuario",
      target: "Usuario",
      columnNames: ["registrado_por"],
      referencedColumnNames: ["id_usuario"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default AsistenciaPractica;
