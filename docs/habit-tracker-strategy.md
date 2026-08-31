# Estrategia y plan de MVP: Habit Tracker para TDAH/neurodivergentes

> Nota: esta propuesta es un proyecto nuevo e independiente del servicio "Beeter" contenido en este repositorio (proyecto académico en Java/Spring, dominio distinto). Se documenta aquí como registro de la estrategia de producto discutida.

## 1. ¿Vale la pena el nicho?

El mercado de habit trackers está saturado de apps genéricas casi idénticas (streaks, calendarios, recordatorios), pero eso no significa que el nicho no valga la pena — significa que competir en features genéricas no funciona. El mercado de productividad/wellness mueve mucho dinero y el problema real de estas apps no es la demanda, es la **retención**.

La estrategia recomendada es diferenciarse por **nicho vertical** en vez de por features: en este caso, **TDAH/neurodivergentes**, un colectivo con necesidades de UX muy específicas (fricción mínima, recompensa inmediata, tolerancia a fallos) que las apps genéricas no atienden bien y que es difícil de replicar rápido por competidores generalistas.

## 2. Cómo captar usuarios y monetizar sin sacrificar la experiencia gratis

- **Freemium generoso, no capado artificialmente**: hábitos y check-ins ilimitados gratis. Capar lo básico (p. ej. "solo 3 hábitos gratis") mata la adquisición orgánica y las reseñas.
- **Monetizar con valor añadido**, no con restricciones: analítica avanzada, exportación de datos, personalización visual, integraciones (Apple Health, Google Fit, calendario).
- **Precio bajo o pago único ("lifetime")**: el mercado castiga suscripciones caras en esta categoría; conviene un precio bajo (2-4€/mes) o alternativa lifetime.
- **Diseño como palanca de captación**: en un mercado saturado de apps funcionalmente similares, una interfaz minimalista y muy cuidada estéticamente es en sí misma un factor de conversión y retención — se trata como prioridad de producto desde el inicio del desarrollo, no como pulido final.

## 3. Web vs. iOS

- **iOS nativo**: mejor engagement (push fiables, widgets, Apple Watch), crítico para un habit tracker donde el recordatorio diario es el producto. Más caro de construir; monetizar bien implica pasar por Apple (30% de comisión salvo uso de links externos).
- **Web (PWA)**: más rápido de validar, cross-platform, sin comisión de Apple si se vende vía Stripe. Push en iOS Safari es más limitado (requiere PWA instalada + iOS 16.4+).
- **Recomendación**: empezar con **PWA web** para validar el ángulo diferenciador con el mínimo coste, dado un desarrollador solo y part-time con presupuesto casi nulo. Si hay tracción, migrar a nativo más adelante.

## 4. Plan técnico de MVP

### Alcance del MVP

**Incluido en v1** (valida el diferenciador TDAH + habilita monetización temprana):
- Auth (Supabase Auth: email/password, magic link, Google OAuth opcional).
- Hábitos **ilimitados y gratis** (nombre, emoji, color, frecuencia: diario / N veces por semana / días específicos).
- Check-in de un solo tap, con actualización optimista.
- Racha **no punitiva**: "streak freezes" en vez de reset a cero al fallar un día.
- Undo fácil: toast con botón deshacer 4-6s tras cada check-in.
- Vista de progreso: heatmap tipo GitHub por hábito + resumen semanal.
- Recordatorios push (Web Push/VAPID) con acción rápida "Hecho" desde la notificación.
- PWA instalable (manifest + service worker + cache básico) vía Serwist.
- Onboarding corto (3-4 pasos) explicando la filosofía "sin rachas punitivas".
- Paywall funcional con Stripe, aunque el contenido premium inicial sea mínimo.

**Explícitamente fuera de v1**:
- Integraciones Apple Health/Google Fit/Calendar (Apple Health no accesible desde web).
- Mecánicas sociales/accountability (grupos, amigos).
- Notificaciones basadas en ML/patrones.
- Gamificación tipo RPG (evitar clonar a Habitica).
- App nativa, offline-first robusto, multi-idioma, analítica avanzada "real" (solo dejar el gate listo).

### Stack técnico

- **Frontend**: Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion.
- **PWA**: Serwist (sucesor mantenido de `next-pwa`, compatible con App Router).
- **Backend gestionado — Supabase** (preferido sobre Firebase): Postgres relacional (mejor para la analítica premium futura), Row Level Security nativo (resuelve autorización sin backend propio), Auth/Storage/Edge Functions incluidos.
- **Pagos**: Stripe (Checkout Session + Customer Portal + Webhooks).
- **Push**: Web Push estándar (VAPID).
- **Hosting**: Vercel (tier gratuito).
- **Observabilidad**: Sentry + PostHog/Plausible (tiers gratuitos).
- Costo estimado en fase de validación: ~$0/mes.

### Modelo de datos (Postgres/Supabase)

- `profiles`: display_name, timezone, onboarding_completed_at, notification_prefs.
- `habits`: user_id, name, emoji, color, frequency_type, frequency_config, reminder_time/enabled, archived_at, sort_order, columnas de racha cacheadas (current_streak, longest_streak, last_checkin_date, freezes_available, freezes_used_this_period).
- `habit_checkins`: habit_id, user_id, checkin_date, completed_at, status, note. `UNIQUE(habit_id, checkin_date)`.
- Trigger SQL sobre `habit_checkins` recalcula racha y aplica freezes automáticamente.
- `plans`: name, stripe_price_id, features (jsonb), price_display.
- `subscriptions`: user_id, plan_id, stripe_customer_id/subscription_id, status, current_period_end (actualizada por webhook de Stripe).
- RLS en todas las tablas de usuario (`user_id = auth.uid()`).

### Pantallas / rutas principales

`/` (landing de conversión) · `/login`, `/signup` · `/onboarding` · `/app` (dashboard, check-in de hoy) · `/app/habits/*` (CRUD + detalle) · `/app/progress` · `/app/settings`, `/app/settings/billing` · `/api/stripe/*` (checkout, portal, webhook).

### Paywall/freemium técnico

Plan `free` con hábitos y check-ins ilimitados. Features premium vía flags en `plans.features` (analítica avanzada, exportación, personalización, integraciones futuras), expuestas mediante `useEntitlements()` + `<FeatureGate feature="...">`. Checkout Session server-side con `client_reference_id = user_id`; webhook verifica firma y actualiza `subscriptions` con la service role key.

### Diseño visual: minimalista y atractivo como palanca de captación

- Dirección de arte definida antes de escribir código de UI (mood board, tipografía grande, paleta reducida de 2-3 colores).
- shadcn/ui personalizado desde el primer componente, nunca "look por defecto".
- Landing tratada como pieza de conversión, con demo visual/animada del check-in de un tap.
- Micro-interacciones cuidadas (Framer Motion) en check-in, primera racha, upgrade a premium.
- Sistema de diseño mínimo (tokens de color/espaciado/tipografía) desde el inicio para consistencia.

### UX/UI específica para TDAH

- Actualización optimista para recompensa instantánea (<150ms percibidos).
- Undo vía toast, ventana de 4-6s.
- Streak freezes aplicados automáticamente; UI comunica "racha protegida", nunca "racha rota".
- Dashboard muestra solo hábitos de hoy, iconos/color en vez de texto largo, áreas táctiles ≥44px.
- Notificaciones accionables (check-in directo desde la notificación).
- Mensajes motivacionales rotados aleatoriamente.
- Toggle explícito de "reducir animaciones" en ajustes.

### Plan de fases (dev solo, part-time, ~6-10h/semana)

| Fase | Duración | Contenido |
|---|---|---|
| 0 | 1 semana | Setup Next.js+TS+Tailwind+shadcn, proyecto Supabase, esquema+RLS, deploy inicial a Vercel |
| 0.5 | 3-5 días | Dirección de arte: mood board, theme, 2-3 pantallas clave maquetadas visualmente |
| 1 | 2 semanas | Auth + CRUD de hábitos + RLS probadas |
| 2 | 1-2 semanas | Check-ins + trigger SQL de racha no punitiva + animación + undo |
| 3 | 1-2 semanas | PWA (Serwist) + Web Push VAPID + acción rápida desde notificación |
| 4 | 1 semana | Vistas de progreso (heatmap) + onboarding completo |
| 5 | 1-2 semanas | Stripe (checkout+webhook+portal) + `FeatureGate` + 1 feature premium real (ej. exportar CSV) |
| 6 | 1 semana | Sentry + PostHog + QA manual + QA visual + landing de conversión |

Total estimado: 9-12 semanas. Se recomienda lanzar beta cerrada en comunidades TDAH antes de completar la fase 6 para feedback temprano, incluyendo feedback sobre la primera impresión visual.

### Verificación end-to-end

1. Auth: alta, login/logout, magic link/OAuth, reset de contraseña.
2. Onboarding completo desde cero.
3. CRUD de hábitos, editar, archivar sin perder historial.
4. Check-in: animación + persistencia + undo revierte en DB.
5. Racha: check-ins retroactivos, freeze al saltar un día, reset no punitivo al agotar freezes.
6. Timezone: check-ins cerca de medianoche sin duplicados/pérdidas.
7. PWA: instalación en Chrome/Edge/Android, auditoría Lighthouse.
8. Push: recepción a horario configurado, acción "Hecho" desde notificación, prueba en iOS Safari 16.4+.
9. Paywall: pago de prueba con Stripe, webhook actualiza suscripción, `FeatureGate` desbloquea, cancelación hace downgrade correcto.
10. RLS: intento de acceso a datos de otro usuario, confirmar bloqueo.
11. Responsive en Android real, iOS real y desktop.
12. Rendimiento del dashboard con ~20-30 hábitos sintéticos.

Recomendación adicional: tests unitarios (Vitest) para la lógica de cálculo de streaks, por ser la más sensible y central al diferenciador de producto.
