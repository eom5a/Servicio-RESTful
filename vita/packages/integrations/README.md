# @vita/integrations

Placeholder de la Fase 0. Aquí vivirán, en la Fase 3, los clientes de
Strava (OAuth2 + webhooks), Fitbit/Google Health, el scraper de Fitdays
(Playwright) y el envío de email. Los tokens de cada proveedor se cifran
con `encryptSecret`/`decryptSecret` de `@vita/db` antes de guardarse en la
tabla `integrations`.

Ver `docs/fase-0.md` para el estado actual del proyecto.
