"use strict";

import { EntitySchema } from "typeorm";

const EvaluacionPractica = new EntitySchema({
  name: "EvaluacionPractica",
  tableName: "evaluaciones_practicas",
  columns: {
    id_evaluacion: {
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
    nivel_general: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "No evaluado",
    },
    manejo_vehiculo: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "No evaluado",
    },
    normas_transito: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "No evaluado",
    },
    seguridad: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "No evaluado",
    },
    estacionamiento: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "No evaluado",
    },
    observacion: {
      type: "text",
      nullable: true,
    },
    recomendacion: {
      type: "text",
      nullable: true,
    },
    fecha_evaluacion: {
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  uniques: [
    {
      name: "uq_evaluacion_practica_clase",
      columns: ["id_clase_practica"],
    },
  ],
  foreignKeys: [
    {
      name: "fk_evaluacion_practica_clase",
      target: "ClasePractica",
      columnNames: ["id_clase_practica"],
      referencedColumnNames: ["id_clase_practica"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_evaluacion_practica_alumno",
      target: "Alumno",
      columnNames: ["id_alumno"],
      referencedColumnNames: ["id_alumno"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    {
      name: "fk_evaluacion_practica_profesor",
      target: "Profesor",
      columnNames: ["id_profesor"],
      referencedColumnNames: ["id_profesor"],
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
  ],
});

export default EvaluacionPractica;
