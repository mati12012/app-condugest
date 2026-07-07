"use strict";

import { EntitySchema } from "typeorm";

const Vehiculo = new EntitySchema({
  name: "Vehiculo",
  tableName: "vehiculos",
  columns: {
    id_vehiculo: {
      type: "int",
      primary: true,
      generated: true,
    },
    patente: {
      type: "varchar",
      length: 10,
      unique: true,
      nullable: false,
    },
    marca: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    modelo: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    anio: {
      type: "int",
      nullable: false,
    },
    tipo_transmision: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    licencia_requerida: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    sede: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    kilometraje: {
      type: "int",
      nullable: false,
      default: 0,
    },
    estado_operativo: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "Disponible",
    },
    observacion: {
      type: "text",
      nullable: true,
    },
    url_revision_tecnica: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    fecha_vencimiento_revision_tecnica: {
      type: "date",
      nullable: true,
    },
    estado_revision_tecnica: {
      type: "varchar",
      length: 30,
      nullable: false,
      default: "Requiere revisión manual",
    },
    patente_detectada_revision: {
      type: "varchar",
      length: 10,
      nullable: true,
    },
    confianza_revision_tecnica: {
      type: "varchar",
      length: 20,
      nullable: false,
      default: "Baja",
    },
    observacion_revision_tecnica: {
      type: "text",
      nullable: true,
    },
  },
});

export default Vehiculo;
