"use strict";

import { EntitySchema } from "typeorm";

const DisponibilidadProfesor = new EntitySchema({
  name: "DisponibilidadProfesor",
  tableName: "disponibilidad_profesores",
  columns: {
    id_disponibilidad: {
      type: "int",
      primary: true,
      generated: true,
    },
    id_profesor: {
      type: "int",
      nullable: false,
    },
    dia_semana: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    hora_inicio: {
      type: "time",
      nullable: false,
    },
    hora_fin: {
      type: "time",
      nullable: false,
    },
    sede: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Activa",
    },
  },
  foreignKeys: [
    {
      name: "fk_disponibilidad_profesor",
      target: "Profesor",
      columnNames: ["id_profesor"],
      referencedColumnNames: ["id_profesor"],
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  ],
});

export default DisponibilidadProfesor;
