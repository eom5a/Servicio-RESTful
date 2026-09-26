import {
  pgTable,
  pgEnum,
  uuid,
  serial,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────

export const phaseTypeEnum = pgEnum("phase_type", [
  "definicion",
  "mantenimiento",
  "volumen",
]);

export const sexEnum = pgEnum("sex", ["M", "F", "otro"]);

export const insightSeverityEnum = pgEnum("insight_severity", [
  "info",
  "aviso",
  "alerta",
]);

export const supplementKindEnum = pgEnum("supplement_kind", [
  "suplemento",
  "medicacion",
]);

export const reportTypeEnum = pgEnum("report_type", [
  "diario",
  "semanal",
  "mensual",
  "evento",
]);

export const agentNameEnum = pgEnum("agent_name", [
  "director",
  "nutricion",
  "metricas",
  "deporte",
  "doctor",
]);

// ── Perfil y fases ───────────────────────────────────────────────────────

export const phases = pgTable("phases", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: phaseTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  goals: jsonb("goals").notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userProfile = pgTable("user_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  heightCm: numeric("height_cm", { precision: 5, scale: 1 }),
  birthDate: date("birth_date"),
  sex: sexEnum("sex"),
  currentPhaseId: uuid("current_phase_id").references(() => phases.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Composición corporal y actividad (series temporales) ────────────────

// Hypertable (partición por `ts`, ver migración 0002_timescale_hypertables.sql)
export const bodyMeasurements = pgTable(
  "body_measurements",
  {
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
    fatPct: numeric("fat_pct", { precision: 4, scale: 1 }),
    muscleMassKg: numeric("muscle_mass_kg", { precision: 5, scale: 2 }),
    leanMassKg: numeric("lean_mass_kg", { precision: 5, scale: 2 }),
    waterPct: numeric("water_pct", { precision: 4, scale: 1 }),
    visceralFat: numeric("visceral_fat", { precision: 4, scale: 1 }),
    bmr: numeric("bmr", { precision: 6, scale: 0 }),
    source: text("source").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ts, table.source] }),
  }),
);

export const dailyActivity = pgTable(
  "daily_activity",
  {
    date: date("date").notNull(),
    steps: integer("steps"),
    kcalOut: numeric("kcal_out", { precision: 6, scale: 0 }),
    activeMinutes: integer("active_minutes"),
    restingHr: integer("resting_hr"),
    hrv: numeric("hrv", { precision: 5, scale: 1 }),
    sleepMinutes: integer("sleep_minutes"),
    sleepScore: numeric("sleep_score", { precision: 4, scale: 1 }),
    source: text("source").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.date, table.source] }),
  }),
);

// Hypertable (partición por `ts`)
export const heartRate = pgTable(
  "heart_rate",
  {
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    bpm: integer("bpm").notNull(),
    source: text("source").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ts, table.source] }),
  }),
);

export const sleepSessions = pgTable("sleep_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  startTs: timestamp("start_ts", { withTimezone: true }).notNull(),
  endTs: timestamp("end_ts", { withTimezone: true }).notNull(),
  stages: jsonb("stages"),
  score: numeric("score", { precision: 4, scale: 1 }),
});

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull(),
  type: text("type").notNull(),
  startTs: timestamp("start_ts", { withTimezone: true }).notNull(),
  durationMin: numeric("duration_min", { precision: 6, scale: 1 }),
  distanceKm: numeric("distance_km", { precision: 6, scale: 2 }),
  kcal: numeric("kcal", { precision: 6, scale: 0 }),
  avgHr: integer("avg_hr"),
  maxHr: integer("max_hr"),
  load: numeric("load", { precision: 6, scale: 1 }),
  rawData: jsonb("raw_data"),
});

// ── Nutrición ─────────────────────────────────────────────────────────────

export const foods = pgTable("foods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  brand: text("brand"),
  barcode: text("barcode"),
  kcal: numeric("kcal", { precision: 6, scale: 1 }).notNull(),
  proteinG: numeric("protein_g", { precision: 5, scale: 1 }).notNull(),
  fatG: numeric("fat_g", { precision: 5, scale: 1 }).notNull(),
  carbsG: numeric("carbs_g", { precision: 5, scale: 1 }).notNull(),
  fiberG: numeric("fiber_g", { precision: 5, scale: 1 }),
  per100g: boolean("per_100g").notNull().default(true),
  source: text("source"),
});

export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  ts: timestamp("ts", { withTimezone: true }).notNull(),
  mealType: text("meal_type").notNull(),
});

export const mealItems = pgTable("meal_items", {
  id: serial("id").primaryKey(),
  mealId: uuid("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  foodId: uuid("food_id")
    .notNull()
    .references(() => foods.id),
  grams: numeric("grams", { precision: 6, scale: 1 }).notNull(),
});

// ── Suplementación y medicación ──────────────────────────────────────────

export const supplements = pgTable("supplements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  dose: numeric("dose", { precision: 8, scale: 2 }),
  unit: text("unit"),
  schedule: text("schedule"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  reason: text("reason"),
  kind: supplementKindEnum("kind").notNull(),
});

// ── Analíticas ────────────────────────────────────────────────────────────

export const labReports = pgTable("lab_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date").notNull(),
  lab: text("lab"),
  pdfPath: text("pdf_path"),
});

export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => labReports.id, { onDelete: "cascade" }),
  marker: text("marker").notNull(),
  value: numeric("value", { precision: 10, scale: 3 }),
  unit: text("unit"),
  rangeMin: numeric("range_min", { precision: 10, scale: 3 }),
  rangeMax: numeric("range_max", { precision: 10, scale: 3 }),
  outOfRange: boolean("out_of_range"),
});

// ── Memoria compartida de agentes ────────────────────────────────────────

export const agentInsights = pgTable("agent_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
  agent: agentNameEnum("agent").notNull(),
  type: text("type").notNull(),
  severity: insightSeverityEnum("severity").notNull().default("info"),
  text: text("text").notNull(),
  dataRef: jsonb("data_ref"),
});

export const agentDecisions = pgTable("agent_decisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
  agent: agentNameEnum("agent").notNull(),
  change: text("change").notNull(),
  justification: text("justification").notNull(),
  approved: boolean("approved").notNull().default(false),
});

// ── Informes ──────────────────────────────────────────────────────────────

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
  type: reportTypeEnum("type").notNull(),
  htmlContent: text("html_content").notNull(),
  sent: boolean("sent").notNull().default(false),
});

// ── Integraciones externas ──────────────────────────────────────────────

export const integrations = pgTable("integrations", {
  provider: text("provider").primaryKey(),
  // Cifrado en la aplicación con AES-256-GCM antes de guardar (ver crypto.ts).
  encryptedTokens: text("encrypted_tokens"),
  lastSync: timestamp("last_sync", { withTimezone: true }),
  status: text("status").notNull().default("desconectado"),
});
