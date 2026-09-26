# Informes — Fase 2

> Qué contiene cada tipo de informe (`reports.type`), con qué
> periodicidad, quién lo redacta y a partir de qué métricas/cruces de
> `docs/metricas.md` y `docs/cruces.md`. El canal (email) y la
> implementación del envío son Fase 5; aquí solo se define el contenido.

## Diario — cada mañana

**Quién contribuye:** Métricas (pesaje de hoy) + Nutrición (adherencia de
ayer) + Deporte (si hubo entreno ayer) consolidados por el Director.
**Disparador sugerido:** poco después de la hora habitual de pesaje de
Enric (p. ej. 9:30, coincidiendo con el intento de sincronización de
Fitdays de la Fase 3).

Contenido:
1. Pesaje de hoy y su posición respecto a la media móvil de 7 días
   (cruce #1) — un par de frases, no un párrafo largo.
2. Resumen de ayer: kcal y proteína ingeridas vs. objetivo, y si hubo
   entreno, un resumen de una línea (tipo, duración, carga aproximada).
3. Una única recomendación concreta para hoy (no una lista larga): el
   tipo de ajuste que haría el agente de Nutrición o Deporte según lo
   visto los últimos días. Si no hay nada que ajustar, decirlo
   explícitamente ("vas dentro de lo esperado, sin cambios").
4. Si hay una alerta abierta (`agent_insights` con severidad "aviso" o
   "alerta" sin resolver), se menciona aquí siempre, no se espera al
   informe semanal.

Extensión objetivo: léase en menos de 30 segundos desde el móvil.

## Semanal — domingo

**Quién contribuye:** los 4 agentes de dominio, consolidado por el
Director. Es el informe donde se revisan objetivos, no solo se reportan.

Contenido:
1. Tendencia de la semana: peso (media móvil), % grasa/masa magra
   (cruce #2), y comparación contra el ritmo objetivo de
   `docs/objetivos.md`.
2. Déficit real vs. teórico de la semana y TDEE estimado actualizado
   (cruces #3 y #4) — y si el agente de Nutrición propone un ajuste de
   objetivo calórico, se explica aquí con su justificación (esto genera
   una fila en `agent_decisions`, no solo un párrafo de texto).
3. Adherencia nutricional de la semana (% de días registrados, kcal y
   proteína medias vs. objetivo) y si hay un patrón claro (p. ej. fin de
   semana peor, cruce #11).
4. Resumen de entrenamientos de la semana: carga total, y su relación
   con HRV/FC en reposo (cruce #6) — con una valoración explícita de si
   la recuperación acompaña o no.
5. Alertas abiertas y cerradas desde el informe anterior.

## Mensual — progreso global

**Quién contribuye:** Director, consolidando el mes completo.

Contenido:
1. Progreso hacia el objetivo de la fase (`docs/objetivos.md`):
   variación de peso/grasa del mes, y **proyección de fecha** actualizada
   para llegar al 15 % al ritmo actual (cruce #10).
2. Revisión explícita de si el ritmo real coincide con el objetivo
   (0.28–0.35 kg/semana) — si lleva 2+ meses desviado, se plantea aquí
   si ajustar el objetivo calórico de forma más permanente (no solo el
   ajuste semanal habitual).
3. Resumen de entrenamiento del mes: volumen total, progresión, y si
   hubo periodos de sobrecarga o falta de estímulo detectados.
4. Si hubo una analítica ese mes, su resumen entra aquí también (además
   del informe de evento inmediato).
5. Un cierre explícito: "sigues en la fase de Definición" o, si se
   cumple el criterio de cambio de fase de `docs/objetivos.md`, una
   propuesta explícita de pasar a la transición/Volumen, para que Enric
   la apruebe (no es un cambio automático).

## Evento — inmediato, cuando ocurre algo puntual

Se genera fuera de la cadencia fija, en cuanto ocurre:

1. **Nueva analítica subida:** el Doctor extrae los valores, los compara
   con analíticas anteriores (cruce #9), y el informe resume qué está
   dentro de rango, qué no, y qué se marca como "comentar con tu médico"
   — nunca un diagnóstico. Se incluye también el cruce #12/#13 si aplica
   (contexto de fase de dieta o suplementación activa).
2. **Alerta de recuperación:** cuando el agente de Deporte detecta
   sobrecarga sostenida (carga alta + HRV/RHR deteriorados varias
   semanas, `docs/metricas.md`), se envía en cuanto se confirma la
   tendencia (no en el mismo día que aparece un valor puntual raro).
3. **Desviación importante:** cualquier cambio de objetivo relevante
   (`agent_decisions` con `approved = true`) que no pueda esperar al
   informe semanal — p. ej. si el déficit real resulta ser mucho mayor o
   menor de lo esperado ya en la primera semana.

## Formato común

Todos los informes son HTML legible en móvil, con las gráficas
relevantes embebidas como imagen (no interactivas — para eso está la
web) y un enlace a la pantalla correspondiente. Se guardan en la tabla
`reports` (`type`, `html_content`, `sent`) para tener historial, se
puedan revisar después en la web independientemente de si el email
llegó o no.
