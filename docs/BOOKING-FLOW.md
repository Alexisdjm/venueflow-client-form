# Flujo de reserva

1. Se cargan spa y servicios por slug.
2. El cliente selecciona uno o varios servicios compatibles. Cambiar servicios invalida profesional, fecha y horario.
3. Se consultan profesionales aptas; “cualquier profesional” delega la asignación al backend.
4. La API calcula disponibilidad definitiva. Cambiar profesional o fecha invalida el horario.
5. Se validan nombre, apellido, correo, teléfono y consentimientos.
6. El resumen permite retroceder sin ocultar el estado de confirmación.
7. La solicitud queda pendiente y el backend envía un enlace con expiración y reenvío limitado.
8. El GET del enlace solo muestra detalles. El usuario confirma mediante POST idempotente.
9. El backend revalida concurrencia. Si el horario se perdió, devuelve 409 para volver a elegir.
10. El comprobante se recupera con un token separado y permite descargar `.ics`.

`INSTANT` puede confirmarse automáticamente tras verificar. `ESTIMATED` muestra precio informado y respeta la política devuelta por la API. `CONSULTATION_REQUIRED` representa una consulta reservable, nunca el tratamiento complejo completo.

Casos contemplados: día sin horarios, error de API, token expirado/usado, doble clic de confirmación, cambios que invalidan selecciones y reducción de movimiento. El demo usa datos marcados visualmente y no realiza operaciones externas.
