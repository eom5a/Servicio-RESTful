-- Convierte en hypertable las dos series con volumen de escritura real.
-- El resto de tablas (catálogos, eventos puntuales) se quedan como tablas
-- normales de Postgres. Ver docs/fase-0.md para el razonamiento.
CREATE EXTENSION IF NOT EXISTS timescaledb;
--> statement-breakpoint
SELECT create_hypertable('body_measurements', 'ts', if_not_exists => TRUE);
--> statement-breakpoint
SELECT create_hypertable('heart_rate', 'ts', if_not_exists => TRUE);
