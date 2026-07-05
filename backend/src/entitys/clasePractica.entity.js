"use strict";

import { EntitySchema } from "typeorm";

const ClasePractica = new EntitySchema({
  name: "ClasePractica",
  tableName: "clases_practicas",

  columns: {
    id_clase_practica: {
      type: "int",
      primary: true,
      generated: true,
    },

    id_alumno: {
      type: "int",
      nullable: false,
    },

    id_profesor: {
      type: "int",
      nullable: false,
    },

    id_vehiculo: {
      type: "int",
      nullable: false,
    },

    fecha: {
      type: "date",
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
      length: 30,
      nullable: false,
      default: "Programada",
    },

    observacion: {
      type: "text",
      nullable: true,
    },
    asistencia: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Pendiente", 
    }
  },

  foreignKeys: [
    {
      name: "fk_clase_practica_alumno",
      target: "Alumno",
      columnNames: ["id_alumno"],
      referencedColumnNames: ["id_alumno"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_clase_practica_profesor",
      target: "Profesor",
      columnNames: ["id_profesor"],
      referencedColumnNames: ["id_profesor"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_clase_practica_vehiculo",
      target: "Vehiculo",
      columnNames: ["id_vehiculo"],
      referencedColumnNames: ["id_vehiculo"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default ClasePractica;