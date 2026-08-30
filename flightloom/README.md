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

## Estructura

- `server/` — backend Express: proxy con caché delante de la API de Travelpayouts y construcción de enlaces de afiliado.
- `public/` — frontend estático (HTML + JS vanilla + Tailwind CSS). No hace falta ningún paso de build para servir la web: `public/css/tailwind.css` ya viene generado y committeado.
- `test/manual-curl.md` — comandos de verificación manual de la API.

Si modificas las clases de Tailwind en el HTML/JS y quieres regenerar el CSS:

```bash
npm run build:css
```

## Alcance de esta primera versión

No incluye (queda como trabajo futuro): cuentas de usuario, alertas de precio, selector de moneda dinámico, histórico propio de precios, autocompletado en vivo de ciudades, motor de reserva propio, apps móviles, tests automatizados ni dashboard de conversiones (para esto último, usa el panel de Travelpayouts).
