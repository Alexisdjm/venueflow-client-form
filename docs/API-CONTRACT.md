# Contrato de API

## Estado actual comprobado

La API NestJS actual expone `GET /spa`, `/spa/services`, `/spa/professionals`, `/spa/availability`, `POST /spa/appointments`, `POST /spa/appointments/bundle/availability` y `POST /spa/appointments/bundle`. Todos requieren JWT y roles `SPA_ADMIN` o `PROFESSIONAL`. No son utilizables de forma segura por un cliente público.

No existen actualmente endpoints por slug, solicitudes pendientes, envío/verificación de correo ni comprobantes públicos. El adaptador API de este proyecto documenta, pero no presenta como existentes, los siguientes contratos propuestos.

## Contratos públicos propuestos

- `GET /public/spas/:slug`
- `GET /public/spas/:slug/services`
- `GET /public/spas/:slug/professionals?serviceIds=...`
- `GET /public/spas/:slug/availability?serviceIds=...&date=...&professionalId=...`
- `POST /public/booking-requests`
- `POST /public/booking-requests/:id/resend`
- `GET /public/booking-verifications/:token`
- `POST /public/booking-verifications/:token/confirm`
- `GET /public/booking-confirmations/:token`

`POST /public/booking-requests` debe devolver `{ requestId, expiresAt }` sin el enlace ni afirmar confirmación. El enlace de verificación solo va en el correo. La confirmación recibe `Idempotency-Key`, revalida disponibilidad y crea todas las citas en una transacción. Conflictos deben usar HTTP 409; tokens expirados 410; rate limiting 429; entrada inválida 400.

El token debe ser aleatorio, de un solo uso, almacenado con hash y alcance exclusivo a una solicitud. El GET de verificación nunca muta estado. El comprobante usa otro token de solo lectura y no revela reservas ajenas.

Estados propuestos: `PENDING_VERIFICATION`, `VERIFIED`, `CONFIRMED`, `EXPIRED`, `CANCELLED`. Brevo se invoca exclusivamente desde el backend. Precio, duración, profesional, tenant y disponibilidad se recalculan en servidor.
