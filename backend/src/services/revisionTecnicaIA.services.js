"use strict";

import fs from "fs/promises";
import os from "os";
import path from "path";
import { spawn } from "child_process";

const ESTADO_REVISION_MANUAL = "Requiere revisión manual";
const OBSERVACION_ANALISIS_FALLIDO =
  "No se pudo analizar automáticamente el documento. Revisa la fecha manualmente.";
const OBSERVACION_OCR_NO_DISPONIBLE =
  "No se pudo ejecutar OCR. Verifica que Tesseract esté instalado en el servidor.";
const TESSERACT_WINDOWS_DEFAULT =
  "C:\\Program Files\\Tesseract-OCR\\tesseract.exe";
const TESSERACT_TIMEOUT_MS = 15000;
const TESSERACT_IMAGEN_ARGS = ["--psm", "11", "--dpi", "300"];

const MESES = {
  ENERO: 1,
  FEBRERO: 2,
  MARZO: 3,
  ABRIL: 4,
  MAYO: 5,
  JUNIO: 6,
  JULIO: 7,
  AGOSTO: 8,
  SEPTIEMBRE: 9,
  SETIEMBRE: 9,
  OCTUBRE: 10,
  NOVIEMBRE: 11,
  DICIEMBRE: 12,
};

function normalizarPatente(valor) {
  if (!valor) return null;

  const patente = String(valor)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  return /^([A-Z]{2}\d{4}|[A-Z]{4}\d{2})$/.test(patente) ? patente : null;
}

function quitarTildes(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function limpiarTexto(texto) {
  return String(texto || "")
    .replace(/\s+/g, " ")
    .trim();
}

function prepararTextoAnalisis(texto) {
  const original = limpiarTexto(texto);
  const mayusculas = original.toUpperCase();
  const sinTildes = quitarTildes(mayusculas);
  const limpio = sinTildes
    .replace(/[^A-Z0-9\s./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    original,
    mayusculas,
    sinTildes,
    limpio,
  };
}

function imprimirTextoDetectado(texto) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.DEBUG_REVISION_TECNICA_IA !== "true"
  ) {
    return;
  }

  const vistaPrevia = limpiarTexto(texto).slice(0, 2500);
  console.log("[revision-tecnica-ia] Texto detectado:", vistaPrevia || "(vacio)");
}

function construirEntornoProceso(envExtra = {}) {
  const entorno = {};

  for (const [clave, valor] of Object.entries(process.env)) {
    if (clave && !clave.startsWith("=") && typeof valor === "string") {
      entorno[clave] = valor;
    }
  }

  return {
    ...entorno,
    ...envExtra,
  };
}

function ejecutarComando(comando, argumentos, timeoutMs = 8000, opciones = {}) {
  return new Promise((resolve) => {
    const opcionesSpawn = {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    };

    if (opciones.env && Object.keys(opciones.env).length > 0) {
      opcionesSpawn.env = construirEntornoProceso(opciones.env);
    }

    let proceso;

    try {
      proceso = spawn(comando, argumentos, opcionesSpawn);
    } catch (error) {
      resolve({
        ok: false,
        texto: "",
        error: error.message,
        noDisponible: error.code === "ENOENT" || error.code === "EPERM",
      });
      return;
    }
    let stdout = "";
    let stderr = "";
    let finalizado = false;

    const finalizar = (resultado) => {
      if (finalizado) return;
      finalizado = true;
      resolve(resultado);
    };

    const timer = setTimeout(() => {
      proceso.kill();
      finalizar({
        ok: false,
        texto: stdout,
        error: "Tiempo maximo excedido",
        noDisponible: false,
      });
    }, timeoutMs);

    proceso.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8");
    });

    proceso.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8");
    });

    proceso.on("error", (error) => {
      clearTimeout(timer);
      finalizar({
        ok: false,
        texto: "",
        error: error.message,
        noDisponible: error.code === "ENOENT",
      });
    });

    proceso.on("close", (codigo) => {
      clearTimeout(timer);
      finalizar({
        ok: codigo === 0,
        texto: stdout || "",
        error: stderr || "",
        noDisponible: false,
      });
    });
  });
}

async function existeArchivo(rutaArchivo) {
  try {
    await fs.access(rutaArchivo);
    return true;
  } catch {
    return false;
  }
}

async function obtenerComandoTesseract() {
  if (process.env.TESSERACT_PATH) {
    return process.env.TESSERACT_PATH;
  }

  if (process.platform === "win32" && await existeArchivo(TESSERACT_WINDOWS_DEFAULT)) {
    return TESSERACT_WINDOWS_DEFAULT;
  }

  return "tesseract";
}

async function obtenerTessdataLocal() {
  if (process.env.TESSDATA_PREFIX) {
    return process.env.TESSDATA_PREFIX;
  }

  const candidatos = [
    path.resolve(process.cwd(), "tessdata"),
    path.resolve(process.cwd(), "backend", "tessdata"),
  ];

  for (const candidato of candidatos) {
    if (await existeArchivo(candidato)) {
      return candidato;
    }
  }

  return null;
}

async function obtenerIdiomaTesseract(comandoTesseract) {
  const tessdataLocal = await obtenerTessdataLocal();
  const intentos = tessdataLocal
    ? [
        { env: { TESSDATA_PREFIX: tessdataLocal } },
        { env: {} },
      ]
    : [{ env: {} }];

  for (const intento of intentos) {
    const resultado = await ejecutarComando(
      comandoTesseract,
      ["--list-langs"],
      5000,
      { env: intento.env }
    );

    if (!resultado.ok) {
      continue;
    }

    const idiomas = resultado.texto
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter((linea) => /^[a-z_]+$/i.test(linea));
    const tieneSpa = idiomas.includes("spa");
    const tieneEng = idiomas.includes("eng");

    if (tieneSpa && tieneEng) {
      return { idioma: "spa+eng", observacion: null, env: intento.env };
    }

    if (tieneSpa) {
      return { idioma: "spa", observacion: null, env: intento.env };
    }

    if (tieneEng) {
      return {
        idioma: "eng",
        observacion:
          "Tesseract no tiene instalado el idioma spa; se ejecutó OCR con eng.",
        env: intento.env,
      };
    }
  }

  return {
    idioma: null,
    observacion: OBSERVACION_OCR_NO_DISPONIBLE,
    env: {},
  };
}

async function extraerTextoPdfBasico(rutaArchivo) {
  const buffer = await fs.readFile(rutaArchivo);
  const contenido = buffer.toString("latin1");
  const textosEntreParentesis = [];
  const regexTextoPdf = /\((?:\\.|[^\\)]){2,}\)\s*Tj/g;
  let coincidencia = regexTextoPdf.exec(contenido);

  while (coincidencia) {
    textosEntreParentesis.push(
      coincidencia[0]
        .replace(/\)\s*Tj$/, "")
        .replace(/^\(/, "")
        .replace(/\\([()\\])/g, "$1")
    );
    coincidencia = regexTextoPdf.exec(contenido);
  }

  const textoPlano = contenido
    .replace(/[^\x20-\x7EáéíóúÁÉÍÓÚñÑüÜ/-]/g, " ")
    .slice(0, 50000);

  return limpiarTexto(`${textosEntreParentesis.join(" ")} ${textoPlano}`);
}

async function extraerTextoPdf(rutaArchivo) {
  const observaciones = [];
  const resultadoPdftotext = await ejecutarComando("pdftotext", [
    rutaArchivo,
    "-",
  ]);

  if (resultadoPdftotext.ok && limpiarTexto(resultadoPdftotext.texto).length > 20) {
    return {
      texto: limpiarTexto(resultadoPdftotext.texto),
      observaciones,
    };
  }

  if (resultadoPdftotext.noDisponible) {
    observaciones.push(
      "No se pudo ejecutar pdftotext. Se intentó extracción básica del PDF."
    );
  }

  const textoBasico = await extraerTextoPdfBasico(rutaArchivo);

  return {
    texto: textoBasico,
    observaciones,
  };
}

async function preprocesarImagenWindows(rutaArchivo) {
  if (process.platform !== "win32") return null;

  const rutaProcesada = path.join(
    os.tmpdir(),
    `revision-ocr-${process.pid}-${Date.now()}.png`
  );
  const script = `
& {
  param([string]$src, [string]$out)
  Add-Type -AssemblyName System.Drawing
  $img = [System.Drawing.Image]::FromFile($src)
  $scale = 4
  $bmp = New-Object System.Drawing.Bitmap ($img.Width * $scale), ($img.Height * $scale)
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gfx.DrawImage($img, 0, 0, $bmp.Width, $bmp.Height)
  $gfx.Dispose()
  $img.Dispose()
  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}
`.trim();

  const resultado = await ejecutarComando(
    "powershell",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script,
      rutaArchivo,
      rutaProcesada,
    ],
    10000
  );

  return resultado.ok ? rutaProcesada : null;
}

async function eliminarArchivoTemporal(rutaArchivo) {
  if (!rutaArchivo) return;

  try {
    await fs.unlink(rutaArchivo);
  } catch {
    // El archivo temporal no es critico para el flujo de subida.
  }
}

async function ejecutarOcrImagen({ comandoTesseract, rutaArchivo, idiomaTesseract }) {
  const resultado = await ejecutarComando(
    comandoTesseract,
    [
      rutaArchivo,
      "stdout",
      "-l",
      idiomaTesseract.idioma,
      ...TESSERACT_IMAGEN_ARGS,
    ],
    TESSERACT_TIMEOUT_MS,
    { env: idiomaTesseract.env }
  );

  return {
    ok: resultado.ok,
    texto: limpiarTexto(resultado.texto),
  };
}

function puntuarTextoOcr(texto) {
  const { limpio } = prepararTextoAnalisis(texto);
  let puntaje = limpio.length;

  if (detectarPatente(limpio)) puntaje += 120;
  if (extraerFechasTextuales(limpio).length > 0) puntaje += 120;
  if (/VALIDO|VENCE|VENCIMIENTO|JULIO|PLACA PATENTE/.test(limpio)) {
    puntaje += 40;
  }

  return puntaje;
}

async function extraerTextoImagen(rutaArchivo) {
  const comandoTesseract = await obtenerComandoTesseract();
  const idiomaTesseract = await obtenerIdiomaTesseract(comandoTesseract);
  const observaciones = idiomaTesseract.observacion
    ? [idiomaTesseract.observacion]
    : [];

  if (!idiomaTesseract.idioma) {
    return {
      texto: "",
      observaciones,
    };
  }

  const rutaPreprocesada = await preprocesarImagenWindows(rutaArchivo);
  const candidatos = [rutaArchivo];

  if (rutaPreprocesada) {
    candidatos.unshift(rutaPreprocesada);
  }

  let mejorResultado = { ok: false, texto: "" };

  for (const candidato of candidatos) {
    const resultado = await ejecutarOcrImagen({
      comandoTesseract,
      rutaArchivo: candidato,
      idiomaTesseract,
    });

    if (puntuarTextoOcr(resultado.texto) > puntuarTextoOcr(mejorResultado.texto)) {
      mejorResultado = resultado;
    }
  }

  await eliminarArchivoTemporal(rutaPreprocesada);

  if (mejorResultado.ok && mejorResultado.texto.length > 0) {
    return {
      texto: mejorResultado.texto,
      observaciones,
    };
  }

  return {
    texto: mejorResultado.texto,
    observaciones: [...observaciones, OBSERVACION_OCR_NO_DISPONIBLE],
  };
}

function detectarPatente(texto) {
  const { limpio } = prepararTextoAnalisis(texto);
  const coincidencias =
    limpio.match(/\b([A-Z]{2}\s*[-.]?\s*\d{4}|[A-Z]{4}\s*[-.]?\s*\d{2})\b/g) ||
    [];

  for (const coincidencia of coincidencias) {
    const patente = normalizarPatente(coincidencia);
    if (patente) return patente;
  }

  return null;
}

function crearFechaLocal(anio, mes, dia) {
  const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia));

  if (
    fecha.getFullYear() !== Number(anio) ||
    fecha.getMonth() !== Number(mes) - 1 ||
    fecha.getDate() !== Number(dia)
  ) {
    return null;
  }

  if (Number(anio) < 2000 || Number(anio) > 2040) {
    return null;
  }

  return fecha;
}

function ultimoDiaDelMes(anio, mes) {
  return new Date(Number(anio), Number(mes), 0).getDate();
}

function formatearFechaISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function obtenerContexto(texto, indice, largo) {
  const inicio = Math.max(0, indice - 60);
  const fin = Math.min(texto.length, indice + largo + 60);

  return texto.slice(inicio, fin);
}

function extraerFechasNumericas(texto) {
  const fechas = [];
  const { limpio } = prepararTextoAnalisis(texto);
  const regexFechaCorta = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/g;
  const regexFechaIso = /\b(20\d{2})[/-](\d{1,2})[/-](\d{1,2})\b/g;

  let coincidencia = regexFechaCorta.exec(limpio);
  while (coincidencia) {
    const anio =
      coincidencia[3].length === 2
        ? `20${coincidencia[3]}`
        : coincidencia[3];
    const fecha = crearFechaLocal(anio, coincidencia[2], coincidencia[1]);

    if (fecha) {
      fechas.push({
        fecha,
        contexto: obtenerContexto(limpio, coincidencia.index, coincidencia[0].length),
        tipo: "numerica",
      });
    }

    coincidencia = regexFechaCorta.exec(limpio);
  }

  coincidencia = regexFechaIso.exec(limpio);
  while (coincidencia) {
    const fecha = crearFechaLocal(coincidencia[1], coincidencia[2], coincidencia[3]);

    if (fecha) {
      fechas.push({
        fecha,
        contexto: obtenerContexto(limpio, coincidencia.index, coincidencia[0].length),
        tipo: "numerica",
      });
    }

    coincidencia = regexFechaIso.exec(limpio);
  }

  return fechas;
}

export function extraerFechasTextuales(texto) {
  const fechas = [];
  const { limpio } = prepararTextoAnalisis(texto);
  const mesesRegex = Object.keys(MESES).join("|");
  const regexMesAnio = new RegExp(
    `\\b(?:VALIDO\\s+HASTA|VENCE|VENCIMIENTO|VALIDEZ|HASTA)?\\s*(${mesesRegex})(?:\\s+DE)?\\s+(20\\d{2})\\b`,
    "g"
  );
  const regexDiaMesAnio = new RegExp(
    `\\b(\\d{1,2})(?:\\s+DE)?\\s+(${mesesRegex})(?:\\s+DE)?\\s+(20\\d{2})\\b`,
    "g"
  );

  let coincidencia = regexDiaMesAnio.exec(limpio);
  while (coincidencia) {
    const dia = Number(coincidencia[1]);
    const mes = MESES[coincidencia[2]];
    const anio = Number(coincidencia[3]);
    const fecha = crearFechaLocal(anio, mes, dia);

    if (fecha) {
      fechas.push({
        fecha,
        contexto: obtenerContexto(limpio, coincidencia.index, coincidencia[0].length),
        tipo: "textual_dia_mes",
      });
    }

    coincidencia = regexDiaMesAnio.exec(limpio);
  }

  coincidencia = regexMesAnio.exec(limpio);
  while (coincidencia) {
    const textoPrevio = limpio.slice(Math.max(0, coincidencia.index - 12), coincidencia.index);

    if (/\d{1,2}\s+(?:DE\s+)?$/.test(textoPrevio)) {
      coincidencia = regexMesAnio.exec(limpio);
      continue;
    }

    const mes = MESES[coincidencia[1]];
    const anio = Number(coincidencia[2]);
    const dia = ultimoDiaDelMes(anio, mes);
    const fecha = crearFechaLocal(anio, mes, dia);

    if (fecha) {
      fechas.push({
        fecha,
        contexto: obtenerContexto(limpio, coincidencia.index, coincidencia[0].length),
        tipo: "textual_mes_anio",
      });
    }

    coincidencia = regexMesAnio.exec(limpio);
  }

  return fechas;
}

function extraerFechas(texto) {
  return [...extraerFechasNumericas(texto), ...extraerFechasTextuales(texto)];
}

function contextoIndicaVencimiento(contexto) {
  return /VALIDO HASTA|VALIDO|VALJDO|VALIOO|WALIDO|VENCE|VENCIMIENTO|VALIDEZ|HASTA|MASTA/.test(
    contexto
  );
}

function puntuarFecha(candidato) {
  let puntaje = candidato.fecha.getTime() / 100000000000;
  const contexto = prepararTextoAnalisis(candidato.contexto || "").limpio;

  if (contextoIndicaVencimiento(contexto)) {
    puntaje += 120;
  }

  if (/VENC|VIGENC|EXPIR/.test(contexto)) {
    puntaje += 60;
  }

  if (/REVISION TECNICA|REVISION/.test(contexto)) {
    puntaje += 20;
  }

  if (/FECHA REVISION|EMISION|FIRMA|FIRMADO/.test(contexto)) {
    puntaje -= 80;
  }

  if (candidato.tipo?.startsWith("textual")) {
    puntaje += 25;
  }

  return puntaje;
}

function seleccionarFechaVencimiento(texto) {
  const fechas = extraerFechas(texto);

  if (fechas.length === 0) return null;

  return fechas.sort((a, b) => puntuarFecha(b) - puntuarFecha(a))[0];
}

export function calcularEstadoRevisionTecnica(fechaISO) {
  if (!fechaISO) return ESTADO_REVISION_MANUAL;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const fecha = new Date(`${fechaISO}T00:00:00`);
  const diferenciaDias = Math.ceil((fecha.getTime() - hoy.getTime()) / 86400000);

  if (Number.isNaN(diferenciaDias)) return ESTADO_REVISION_MANUAL;
  if (diferenciaDias < 0) return "Vencida";
  if (diferenciaDias <= 30) return "Por vencer";
  return "Vigente";
}

function calcularConfianza({ texto, fecha, patenteDetectada, patenteRegistrada }) {
  if (!fecha) return "Baja";

  let puntaje = 0;
  const textoNormalizado = prepararTextoAnalisis(texto).limpio;
  const contexto = prepararTextoAnalisis(fecha.contexto || "").limpio;

  if (textoNormalizado.length > 80) puntaje += 1;
  if (contextoIndicaVencimiento(contexto)) {
    puntaje += 2;
  }
  if (fecha.tipo?.startsWith("textual")) puntaje += 1;

  if (patenteDetectada && patenteRegistrada) {
    puntaje += patenteDetectada === patenteRegistrada ? 2 : -2;
  } else if (patenteDetectada) {
    puntaje += 1;
  }

  if (puntaje >= 5) return "Alta";
  if (puntaje >= 2) return "Media";
  return "Baja";
}

function construirObservaciones({
  texto,
  fecha,
  patenteDetectada,
  patenteRegistrada,
  observacionesExtraccion,
}) {
  const observaciones = [...observacionesExtraccion];

  if (!texto || texto.length < 20) {
    observaciones.push(OBSERVACION_ANALISIS_FALLIDO);
  }

  if (patenteDetectada && patenteRegistrada && patenteDetectada !== patenteRegistrada) {
    observaciones.push(
      "La patente detectada no coincide con la patente registrada del vehículo."
    );
  }

  if (!patenteDetectada) {
    observaciones.push("No se detectó una patente clara en el documento.");
  }

  if (!fecha) {
    observaciones.push("No se detectó una fecha de vencimiento confiable.");
  } else {
    observaciones.push(
      `Fecha de vencimiento detectada automáticamente (${formatearFechaISO(
        fecha.fecha
      )}). Debe ser confirmada por secretaría.`
    );
  }

  return [...new Set(observaciones)].join(" ");
}

export async function analizarRevisionTecnicaDocumento({
  rutaArchivo,
  mimetype,
  patenteRegistrada,
}) {
  const extension = path.extname(rutaArchivo).toLowerCase();
  const patenteVehiculo = normalizarPatente(patenteRegistrada);

  try {
    let texto = "";
    let observacionesExtraccion = [];

    if (mimetype === "application/pdf" || extension === ".pdf") {
      const resultado = await extraerTextoPdf(rutaArchivo);
      texto = resultado.texto;
      observacionesExtraccion = resultado.observaciones;
    } else if ([".jpg", ".jpeg", ".png"].includes(extension)) {
      const resultado = await extraerTextoImagen(rutaArchivo);
      texto = resultado.texto;
      observacionesExtraccion = resultado.observaciones;
    }

    imprimirTextoDetectado(texto);

    const patenteDetectada = detectarPatente(texto);
    const fechaDetectada = seleccionarFechaVencimiento(texto);
    const fechaVencimiento = fechaDetectada
      ? formatearFechaISO(fechaDetectada.fecha)
      : null;
    const estado = calcularEstadoRevisionTecnica(fechaVencimiento);
    const confianza = calcularConfianza({
      texto,
      fecha: fechaDetectada,
      patenteDetectada,
      patenteRegistrada: patenteVehiculo,
    });

    return {
      fecha_vencimiento_revision_tecnica: fechaVencimiento,
      estado_revision_tecnica: fechaVencimiento ? estado : ESTADO_REVISION_MANUAL,
      patente_detectada_revision: patenteDetectada,
      confianza_revision_tecnica: fechaVencimiento ? confianza : "Baja",
      observacion_revision_tecnica: construirObservaciones({
        texto,
        fecha: fechaDetectada,
        patenteDetectada,
        patenteRegistrada: patenteVehiculo,
        observacionesExtraccion,
      }),
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[revision-tecnica-ia] Error al analizar documento:", error);
    }

    return {
      fecha_vencimiento_revision_tecnica: null,
      estado_revision_tecnica: ESTADO_REVISION_MANUAL,
      patente_detectada_revision: null,
      confianza_revision_tecnica: "Baja",
      observacion_revision_tecnica: OBSERVACION_ANALISIS_FALLIDO,
    };
  }
}
