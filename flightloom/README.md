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

- `server/` — backend Express: proxy con caché delante de la API de Travelpayouts y construcción de enlaces de afiliado.
- `public/` — frontend estático (HTML + JS vanilla + Tailwind CSS). No hace falta ningún paso de build para servir la web: `public/css/tailwind.css` ya viene generado y committeado.
- `test/manual-curl.md` — comandos de verificación manual de la API.

Si modificas las clases de Tailwind en el HTML/JS y quieres regenerar el CSS:

```bash
npm run build:css
```

## Despliegue (Render)

El repositorio incluye `render.yaml` en la raíz para desplegar como Blueprint en [Render](https://render.com/):

1. Crea una cuenta en Render y conecta este repositorio de GitHub.
2. "New +" → "Blueprint" → selecciona el repo; Render detectará `render.yaml` automáticamente (usa la carpeta `flightloom/` como raíz del servicio).
3. En el panel del servicio, rellena las variables de entorno marcadas como secretas: `TRAVELPAYOUTS_TOKEN` y `TRAVELPAYOUTS_MARKER`.
4. Una vez desplegado, en "Settings" → "Custom Domain" añade `flightloom.es` y sigue las instrucciones de Render para apuntar el DNS del dominio (registro CNAME/A según indique) desde tu proveedor de dominios.
5. Con el dominio apuntando y el sitio en producción, ya puedes verificar la propiedad del sitio en Impact.com (el meta tag ya está incluido en `public/index.html`).

## Alcance de esta primera versión

No incluye (queda como trabajo futuro): cuentas de usuario, alertas de precio, selector de moneda dinámico, histórico propio de precios, autocompletado en vivo de ciudades, motor de reserva propio, apps móviles, tests automatizados ni dashboard de conversiones (para esto último, usa el panel de Travelpayouts).
