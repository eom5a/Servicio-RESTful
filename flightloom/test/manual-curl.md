# Verificación manual con curl

Con el servidor arrancado (`npm start`, por defecto en `http://localhost:3000`):

## Calendario de precios por día

```bash
curl "http://localhost:3000/api/calendar?origin=MAD&month=2027-03-01"
```

Con destino fijo:

```bash
curl "http://localhost:3000/api/calendar?origin=MAD&destination=NRT&month=2027-03"
```

Se espera un JSON con un array `days` con una entrada por cada día del mes (`date`, `price`, `found`).

## Destinos más baratos desde un origen

```bash
curl "http://localhost:3000/api/cheapest-destinations?origin=MAD"
```

Se espera un JSON con `destinations` ordenado por precio ascendente.

## Enlace de reserva (afiliado)

```bash
curl "http://localhost:3000/api/search-link?origin=MAD&destination=NRT&depart_date=2027-03-14"
```

Se espera `{ "url": "https://www.aviasales.com/search/..." }`. Abre esa URL en el navegador y comprueba que aterriza en una búsqueda real de Aviasales para ese origen/destino/fecha, con el parámetro `marker` presente.

## Casos de error

```bash
curl -i "http://localhost:3000/api/calendar?month=2027-03"          # falta origin -> 400
curl -i "http://localhost:3000/api/calendar?origin=MAD&month=marzo" # month inválido -> 400
curl -i "http://localhost:3000/api/search-link?origin=MAD"          # falta depart_date -> 400
```

## Caché

Repite la misma petición a `/api/calendar` dos veces seguidas: la segunda debería responder de forma prácticamente instantánea (el servidor no debería volver a llamar a Travelpayouts dentro del TTL configurado).
