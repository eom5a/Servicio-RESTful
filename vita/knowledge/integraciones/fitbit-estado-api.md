# Estado de las APIs de Fitbit / Google Health (investigado el 2026-09-26)

> Nota de método: la investigación se hizo con búsquedas web (WebSearch) porque el acceso
> directo (WebFetch/curl) a `dev.fitbit.com`, `developers.google.com`, `community.fitbit.com`,
> `web.archive.org`, `en.wikipedia.org` y varios blogs de terceros estuvo bloqueado por la
> política de red de este entorno (egress proxy, error `EGRESS_BLOCKED` / `403`). Todos los
> datos de abajo vienen por tanto de los resúmenes y fragmentos que WebSearch trae de esas
> páginas oficiales (y de blogs que las citan), no de una lectura directa del HTML. Donde no
> he podido triangular un dato con al menos dos fuentes independientes, lo marco explícitamente
> como "no confirmado con certeza".

## Resumen ejecutivo

La Fitbit Web API clásica (`api.fitbit.com`, OAuth2 propio, `dev.fitbit.com`) **está siendo
apagada por Google**, con fecha de corte anunciada para el **30 de septiembre de 2026** —
es decir, prácticamente ahora mismo respecto a la fecha de esta investigación (26 de
septiembre de 2026). El registro de nuevas apps de desarrollador en el portal clásico ya
está cerrado. El sustituto oficial es la **Google Health API** (`developers.google.com/health`),
una API REST cloud-to-cloud (server-to-server) con OAuth2 estándar de Google, que cubre pasos,
frecuencia cardiaca, FC en reposo, HRV, sueño, calorías y SpO2 vía scopes/tipos de dato
(`health_get_activity`, `health_get_sleep`, `health_get_spo2`, vitals/HRV, etc.). **Health
Connect es una capa on-device en Android y no sirve para un worker Node.js remoto** sin una
app Android intermedia que reenvíe los datos a un servidor — por tanto no es la vía adecuada
para este caso. La recomendación concreta para VITA es: **migrar/implementar directamente
contra la Google Health API** (no la Fitbit Web API clásica, que dejará de funcionar en días,
y no Health Connect, que no es remota), aceptando que esto exige registrar el proyecto en
Google Cloud Console con una pantalla de consentimiento OAuth en modo "Testing" (válido para
un único usuario/tester, sin necesidad de verificación pública).

## 1. Estado de la Fitbit Web API

- **Sí sigue "viva" hoy mismo (26-sep-2026)**, pero con fecha de fin ya anunciada y muy próxima:
  varias fuentes coinciden en que **el 30 de septiembre de 2026** es el corte final ("hard
  cutoff, no gradual deprecation") de los endpoints legacy de `api.fitbit.com` y que a partir
  de esa fecha los datos dejan de sincronizarse vía esa API.
- El anuncio oficial parece haberse publicado en el foro de desarrolladores de Fitbit bajo el
  título **"Introducing the next phase of the Fitbit Web API"**
  (community.fitbit.com/t5/Web-API-Development/.../td-p/5821061). No pude leer el HTML
  directo (bloqueado), pero el título y contenido aparecen citados de forma consistente en
  múltiples fuentes secundarias que sí lo enlazan como fuente primaria.
- El **registro de nuevas apps de desarrollador en el portal clásico ya está cerrado** (no se
  pueden crear credenciales OAuth nuevas de la Fitbit Web API a día de hoy) — esto se repite en
  varias fuentes pero no lo he podido verificar leyendo directamente `dev.fitbit.com/new-developer/`.
  **Marcar como no confirmado al 100%**, aunque es consistente entre fuentes.
- El sustituto es la **Google Health API**: "cloud REST API con soporte de webhooks y opción
  reconcile/list para fuentes de datos solapadas, que agrega Fitbit, Pixel Watch y otras fuentes
  conectadas". Ambas APIs (Fitbit Web API legacy y Google Health API) habrían convivido entre
  finales de mayo de 2026 (lanzamiento/target de la nueva) y el 30 de septiembre de 2026 (apagado
  de la legacy) — ventana de solapamiento que ya se está cerrando.
- El cambio de OAuth también es relevante: **el sistema de autorización propio de Fitbit se
  sustituye por OAuth 2.0 estándar de Google** (Google Cloud Console / Google Identity), no un
  simple cambio de dominio. Los tokens OAuth de la Fitbit Web API **no son válidos** en la
  Google Health API: cada usuario (en este caso, el único usuario de VITA) tiene que volver a
  dar consentimiento vía el flujo OAuth de Google.
- Conclusión práctica: implementar hoy un integrador contra `api.fitbit.com` para un proyecto
  nuevo **no tiene sentido** — quedaría obsoleto en días/semanas y probablemente ya no se pueden
  crear credenciales nuevas.

## 2. Endpoints necesarios y sus requisitos de acceso

### 2.1 En la Fitbit Web API clásica (para contexto/histórico, en vías de apagado)

| Dato | Endpoint(s) Fitbit Web API | Requisito especial |
|---|---|---|
| Pasos (diario/serie temporal) | `GET /1/user/-/activities/steps/date/{date}/{period}.json` (Activity Time Series); resumen diario en `Get Daily Activity Summary` | Ninguno especial |
| Pasos intradía (minuto a minuto) | `Get Activity Intraday by Date` (`/1/user/-/activities/steps/date/{date}/1d/1min.json`) | **Sí**: acceso intradía. Para app tipo "Personal" (un solo usuario, el propio desarrollollador) se concede automáticamente. Para apps tipo Server/Client que acceden a datos de otros usuarios, Fitbit lo aprueba caso por caso |
| FC intradía | `Get Heart Rate Intraday by Date` / `by Interval` (`/1/user/-/activities/heart/date/{date}/1d/1sec.json`, etc.) | Igual que arriba: automático para app "Personal", aprobación caso por caso para Server/Client de terceros |
| FC en reposo | Viene incluida en `Heart Rate Time Series` (`Get Heart Rate Time Series by Date`), campo `restingHeartRate` dentro del resumen diario | Ninguno especial |
| HRV (variabilidad FC) | `Get HRV Intraday by Date` / `by Interval` (bajo `/1/user/-/hrv/...`) | Mismo régimen que intradía: automático para "Personal" |
| Sueño | `Get Sleep Log by Date`, `Get Sleep Log by Date Range`, `Get Sleep Log List` (`/1.2/user/-/sleep/...`) | Ninguno especial (requiere scope `sleep`) |
| Calorías | Incluidas en Activity Time Series / Daily Activity Summary: `calories`, `activityCalories`, `caloriesBMR` | Ninguno especial |
| SpO2 | `Get SpO2 Intraday by Date` / `by Interval`, y el summary diario de SpO2 | Mismo régimen que intradía: automático para "Personal" |

Punto clave que confirma **varias fuentes de forma consistente**: para una **app tipo
"Personal"** en el Fitbit Developer Portal (que es exactamente el caso de VITA — un solo
usuario que es también el dueño de la app), **los datos intradía (incluidos HRV y SpO2) se
conceden automáticamente sin tener que solicitar aprobación especial**. La aprobación caso por
caso solo aplica a apps "Server"/"Client" que quieren acceder a los datos intradía de **otros**
usuarios (terceros), que no es el escenario de VITA. Esto sigue siendo así en la documentación
vigente de `dev.fitbit.com/build/reference/web-api/developer-guide/application-design/`
(no pude leerla directamente, pero el dato aparece citado igual en dos búsquedas independientes).

### 2.2 En la Google Health API (sucesora)

La Google Health API reorganiza los ~120 endpoints legacy en un modelo más genérico de
"tipos de dato" (`dataTypes`) sobre un recurso común `users.dataTypes.dataPoints` (métodos
`list`, `patch`, `batchDelete`, `dailyRollUp`, `rollUp`, `reconcile`). Según la documentación
de tipos de dato (`developers.google.com/health/data-types`):

- **Pasos y calorías**: tipo de dato de actividad (`health_get_activity` / scope de
  actividad) — cubre pasos y calorías.
- **Sueño** (duración y fases): `health_get_sleep` / data-types/sleep.
- **FC en reposo y SpO2 nocturno**: mencionados explícitamente como parte de
  `health_get_spo2` y de los datos "vitals" nocturnos.
- **HRV, SpO2, frecuencia respiratoria**: agrupados bajo "Vitals and Health Metrics"
  (`developers.google.com/health/data-types/vitals`), junto con ECG y notificaciones de
  ritmo irregular.
- **Límite de rango de consulta**: 14 días máximo para calorías-en-zona-de-FC, heart-rate,
  minutos activos y calorías totales; 90 días máximo para el resto de tipos de dato — esto es
  relevante para el diseño del worker (paginar por rangos si se quiere histórico largo).
- **Autenticación**: OAuth2 estándar de Google (mismo Google Identity que cualquier API de
  Google), documentado con un codelab oficial "Make your first Google Health API call using
  OAuth2 Playground".
- **Registro del proyecto**: se hace en **Google Cloud Console** (no en un portal específico
  de Fitbit), configurando una pantalla de consentimiento OAuth. Mientras la app esté en modo
  **"Testing"** (hasta 100 usuarios de prueba añadidos a mano), **no requiere verificación**
  de Google — encaja perfectamente con un caso de un único usuario. La verificación completa
  de OAuth solo se exige si se quiere pasar a producción pública con más de 100 usuarios.
- **Cuotas**: hay límites por defecto (día/minuto/usuario) pensados para "la inmensa mayoría de
  casos de uso estándar"; se pueden pedir ampliaciones desde Cloud Console si hiciera falta,
  pero para un solo usuario sondeado varias veces al día no debería ser un problema.
- **Precio**: no he podido confirmar con una fuente clara si la Google Health API (la de
  wearables, distinta de "Cloud Healthcare API" que es el producto FHIR clínico empresarial)
  tiene coste de uso. **Ojo a no confundir productos**: `cloud.google.com/healthcare-api` es
  la API clínica FHIR/HL7 de pago (con free tier de 25.000 requests/mes), un producto
  totalmente distinto de `developers.google.com/health`, que es la sucesora directa de la
  Fitbit Web API para datos de wearables de consumo. **Esto no queda confirmado con certeza en
  esta investigación** — antes de dar por hecho que la Google Health API de consumo es
  gratuita, conviene revisar la página oficial `developers.google.com/health/about` o
  `.../rate-limits` (bloqueadas para mí en este entorno).

## 3. Health Connect / Google Health: qué es y si aplica aquí

**Health Connect NO es una alternativa válida para este caso**, y es importante no
confundirlo con la Google Health API (comparten marca "Google Health" pero son cosas
distintas):

- **Health Connect** es una plataforma **on-device** de Android (introducida por Google en
  2022, `android-developers.googleblog.com/2022/05/...`) que actúa como repositorio local y
  cifrado de datos de salud/fitness en el propio teléfono, agregando lo que escriben distintas
  apps instaladas (Fitbit, Samsung Health, Google Fit, etc.) bajo un esquema de datos común.
  Las fuentes son explícitas: **"Health Connect works as an on-device data repository... your
  data doesn't leave your device"** y **"Health Connect is device-based rather than Google
  account-based"**.
- La app de Fitbit para Android sincroniza sus datos hacia Health Connect cada ~15 minutos,
  pero eso solo hace que esos datos estén disponibles **para otras apps Android instaladas en
  ese mismo teléfono** (vía el SDK/API local de Health Connect), no para un servidor remoto.
  Hay incluso reportes de usuarios de que ciertos tipos de dato (HRV, frecuencia respiratoria)
  no siempre se sincronizan correctamente desde la app de Fitbit hacia Health Connect, lo que
  añade otra capa de fragilidad si se dependiera de esta vía.
- Para tener acceso **remoto/servidor** a esos mismos datos hace falta o bien (a) una app
  Android propia instalada en el móvil que lea Health Connect localmente y reenvíe los datos a
  un backend (esto sí sería viable pero añade una app Android completa al proyecto, con OAuth
  de acceso a Health Connect gestionado por el propio SO), o bien (b) usar directamente la
  **Google Health API**, que es la vía cloud-to-cloud equivalente a lo que antes hacía la
  Fitbit Web API.
- Para VITA (un worker Node.js/TypeScript en un servidor, sin componente Android intermedio),
  Health Connect **queda descartado** por diseño: no expone un API HTTP remoto.

## 4. Migración de cuentas Fitbit → Google

- Confirmado con varias fuentes coincidentes (9to5google, TechRadar, How-To-Geek, Google Health
  Help Center, MobileSyrup): Google lleva desde 2023 empujando la migración de cuentas Fitbit
  clásicas a cuentas Google, y ha ido moviendo el plazo límite varias veces.
- El plazo actual (según las fuentes más recientes encontradas, de 2025) es que **las cuentas
  Fitbit no migradas dejan de poder usarse con dispositivos Fitbit a partir del 19 de mayo de
  2026**, con fecha límite para descargar los propios datos el **15 de julio de 2026**.
- Los dispositivos Fitbit más recientes (y todo lo posterior a la adquisición por Google) **ya
  solo permiten cuenta Google desde el principio** — no ofrecen la opción de cuenta Fitbit
  clásica.
- **Efecto sobre el flujo OAuth de desarrollador**: la migración de cuentas de *usuario final*
  Fitbit→Google es un proceso independiente y previo, pero converge con el mismo cambio de
  fondo que motiva el punto 1: Fitbit como identidad/autorización propia desaparece y todo pasa
  a ser Google (cuenta Google + OAuth2 de Google). Es decir, aunque la cuenta del usuario de
  VITA ya esté o no migrada a Google, el desarrollador tendrá que autenticarse igualmente
  contra la Google Health API con OAuth2 de Google, no contra el antiguo sistema Fitbit.

## 5. Recomendación y siguiente paso concreto

**Recomendación: usar la Google Health API directamente (developers.google.com/health),
descartando tanto seguir con la Fitbit Web API clásica como intentar usar Health Connect.**

Justificación:

1. La Fitbit Web API legacy se apaga el 30-sep-2026 (según las fuentes encontradas), es decir,
   prácticamente ya — construir o mantener algo nuevo contra ella hoy es tiempo tirado.
2. Health Connect es on-device por diseño; no resuelve "un worker Node.js en un servidor leyendo
   datos de un usuario que lleva la pulsera puesta" sin añadir una app Android intermedia, lo
   cual añade complejidad y una pieza móvil frágil (recordando además que HRV no siempre se
   sincroniza bien desde Fitbit hacia Health Connect según reportes de usuarios).
3. La Google Health API es exactamente el reemplazo cloud-to-cloud pensado para este patrón
   (servidor lee datos de wearables vía OAuth2 + REST), cubre todos los tipos de dato que pide
   VITA (pasos, FC, FC en reposo, HRV, sueño, calorías, SpO2), y para un único usuario encaja
   en el modo "Testing" de OAuth de Google Cloud sin necesidad de verificación pública.

**Siguiente paso concreto para VITA:**

1. Crear un proyecto en Google Cloud Console y habilitar la Google Health API.
2. Configurar la pantalla de consentimiento OAuth en modo **Testing**, añadiendo la cuenta
   Google del propio usuario (enricochavomartin@gmail.com, si es la cuenta vinculada al
   dispositivo Fitbit) como test user — así se evita el proceso de verificación pública de
   Google, válido solo hasta 100 usuarios de prueba, más que suficiente para 1.
3. Seguir el codelab oficial **"Make your first Google Health API call using OAuth2
   Playground"** (developers.google.com/health/codelabs/make-your-first-api-call-using-oauth2-playground)
   para validar manualmente el flujo antes de escribir código.
4. Implementar en el worker Node.js/TypeScript el flujo OAuth2 estándar (authorization code +
   refresh token, guardando el refresh token de forma persistente ya que es un solo usuario y
   no hace falta gestionar múltiples tokens), y mapear las llamadas a
   `users.dataTypes.dataPoints.list` para cada tipo de dato necesario (actividad/pasos/calorías,
   heart-rate, sleep, vitals/HRV/SpO2), respetando los límites de rango de consulta (14 días
   para FC/calorías/minutos activos, 90 días para el resto).
5. **Antes de dar esto por cerrado**, dado que en este entorno no pude leer directamente
   `developers.google.com/health/about`, `.../get-started`, `.../rate-limits` ni
   `.../developer-checklist` (bloqueados por la política de red), sería prudente que alguien
   con acceso normal a internet confirme en esas páginas oficiales: (a) si hay coste de uso
   para volumen bajo de un único usuario, y (b) el estado exacto de disponibilidad general (GA)
   de la API a fecha de hoy, ya que una búsqueda mencionó que "la API seguía evolucionando de
   cara a GA a mediados de mayo de 2026" — conviene verificar que ya esté en GA y estable antes
   de depender de ella en producción.

## Fuentes

- [Introducing the next phase of the Fitbit Web API](https://community.fitbit.com/t5/Web-API-Development/Introducing-the-next-phase-of-the-Fitbit-Web-API/td-p/5821061) — foro oficial de desarrolladores de Fitbit (anuncio de la deprecación; leído solo vía snippets de búsqueda, acceso directo bloqueado en este entorno)
- [Overview | Google Health API | Google for Developers](https://developers.google.com/health/migration) — página oficial de migración Fitbit → Google Health API (acceso directo bloqueado en este entorno)
- [Data Access and Authorization | Google Health API | Google for Developers](https://developers.google.com/health/migration/data-access)
- [Google Health API data types | Google for Developers](https://developers.google.com/health/data-types)
- [Develop sleep experiences with Google Health API | Google for Developers](https://developers.google.com/health/data-types/sleep)
- [Develop Vitals and Health Metrics Experiences with the Google Health API | Google for Developers](https://developers.google.com/health/data-types/vitals)
- [REST Resource: users.dataTypes.dataPoints | Google Health API | Google for Developers](https://developers.google.com/health/reference/rest/v4/users.dataTypes.dataPoints)
- [Quotas and Rate Limits | Google Health API | Google for Developers](https://developers.google.com/health/rate-limits)
- [Developer Checklist | Google Health API | Google for Developers](https://developers.google.com/health/developer-checklist)
- [Make your first Google Health API call using OAuth2 Playground | Google for Developers](https://developers.google.com/health/codelabs/make-your-first-api-call-using-oauth2-playground)
- [Google Health API Developer Terms & Conditions](https://developers.google.com/health/policies/health-api-developer-terms-and-conditions)
- [Fitbit Development: Application Design](https://dev.fitbit.com/build/reference/web-api/developer-guide/application-design/) — documentación oficial de tipos de app (Personal/Server/Client) y reglas de acceso intradía (acceso directo bloqueado en este entorno)
- [Fitbit Development: Intraday](https://dev.fitbit.com/build/reference/web-api/intraday/) — endpoints intradía (FC, HRV, SpO2, actividad)
- [Fitbit Development: Get HRV Intraday by Date](https://dev.fitbit.com/build/reference/web-api/intraday/get-hrv-intraday-by-date/)
- [Fitbit Development: Heart Rate](https://dev.fitbit.com/build/reference/web-api/heart-rate/)
- [Fitbit Development: Sleep](https://dev.fitbit.com/build/reference/web-api/sleep/)
- [Fitbit Development: Get Daily Activity Summary](https://dev.fitbit.com/build/reference/web-api/activity/get-daily-activity-summary/)
- [Fitbit Web API Data Dictionary Version 9 (PDF, actualizado 19-ago-2024)](https://assets.ctfassets.net/0ltkef2fmze1/45IN5bvBS827grKEsA8ZB0/648f3778acc936961f0572590c005ef0/Fitbit-Web-API-Data-Dictionary-Downloadable-Version-2.pdf)
- [Android Developers Blog: Introducing Health Connect](https://android-developers.googleblog.com/2022/05/introducing-health-connect.html) — anuncio oficial de Health Connect como repositorio on-device
- [Health Connect comparison guide | Android Developers](https://developer.android.com/health-and-fitness/health-connect/comparison-guide)
- [Fit migration guide | Android Developers](https://developer.android.com/health-and-fitness/health-connect/migration/fit)
- [Connect third-party devices and apps to the Google Health app - Google Health Help Center](https://support.google.com/fitbit/answer/14236613?hl=en)
- [How to move your Fitbit Account to a Google Account - Google Health Help Center](https://support.google.com/fitbit/answer/14237024?hl=en)
- [Fitbit making Google Account migration mandatory in 2026](https://9to5google.com/2025/03/28/fitbit-google-account-2026/) — 28-mar-2025
- [Google extends the deadline for Fitbit users to migrate their account](https://mobilesyrup.com/2025/03/31/google-extends-deadline-fitbit-users-account-migration/) — 31-mar-2025
- [Time Is Running Out to Migrate Your Fitbit Data to Google](https://www.howtogeek.com/google-extends-fitbit-account-migration-to-2026/)
- [Fitbit Web API Deprecation: Migration Guide | Momentum](https://www.themomentum.ai/blog/fitbit-web-api-deprecation-google-health-migration) — blog de terceros que cita y enlaza los anuncios oficiales de Fitbit/Google
- [Fitbit Web API Shutdown 2026: Developer Migration Guide | Open Wearables Blog](https://openwearables.io/blog/fitbit-web-api-shutdown-2026-migration-guide) — ídem
- [The complete guide: How the new Google Health API works | Terra](https://tryterra.co/blog/everything-you-need-to-know-about-google-health-new-api) — ídem
- [Fitbit API Deprecation: What the Google Health API Means for Digital Health | Thryve](https://www.thryve.health/blog/fitbit-api-deprecation) — ídem
- [Fitbit Web API deprecated? — Fitbit Community](https://community.fitbit.com/t5/Web-API-Development/Fitbit-Web-API-deprecated/td-p/5657469) — hilo de usuarios en el foro oficial confirmando la deprecación
- [Health Connect — Wikipedia](https://en.wikipedia.org/wiki/Health_Connect) — resumen general, no fuente primaria
