/**
 * Importación manual del export de la app Fitdays (sección 4.1, opción
 * "Plan B manual"). Fitdays es solo app móvil (iOS/Android): no tiene
 * portal web ni API pública, y su "exportar CSV" en realidad genera un
 * fichero en formato Excel legacy (OLE2 / CDFV2), no texto CSV real,
 * pese al nombre `Fitdays-xxxx.csv` — por eso se usa `xlsx` (SheetJS),
 * que lee ambos formatos de forma transparente.
 *
 * Orden de columnas y formato de fecha verificados contra un proyecto de
 * terceros que integra con exports reales de Fitdays (no se ha podido
 * verificar contra un export real de Enric ni contra documentación
 * oficial de Fitdays, que no publica el formato): fecha, peso, IMC,
 * grasa corporal %, grasa subcutánea %, frecuencia cardiaca, índice
 * cardiaco, grasa visceral, agua %, músculo esquelético %, masa muscular
 * (kg), masa ósea (kg), proteína %, BMR (kcal), edad corporal. Los
 * nombres de cabecera pueden venir en el idioma configurado en la app
 * (holandés en la referencia usada); por eso el mapeo es **por posición
 * de columna**, no por nombre, y la cabecera solo se usa para advertir si
 * el número de columnas no coincide con lo esperado.
 *
 * Confirmar con la primera importación real de Enric que el orden sigue
 * siendo este.
 */
import * as XLSX from "xlsx";

const EXPECTED_COLUMN_COUNT = 15;

export type FitdaysRow = {
  ts: Date;
  weightKg: number | null;
  fatPct: number | null;
  muscleMassKg: number | null;
  waterPct: number | null;
  visceralFat: number | null;
  bmr: number | null;
};

export type FitdaysParseResult = {
  rows: FitdaysRow[];
  warnings: string[];
};

function parseNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const text = String(raw).trim();
  if (!text || text === "- -" || text === "--") return null;
  const cleaned = text.replace(/[^\d,.-]/g, "");
  const normalized = cleaned.includes(".")
    ? cleaned.replace(/,/g, "")
    : cleaned.replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

/**
 * Columnas de porcentaje (grasa, agua): al leer un CSV de texto plano,
 * SheetJS reconoce el sufijo "%" y convierte la celda a un número ya
 * dividido entre 100 (p. ej. "13.3%" -> 0.133), igual que haría Excel.
 * En un .xls real con la celda ya tipada como número puede no llevar ese
 * sufijo. Cubrimos ambos casos: si llega como número entre 0 y 1, se
 * asume fracción y se multiplica por 100; si no, se trata como
 * `parseNumber` normal.
 */
function parsePercent(raw: unknown): number | null {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return null;
    return raw > 0 && raw <= 1 ? raw * 100 : raw;
  }
  return parseNumber(raw);
}

/** Formato observado: "HH:MM DD/MM/YYYY". */
function parseFitdaysDate(raw: unknown): Date | null {
  const text = String(raw ?? "").trim();
  const match = /^(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, hh, mm, dd, mo, yyyy] = match;
  const date = new Date(
    Number(yyyy),
    Number(mo) - 1,
    Number(dd),
    Number(hh),
    Number(mm),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseFitdaysExport(buffer: Buffer): FitdaysParseResult {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], warnings: ["El archivo no contiene ninguna hoja"] };
  }

  const sheet = workbook.Sheets[sheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
  });

  const warnings: string[] = [];
  if (raw.length === 0) {
    return { rows: [], warnings: ["El archivo está vacío"] };
  }

  const [header, ...dataRows] = raw;
  if (header.length !== EXPECTED_COLUMN_COUNT) {
    warnings.push(
      `La cabecera tiene ${header.length} columnas; se esperaban ${EXPECTED_COLUMN_COUNT}. ` +
        "El formato de Fitdays puede haber cambiado — revisar el mapeo en fitdays-import.ts.",
    );
  }

  const rows: FitdaysRow[] = [];
  for (const [i, row] of dataRows.entries()) {
    const ts = parseFitdaysDate(row[0]);
    if (!ts) {
      warnings.push(`Fila ${i + 2}: fecha no reconocida ("${row[0]}"), omitida`);
      continue;
    }
    rows.push({
      ts,
      weightKg: parseNumber(row[1]),
      fatPct: parsePercent(row[3]),
      muscleMassKg: parseNumber(row[10]),
      waterPct: parsePercent(row[8]),
      visceralFat: parseNumber(row[7]),
      bmr: parseNumber(row[13]),
    });
  }

  return { rows, warnings };
}
