# Guía: dar de alta la Google Health API (sustituta de Fitbit)

> Para el reemplazo de la Fitbit Web API que se apaga el 30-sep-2026. Ver
> `knowledge/integraciones/fitbit-estado-api.md` para el porqué. Estos
> pasos los tiene que hacer Enric (requieren su cuenta de Google) — no
> hay forma de automatizarlos desde aquí.

## 1. Crear el proyecto y habilitar la API

1. Entra en [Google Cloud Console](https://console.cloud.google.com/) con
   la cuenta de Google vinculada a tu Fitbit.
2. Crea un proyecto nuevo (arriba a la izquierda, selector de proyecto →
   "Nuevo proyecto"). Nombre sugerido: `vita-health`.
3. Con el proyecto seleccionado, ve a **APIs & Services → Library**,
   busca **"Google Health API"** y pulsa **Enable**.

## 2. Configurar la pantalla de consentimiento OAuth

1. **APIs & Services → OAuth consent screen**.
2. Tipo de usuario: **External** (Internal no aplica salvo que tengas
   Google Workspace).
3. Rellena nombre de la app (`VITA`), tu email como contacto y como
   email de soporte.
4. En **Scopes**, no hace falta añadir nada a mano todavía.
5. En **Test users**, añade tu propia cuenta de Google (la misma con la
   que vas a autorizar la app). **Esto es lo que evita tener que pasar
   por la verificación pública de Google** — mientras la app esté en
   modo "Testing" con tu cuenta como test user, funciona sin más
   trámites, para hasta 100 usuarios de prueba (de sobra para 1).
6. Guarda. La app debe quedar en estado **"Testing"**, no "In production".

## 3. Crear las credenciales OAuth2

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
2. Tipo de aplicación: **Web application**.
3. Nombre: `vita-worker`.
4. En **Authorized redirect URIs**, añade la URL de callback que use
   VITA en tu servidor, por ejemplo:
   `https://<tu-dominio-o-tailscale>/api/integrations/google-health/callback`
   (todavía no existe ese endpoint en el código — se añadirá cuando me
   des estas credenciales, igual que con Strava).
5. Guarda. Google te da un **Client ID** y un **Client Secret**.

## 4. Verificación manual antes de dar esto por bueno (recomendado)

La investigación de `knowledge/integraciones/fitbit-estado-api.md` no
pudo confirmar dos cosas por bloqueo de red del entorno de desarrollo:
si la Google Health API tiene coste para un único usuario, y si ya está
en disponibilidad general estable. Antes de depender de ella, échale un
vistazo tú mismo (con acceso normal a internet) a:
- https://developers.google.com/health/about
- https://developers.google.com/health/rate-limits

## 5. Qué me tienes que pasar

Solo estos dos valores (nunca los pegues en un sitio público; a mí
puedes dármelos aquí en el chat, igual que con Strava):

- `GOOGLE_HEALTH_CLIENT_ID`
- `GOOGLE_HEALTH_CLIENT_SECRET`

En cuanto los tenga, implemento el flujo OAuth2 + la sincronización de
pasos/FC/HRV/sueño/calorías/SpO2 contra `users.dataTypes.dataPoints`,
igual que hice con Strava.
