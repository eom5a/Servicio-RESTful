# Objetivos — Fase 2

> Revisión de los números de partida (sección 1 del documento de
> arranque) hecha por los agentes de Nutrición y Métricas, con el
> Director consolidando. Se citan los puntos de `knowledge/` que
> justifican cada cifra; donde no hay evidencia directa se dice
> explícitamente.

## Punto de partida (sin cambios, tal como lo dio Enric)

| Dato | Valor |
|---|---|
| Peso | 84.4 kg |
| Grasa corporal | 21 % |
| Masa grasa estimada | ≈17.7 kg |
| Masa magra estimada | ≈66.7 kg |
| Horizonte | 4–5 meses |

## Fase actual: Definición

### Objetivo de composición corporal
**15 % de grasa corporal preservando la masa magra actual (~66.7 kg).**
Si la masa magra se mantiene constante, eso implica un peso objetivo de
≈**78.4 kg** (66.7 / 0.85) — es decir, perder ≈**6 kg de grasa**, no 6 kg
de peso total; el peso real bajará algo menos si se gana algo de músculo
en paralelo (posible entrenando fuerza en un déficit moderado, ver
`knowledge/deporte/investigacion.md` §1).

### Ritmo objetivo y por qué es conservador
6 kg de grasa en 4–5 meses (17–22 semanas) = **≈0.28–0.35 kg/semana**, o
≈0.33–0.41 % del peso corporal por semana. Esto está **por debajo** del
rango 0.5–1 %/semana que `knowledge/nutricion/investigacion.md` §2
asocia a pérdida mínima de masa magra en atletas entrenados en fuerza —
es decir, el horizonte de 4–5 meses ya es conservador para el objetivo,
lo que da margen de seguridad. No hace falta acelerarlo.

### Objetivo calórico: revisado, no solo aceptado
El plan propio de partida (~2100–2200 kcal/día) implica, para el ritmo de
pérdida anterior, un déficit diario de solo ≈**305–385 kcal** (usando la
aproximación estándar de ~7700 kcal por kg de grasa). Esto es coherente
con un déficit moderado, no agresivo — buena señal para preservar masa
magra. **Se mantiene 2100–2200 kcal/día como punto de partida**, pero
por diseño **no es un número fijo**: el agente de Nutrición debe
recalcularlo cada 1–2 semanas comparando la tendencia real de peso
(media móvil de 7 días, ver `docs/metricas.md`) contra la ingesta
registrada — el TDEE real de Enric no se conoce con precisión (no hay
altura/edad exactas registradas para una fórmula, y las fórmulas tienen
±10 % de error según `knowledge/nutricion/investigacion.md` §4 de
todos modos). Esto es exactamente el "TDEE adaptativo" descrito ahí.

### Objetivo de proteína: revisado, no solo aceptado
180–185 g/día equivale a ≈2.7–2.8 g/kg de masa magra estimada, dentro
del rango 2.3–3.1 g/kg FFM que `knowledge/nutricion/investigacion.md`
§1 recomienda para déficits agresivos o % de grasa ya bajo. Como este
déficit es moderado (no agresivo), el extremo alto no es estrictamente
necesario, pero mantenerlo da margen de seguridad sin coste real (más
allá de la saciedad/practicidad de comerlo). **Se mantiene 180 g/día**
como objetivo, con un rango aceptable de 170–190 g/día según apetito y
practicidad.

### Grasa y carbohidratos (no estaban definidos, se proponen ahora)
- **Grasa: 60–70 g/día** (~0.7–0.8 g/kg peso corporal) — dentro del
  mínimo de 0.5–1 g/kg que la literatura de composición corporal asocia
  a mantener función hormonal normal durante un déficit (position stand
  ISSN *diets and body composition*, ya citado en
  `knowledge/nutricion/investigacion.md` §1). Nivel de evidencia: media
  (el rango es más una guía de consenso que un número exacto validado).
- **Carbohidratos: el resto de las calorías** tras fijar proteína y
  grasa — con 2150 kcal, 182 g proteína y 65 g grasa, quedan
  ≈**205–210 g/día** de carbohidratos. Se ajustan automáticamente cuando
  cambie el objetivo calórico.
- **Fibra: ≈30 g/día** (heurística general de ~14 g por cada 1000 kcal,
  guía dietética ampliamente usada, no específica de esta población).
  Nivel de evidencia: media — es una recomendación poblacional general,
  no validada específicamente para deportistas en déficit.

### Resumen de objetivos — Definición

| Variable | Objetivo | Revisado vs. plan original |
|---|---|---|
| Kcal/día | 2100–2200 (recalculado cada 1–2 semanas según tendencia real) | Mantenido, con recalibración adaptativa explícita |
| Proteína | 180 g/día (rango 170–190) | Mantenido |
| Grasa | 60–70 g/día | Nuevo |
| Carbohidratos | ≈205–210 g/día (resto) | Nuevo |
| Fibra | ≈30 g/día | Nuevo |
| Ritmo de pérdida | 0.28–0.35 kg/semana (peso), objetivo real es grasa | Añadido como objetivo explícito con umbrales |

## Fase siguiente: Volumen (al llegar al 15 %)

No se salta directo a superávit franco:

1. **Transición (reverse diet), 2–4 semanas:** subir la ingesta de forma
   gradual (≈5–10 % de las kcal cada 1–2 semanas) hasta mantenimiento
   calórico real, dejando estabilizarse agua/glucógeno antes de pasar a
   superávit. Justificación: `knowledge/nutricion/investigacion.md` §5
   — evidencia baja/anecdótica sobre la velocidad óptima exacta, pero el
   principio de subida gradual (vs. salto brusco) tiene más consenso.
2. **Volumen, superávit ligero:** +200 a +300 kcal/día sobre el
   mantenimiento recalibrado (no sobre las 2100–2200 kcal de la fase de
   definición, que ya no aplicarán).
3. **Proteína en volumen:** 1.6–2.2 g/kg de peso total (rango general
   ISSN, más bajo que en déficit porque ya no hace falta el extremo alto
   para preservar masa magra).
4. **Ritmo de ganancia objetivo:** ≈0.25–0.5 % del peso corporal por
   semana, para limitar la ganancia de grasa acompañante.
5. **Volumen de entrenamiento:** mantener o progresar el rango de la
   fase de definición (`knowledge/deporte/investigacion.md` §5 sugiere
   no reducir volumen en déficit, así que en volumen hay margen para
   progresar cargas).

Los números exactos de esta fase son orientativos y **se recalcularán**
con el peso/composición real alcanzados al terminar la definición, no
con las cifras de partida de hoy.

## Criterios de cambio de fase

1. **Definición → transición/volumen:** cuando la **media móvil de 7
   días de % de grasa** (no un pesaje suelto) esté en ≤15 % durante al
   menos 2 semanas consecutivas, **o** se cumplan los 5 meses del
   horizonte — lo que ocurra primero. Si se cumple el plazo sin llegar
   al 15 %, el Director debe plantear explícitamente a Enric si extender
   el déficit o cerrar la fase con el resultado alcanzado (no decidirlo
   solo).
2. **Transición → Volumen:** tras 2–4 semanas en mantenimiento calórico
   real (no antes), iniciar la subida a superávit.
3. **Alerta de pérdida de masa magra durante la definición:** si la
   tendencia suavizada de masa magra (`docs/metricas.md`) cae de forma
   sostenida junto con un ritmo de pérdida de peso superior a ~1 %/semana,
   o cae con el peso estable, el agente de Métricas debe alertar y el de
   Nutrición debe proponer reducir el déficit — no es un criterio de
   cambio de fase automático, pero sí de ajuste dentro de la fase.

## Qué falta para afinar esto (no bloqueante para empezar)

- Altura y edad exactas de Enric (para poder calcular un TDEE teórico de
  referencia con fórmula, aunque solo sea como ancla inicial — el ajuste
  real seguirá siendo por tendencia de peso, no por la fórmula).
- Los primeros 2–3 pesajes reales servirán para confirmar si 2100–2200
  kcal produce de verdad el ritmo de 0.28–0.35 kg/semana esperado, o si
  hay que ajustar desde el principio.
