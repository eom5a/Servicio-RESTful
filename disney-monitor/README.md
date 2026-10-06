# Monitor de colas virtuales de personajes (Disneyland Paris)

Consulta cada ~20 s la API pública de themeparks.wiki (solo lectura) y avisa por
WhatsApp (CallMeBot) y ntfy.sh cuando una cola virtual de personajes pasa a tener plazas.
Vigila automáticamente todas las entidades que publican `queue.RETURN_TIME`.
No reserva nada: la reserva la haces tú en la app.

## Secretos (Settings → Secrets and variables → Actions)
- `CALLMEBOT_PHONE`: tu número con prefijo, sin `+`
- `CALLMEBOT_APIKEY`: la clave de CallMeBot
- `NTFY_TOPIC`: nombre de un tema largo y difícil de adivinar (suscríbete en la app ntfy)

## Probar
Actions → disney-monitor → Run workflow → marca `test`.

## Notas
- La Action corre cada 5 min (07:00–23:59 hora de París aprox.) y hace un bucle de ~4,5 min,
  así que el retraso típico es de unos 20 s, pero GitHub puede retrasar el cron algunos minutos.
- Los estados de cola distintos de `FINISHED`/`AVAILABLE` se imprimen como `[info]` en el log
  para ajustar `CLOSED_STATES` en `monitor.py` si hace falta.
- Local: `python3 disney-monitor/monitor.py --duration 600` (con las mismas variables de entorno).
