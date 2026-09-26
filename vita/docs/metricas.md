# Métricas — Fase 2

> Qué se trackea, cómo se calcula, de dónde sale el dato (tabla del
> esquema en `packages/db/src/schema.ts`) y cuándo debe disparar una
> alerta. Los umbrales citan el punto de `knowledge/` que los justifica;
> donde son heurística propia (sin ECA que fije el número exacto), se
> dice explícitamente — igual que en la Fase 1.

## Composición corporal (agente Métricas)

| Métrica | Cómo se calcula | Fuente | Frecuencia | Umbral de alerta |
|---|---|---|---|---|
| Peso — tendencia | Media móvil de **7 días** sobre `body_measurements.weight_kg` | `body_measurements` | Diaria | Ninguno directo; es la base de las demás |
| % grasa — tendencia | Media móvil de **2–4 semanas** sobre `body_measurements.fat_pct` (más ruido que el peso, `knowledge/metricas/investigacion.md` §1) | `body_measurements` | Diaria (se muestra la tendencia) | — |
| Masa magra — tendencia | Media móvil de 2–4 semanas sobre `body_measurements.lean_mass_kg`, o `weight_kg × (1 − fat_pct/100)` si la báscula no la reporta directamente | `body_measurements` | Diaria | **Aviso** si cae de forma sostenida (≥3–4 semanas) *y* el ritmo de pérdida de peso supera ~1 %/semana, o si cae con el peso estable (`knowledge/metricas/investigacion.md` §4). Umbral heurístico, sin ECA que fije el número exacto — declarado así en la Fase 1. |
| Ritmo real de pérdida | Pendiente semanal de la media móvil de peso (kg/semana) | Derivada de `body_measurements` | Semanal | **Aviso** si el ritmo supera 1 %/semana sostenido (riesgo de pérdida de masa magra) o si es ≈0 durante >3 semanas en fase de definición (déficit insuficiente) |
| Proyección de fecha al objetivo | Extrapolación lineal de la tendencia de % grasa hacia el 15 % (`docs/objetivos.md`) | Derivada | Semanal/mensual | Informativo, sin alerta propia |
| Agua corporal %, "grasa visceral" score, "edad metabólica" | Se muestran tal cual las reporta la báscula | `body_measurements` (columnas homónimas) | Diaria | **Nunca** se usan para decisiones — ruido/marketing sin validación (`knowledge/metricas/investigacion.md` §3). Se muestran solo como curiosidad en la web. |

## Nutrición (agente Nutrición)

| Métrica | Cómo se calcula | Fuente | Frecuencia | Umbral de alerta |
|---|---|---|---|---|
| Kcal ingeridas/día | Suma de `meal_items.grams × foods.kcal/100g` por día | `meals`, `meal_items`, `foods` | Diaria (evaluada en tendencia de 7 días) | **Aviso** si la media de 7 días se desvía >15 % del objetivo vigente durante más de una semana |
| Proteína ingerida/día (g y g/kg) | Igual que kcal, para `protein_g` | Idem | Diaria (tendencia 7 días) | **Aviso** si la media de 7 días cae por debajo de 170 g durante >3 días seguidos |
| Reparto de proteína por comida | Proteína por `meal_id` vs. objetivo de ~0.4 g/kg por toma en 3–4 tomas/día (`knowledge/nutricion/investigacion.md` §6) | `meal_items` agrupado por `meals` | Diaria | Informativo; el total diario manda sobre el reparto (evidencia alta de que el timing importa poco si el total ya es correcto) |
| Adherencia de registro | % de días con al menos una comida registrada, sobre los últimos 7/30 días | `meals` | Semanal | **Aviso** si adherencia de registro <70 % en la última semana (los demás cálculos dejan de ser fiables) |
| Déficit real vs. objetivo teórico | Kcal ingeridas (media 7 días) − TDEE estimado (ver `docs/cruces.md`) | Derivada | Semanal | Ver ajuste de objetivo calórico en `docs/objetivos.md` (TDEE adaptativo) |

## Deporte (agente Deporte)

| Métrica | Cómo se calcula | Fuente | Frecuencia | Umbral de alerta |
|---|---|---|---|---|
| Carga de entrenamiento semanal | Suma de `workouts.load` (o `duration_min × intensidad` si `load` no viene del origen) por semana | `workouts` | Semanal | Se usa junto con recuperación, no sola (ver ACWR) |
| ACWR (carga aguda:crónica) | Carga última semana ÷ media de las 4 anteriores | Derivada de `workouts` | Semanal | **Heurística blanda**, no umbral duro: usar solo como señal de "¿subí demasiado rápido esta semana?" (`knowledge/deporte/investigacion.md` §2 — el modelo tiene críticas metodológicas serias) |
| HRV — tendencia | Media móvil de 7 días sobre `daily_activity.hrv`, comparada con la línea base individual (media de 4–8 semanas previas) | `daily_activity` | Diaria | **Aviso** si la tendencia de 7 días cae de forma sostenida por debajo de la línea base junto con carga alta (`knowledge/deporte/investigacion.md` §3) |
| FC en reposo — tendencia | Media móvil de 7 días sobre `daily_activity.resting_hr` | `daily_activity` | Diaria | **Aviso** si sube de forma sostenida ~3–7 lpm sobre el basal durante varias semanas |
| Sueño (minutos y score) | `daily_activity.sleep_minutes`, `sleep_score`; también `sleep_sessions.stages` si están disponibles | `daily_activity`, `sleep_sessions` | Diaria | **Aviso** si el promedio de 7 días cae de forma sostenida por debajo de ~6.5 h (heurística general, no específica de esta población) |
| Volumen de entrenamiento por grupo muscular | Series semanales estimadas por grupo (si el origen las reporta) | `workouts.raw_data` | Semanal | Objetivo 8–15 series/grupo/semana en fase de definición, sin recortar solo por estar en déficit (`knowledge/deporte/investigacion.md` §5) |

## Doctor (agente Doctor)

| Métrica | Cómo se calcula | Fuente | Frecuencia | Umbral de alerta |
|---|---|---|---|---|
| Evolución de cada marcador | Serie de `lab_results.value` para el mismo `marker`, comparada con `range_min`/`range_max` **del propio informe** (no un valor fijo — los rangos varían por laboratorio) | `lab_reports`, `lab_results` | Por evento (nueva analítica subida) | **"Comentar con tu médico"** si un valor cae fuera de rango, o si la tendencia se acerca al límite en ≥2 analíticas consecutivas. Nunca se presenta como diagnóstico (límite obligatorio del Doctor). |

## Notas de implementación

- Todas las medias móviles se calculan sobre los datos ya guardados; no
  hace falta una columna adicional en el esquema — son consultas
  (`packages/db`) sobre las tablas existentes.
- Los umbrales de "aviso"/"alerta" arriba son el punto de partida y se
  escriben en `agent_insights.severity`. Se espera afinarlos con datos
  reales (algunos son heurística declarada, no un valor validado en un
  ECA — ver la columna de fuente en cada tabla de la Fase 1).
- Ver `docs/cruces.md` para las combinaciones entre estas métricas
  (p. ej. carga vs. HRV, sueño vs. adherencia del día siguiente).
