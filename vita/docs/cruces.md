# Cruces — Fase 2

> Combinaciones de métricas que aportan más información juntas que por
> separado. Los 10 primeros son los de la sección 6 del documento de
> arranque, desarrollados; del 11 en adelante son cruces adicionales que
> surgen del propio modelo de datos y de `knowledge/`. Cada uno indica
> qué agente lo usa y con qué fin — el diseño visual concreto (qué
> gráfica, en qué pantalla) es Fase 4, no aquí.

1. **Peso diario + media móvil 7 días + objetivo.**
   Eje X tiempo, eje Y peso; la línea de media móvil es la que importa
   (el dato diario se muestra tenue, como referencia de ruido). Línea de
   objetivo (78.4 kg, `docs/objetivos.md`) como referencia horizontal.
   Uso: agente de Métricas, base de casi todo lo demás.

2. **% grasa y masa magra en el tiempo (detectar pérdida de músculo).**
   Doble serie sobre el mismo eje temporal, ambas suavizadas (media móvil
   2–4 semanas). Uso: agente de Métricas, para el aviso de pérdida de
   masa magra de `docs/metricas.md`.

3. **Kcal ingeridas vs. gasto estimado → déficit real vs. teórico.**
   Doble eje: ingesta diaria (media 7 días) y gasto estimado
   (`daily_activity.kcal_out` + ajuste por TDEE adaptativo, ver #4). La
   diferencia entre ambas líneas es el déficit/superávit real. Uso:
   agente de Nutrición, para decidir si el objetivo calórico vigente
   sigue siendo correcto.

4. **TDEE adaptativo.**
   No es una gráfica de dos series sino un cálculo derivado:
   `TDEE_estimado ≈ ingesta_media_7d − (Δpeso_7d_kg × 7700 / 7)`. Se
   recalcula semanalmente y se compara contra el TDEE de la semana
   anterior — una serie temporal de "TDEE estimado" propia. Uso: agente
   de Nutrición, es el mecanismo central del ajuste adaptativo descrito
   en `knowledge/nutricion/investigacion.md` §4.

5. **Proteína diaria vs. objetivo, y reparto por comida.**
   Barras diarias de proteína total (con línea de objetivo de 180 g) +
   vista secundaria del reparto por `meal_type` en un día concreto. Uso:
   agente de Nutrición.

6. **Carga de entrenamiento semanal vs. HRV y FC en reposo.**
   Doble eje: barras de carga semanal (`workouts.load` agregado) contra
   líneas de tendencia de HRV y FC en reposo (`daily_activity`). Uso:
   agente de Deporte, para detectar sobreentrenamiento (carga alta +
   HRV/RHR deteriorados sostenidos) o falta de estímulo (carga baja sin
   progreso).

7. **Horas y calidad de sueño vs. hambre/adherencia al día siguiente y
   rendimiento.**
   Sueño de la noche N contra adherencia nutricional y (si hay datos de
   `workouts` ese día) rendimiento del día N+1. Uso: agentes de Deporte y
   Nutrición conjuntamente — es del tipo de cruce que el Director debe
   consolidar porque toca a los dos dominios. Nivel de evidencia de que
   el sueño afecta a ambas cosas: alta en general (fuera del alcance de
   la Fase 1, no se investigó específicamente), pero la relación causal
   exacta en este usuario concreto solo se podrá confirmar con sus
   propios datos.

8. **Días de entreno vs. descanso: ingesta y peso.**
   Comparar ingesta media y variación de peso en días con `workouts`
   registrado ese día vs. días sin entreno. Uso: agente de Nutrición,
   para detectar si Enric come sistemáticamente distinto en días de
   entreno (patrón mencionado explícitamente en su prompt).

9. **Evolución de cada marcador de la analítica con sus rangos.**
   Una serie por `marker` de `lab_results`, con banda sombreada entre
   `range_min` y `range_max` **del informe correspondiente** (no un rango
   fijo, ver `docs/metricas.md`). Uso: agente Doctor.

10. **Proyección de fecha para llegar al 15 % según el ritmo actual.**
    Extrapolación lineal de la tendencia de % grasa (cruce #2) hacia el
    objetivo, actualizada semanalmente. Uso: agente de Métricas,
    consolidado por el Director en el informe mensual.

## Cruces adicionales (no en la lista original, útiles dado el modelo de datos)

11. **Adherencia de registro por día de la semana.**
    Adherencia de registro de comidas (`docs/metricas.md`) agrupada por
    día de la semana, para confirmar o descartar el patrón típico de
    "fin de semana peor registrado" antes de que el agente de Nutrición
    lo dé por hecho.

12. **Testosterona / perfil tiroideo (analítica) vs. duración acumulada
    del déficit calórico.**
    Cruce entre Doctor y Nutrición/Métricas: situar cada analítica sobre
    la línea de tiempo de fases (`phases`) y semanas en déficit
    continuado. Justificación: `knowledge/doctor/investigacion.md` §7 y
    §8 documentan que la restricción calórica prolongada puede afectar a
    ambos ejes hormonales. Esto es contexto para el Doctor, nunca una
    alerta automática por sí sola — el propio documento pide siempre
    "comentar con tu médico" ante cualquier valor relevante.

13. **Suplementos activos vs. evolución del marcador relacionado.**
    Superponer el periodo de un `supplement` (p. ej. vitamina D, desde
    `supplements.start_date`) sobre la serie de su marcador asociado en
    `lab_results` (25-OH-D), para ver si la analítica siguiente refleja
    el efecto esperado. Uso: agente Doctor, y solo informativo — nunca
    para ajustar dosis de medicación (límite obligatorio).

14. **ACWR vs. avisos de recuperación abiertos.**
    Cruce interno del agente de Deporte: marcar en la serie de carga
    semanal (#6) los periodos en que además hubo un `agent_insight` de
    severidad "aviso" o "alerta" sobre recuperación, para revisar a
    posteriori si el ACWR como heurística blanda realmente coincidió con
    los avisos reales o no — es una forma de auto-evaluar si esa
    heurística (evidencia media-baja, `knowledge/deporte/
    investigacion.md` §2) está aportando algo en la práctica de Enric.
