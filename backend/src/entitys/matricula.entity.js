"use strict";

import { EntitySchema } from "typeorm";

const Matricula = new EntitySchema({
  name: "Matricula",
  tableName: "matriculas",
  columns: {
    id_matricula: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_alumno: {
      type: "int",
      nullable: false,
    },
    id_plan: {
      type: "int",
      nullable: false,
    },
    fecha_matricula: {
      type: "timestamp",
      createDate: true,
    },
    cantidad_clases_practicas: {
      type: "int",
      nullable: false,
      default: 0,
    },
    cantidad_clases_teoricas: {
      type: "int",
      nullable: false,
      default: 0,
    },
    valor_total: {
      type: "int",
      nullable: false,
      default: 0,
    },
    estado: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "Activa",
    },
  },
  foreignKeys: [
    {
      name: "fk_matricula_alumno",
      target: "Alumno",
      columnNames: ["id_alumno"],
      referencedColumnNames: ["id_alumno"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_matricula_plan",
      target: "Plan",
      columnNames: ["id_plan"],
      referencedColumnNames: ["id_plan"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default Matricula;
