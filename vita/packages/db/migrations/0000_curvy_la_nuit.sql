CREATE TYPE "public"."agent_name" AS ENUM('director', 'nutricion', 'metricas', 'deporte', 'doctor');--> statement-breakpoint
CREATE TYPE "public"."insight_severity" AS ENUM('info', 'aviso', 'alerta');--> statement-breakpoint
CREATE TYPE "public"."phase_type" AS ENUM('definicion', 'mantenimiento', 'volumen');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('diario', 'semanal', 'mensual', 'evento');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('M', 'F', 'otro');--> statement-breakpoint
CREATE TYPE "public"."supplement_kind" AS ENUM('suplemento', 'medicacion');--> statement-breakpoint
CREATE TABLE "agent_decisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"agent" "agent_name" NOT NULL,
	"change" text NOT NULL,
	"justification" text NOT NULL,
	"approved" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"agent" "agent_name" NOT NULL,
	"type" text NOT NULL,
	"severity" "insight_severity" DEFAULT 'info' NOT NULL,
	"text" text NOT NULL,
	"data_ref" jsonb
);
--> statement-breakpoint
CREATE TABLE "body_measurements" (
	"ts" timestamp with time zone NOT NULL,
	"weight_kg" numeric(5, 2),
	"fat_pct" numeric(4, 1),
	"muscle_mass_kg" numeric(5, 2),
	"lean_mass_kg" numeric(5, 2),
	"water_pct" numeric(4, 1),
	"visceral_fat" numeric(4, 1),
	"bmr" numeric(6, 0),
	"source" text NOT NULL,
	CONSTRAINT "body_measurements_ts_source_pk" PRIMARY KEY("ts","source")
);
--> statement-breakpoint
CREATE TABLE "daily_activity" (
	"date" date NOT NULL,
	"steps" integer,
	"kcal_out" numeric(6, 0),
	"active_minutes" integer,
	"resting_hr" integer,
	"hrv" numeric(5, 1),
	"sleep_minutes" integer,
	"sleep_score" numeric(4, 1),
	"source" text NOT NULL,
	CONSTRAINT "daily_activity_date_source_pk" PRIMARY KEY("date","source")
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"barcode" text,
	"kcal" numeric(6, 1) NOT NULL,
	"protein_g" numeric(5, 1) NOT NULL,
	"fat_g" numeric(5, 1) NOT NULL,
	"carbs_g" numeric(5, 1) NOT NULL,
	"fiber_g" numeric(5, 1),
	"per_100g" boolean DEFAULT true NOT NULL,
	"source" text
);
--> statement-breakpoint
CREATE TABLE "heart_rate" (
	"ts" timestamp with time zone NOT NULL,
	"bpm" integer NOT NULL,
	"source" text NOT NULL,
	CONSTRAINT "heart_rate_ts_source_pk" PRIMARY KEY("ts","source")
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"provider" text PRIMARY KEY NOT NULL,
	"encrypted_tokens" text,
	"last_sync" timestamp with time zone,
	"status" text DEFAULT 'desconectado' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lab_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"lab" text,
	"pdf_path" text
);
--> statement-breakpoint
CREATE TABLE "lab_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" uuid NOT NULL,
	"marker" text NOT NULL,
	"value" numeric(10, 3),
	"unit" text,
	"range_min" numeric(10, 3),
	"range_max" numeric(10, 3),
	"out_of_range" boolean
);
--> statement-breakpoint
CREATE TABLE "meal_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"meal_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"grams" numeric(6, 1) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ts" timestamp with time zone NOT NULL,
	"meal_type" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "phase_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"goals" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ts" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "report_type" NOT NULL,
	"html_content" text NOT NULL,
	"sent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sleep_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"start_ts" timestamp with time zone NOT NULL,
	"end_ts" timestamp with time zone NOT NULL,
	"stages" jsonb,
	"score" numeric(4, 1)
);
--> statement-breakpoint
CREATE TABLE "supplements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"dose" numeric(8, 2),
	"unit" text,
	"schedule" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"reason" text,
	"kind" "supplement_kind" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"height_cm" numeric(5, 1),
	"birth_date" date,
	"sex" "sex",
	"current_phase_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"type" text NOT NULL,
	"start_ts" timestamp with time zone NOT NULL,
	"duration_min" numeric(6, 1),
	"distance_km" numeric(6, 2),
	"kcal" numeric(6, 0),
	"avg_hr" integer,
	"max_hr" integer,
	"load" numeric(6, 1),
	"raw_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_report_id_lab_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."lab_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_current_phase_id_phases_id_fk" FOREIGN KEY ("current_phase_id") REFERENCES "public"."phases"("id") ON DELETE no action ON UPDATE no action;