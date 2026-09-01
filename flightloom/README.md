# Flightloom

Calendario de vuelos baratos con fechas flexibles: en vez de ir probando fecha a fecha, muestra de un vistazo qué días de un mes son más baratos para volar desde un origen (a un destino fijo o a cualquiera). También incluye un explorador de destinos baratos y un buscador tradicional por fechas fijas.

Los resultados enlazan a Aviasales mediante un enlace de afiliado de [Travelpayouts](https://www.travelpayouts.com/), por lo que las reservas realizadas a través de la web generan comisión.

Proyecto independiente del backend "Beeter" del resto de este repositorio: no comparte código, dependencias ni base de datos.

## Requisitos

- Node.js 18 o superior (usa `fetch` nativo).
- Una cuenta gratuita en [Travelpayouts](https://www.travelpayouts.com/) con acceso a la API de datos.

## Configuración

1. Regístrate en Travelpayouts y solicita acceso al programa de afiliados (Aviasales) y a la API de datos.
2. Obtén tu **token de API** en el panel de Travelpayouts, sección "API".
3. Obtén tu **marker** de afiliado (identificador de tu cuenta) en la sección de herramientas de Aviasales dentro de Travelpayouts.
4. Copia el archivo de ejemplo y rellena los valores:

   ```bash
   cp .env.example .env
   ```

5. Instala dependencias y arranca el servidor:

   ```bash
   npm install
   npm start
   ```

6. Abre `http://localhost:3000` en el navegador.

Si despliegas el sitio antes de tener el token/marker de Travelpayouts (por ejemplo, para verificar el dominio en otra plataforma), el servidor arranca igualmente: la web estática se sirve con normalidad y solo las rutas `/api/calendar`, `/api/cheapest-destinations` y `/api/search-link` devuelven un error 503 hasta que añadas esas dos variables de entorno.

## Otras integraciones (opcionales)

- **Skyscanner**: el calendario y las tarjetas de destino incluyen un enlace "Comparar en Skyscanner". No necesita configuración — es la URL pública de resultados, sin comisión hasta que se apruebe un programa de afiliados propio con Skyscanner.
- **Booking.com (hoteles)**: al reservar un vuelo aparece un enlace "Hoteles en {ciudad}" si has configurado `BOOKING_AID` en el `.env` (regístrate en [partnerships.booking.com](https://partnerships.booking.com/)). Si no lo configuras, ese enlace simplemente no aparece.
- **Kiwi.com**: evaluado y descartado por ahora — desde 2024 su API Tequila es solo por invitación para nuevos partners, y sus enlaces de afiliado vía Travelpayouts requieren que el sitio ya tenga un mínimo de tráfico mensual.

## Estructura

- `server/app.js` — la app de Express (rutas, caché, enlaces de afiliado); `server/index.js` solo la arranca con `.listen()` para desarrollo local o Render.
- `api/index.js` — reexporta esa misma app como función serverless para Vercel.
- `public/` — frontend estático (HTML + JS vanilla + Tailwind CSS). No hace falta ningún paso de build para servir la web: `public/css/tailwind.css` ya viene generado y committeado.
- `test/manual-curl.md` — comandos de verificación manual de la API.

Si modificas las clases de Tailwind en el HTML/JS y quieres regenerar el CSS:

```bash
npm run build:css
```

## Despliegue (Vercel — recomendado)

El backend está preparado como función serverless (`api/index.js` reexporta la app de Express de `server/app.js`) para que el frontend se sirva por la CDN de Vercel (siempre al instante, sin "dormirse") y solo las rutas `/api/*` pasen por la función. La configuración está en `vercel.json`.

1. Crea una cuenta en [vercel.com](https://vercel.com/) y conecta este repositorio de GitHub (Root Directory: `flightloom`).
2. Vercel detecta `vercel.json` automáticamente (build command y carpeta de salida ya configurados).
3. En "Settings" → "Environment Variables" añade `TRAVELPAYOUTS_TOKEN`, `TRAVELPAYOUTS_MARKER` y opcionalmente `BOOKING_AID`.
4. En "Settings" → "Domains" añade `flightloom.es` y `www.flightloom.es`; Vercel te dará los registros DNS exactos (normalmente un A para el dominio raíz y un CNAME `cname.vercel-dns.com` para `www`) que hay que poner en el proveedor del dominio.
5. Con el dominio apuntando, verifica la propiedad del sitio en Impact.com (el meta tag ya está en `public/index.html`) y confirma la instalación en Travelpayouts (script en `public/index.html`).

## Despliegue (Render — alternativa)

También se puede desplegar como servidor Node normal con `render.yaml` (Blueprint) en [Render](https://render.com/), root directory `flightloom`. Aviso: en el plan gratuito de Render el servicio "duerme" tras un rato sin visitas y tarda 30-60s en la primera petición al despertar — por eso se recomienda Vercel en su lugar, o el plan de pago de Render si se prefiere quedarse ahí.

## Alcance de esta primera versión

No incluye (queda como trabajo futuro): cuentas de usuario, alertas de precio, selector de moneda dinámico, histórico propio de precios, autocompletado en vivo de ciudades, motor de reserva propio, apps móviles, tests automatizados ni dashboard de conversiones (para esto último, usa el panel de Travelpayouts).
