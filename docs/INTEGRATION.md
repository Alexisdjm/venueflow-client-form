# Integración en otra aplicación Next.js

## Archivos y dependencias

Traslada `components/booking`, `lib/api`, `lib/booking` y `types/booking.ts`. Requiere React 19 y Next.js 16; no depende del dashboard ni de una librería de estado. Importa también `booking.module.css`.

```tsx
import { BookingForm } from "@/components/booking";

<BookingForm
  spaSlug="bella-nails"
  mode="api"
  apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL}
  theme={{ primary: "#684d43", secondary: "#dbc2b7", radius: "24px" }}
  copy={{ title: "Reserva tu próxima visita" }}
  onBookingConfirmed={(request) => console.log(request.requestId)}
/>
```

También puedes inyectar una implementación propia de `BookingApi` mediante la prop `api`. Esta es la opción recomendada si el sitio anfitrión usa un BFF o contratos distintos.

## Rutas requeridas

- `/booking/verify?token=...`: consulta el token por GET y muestra un botón. Nunca confirma durante el GET.
- `/booking/confirmation?token=...`: recupera el comprobante seguro desde el backend.
- `/booking/confirmation/calendar`: genera el archivo `.ics`.

El dominio público debe añadirse a CORS en la API. Los enlaces enviados por correo deben usar la URL pública del sitio anfitrión. No expongas credenciales de correo. Para idiomas adicionales, inyecta `copy` y extiende el catálogo de textos sin acoplarlo a rutas.

Los estilos están encapsulados en CSS Modules y se personalizan con props que producen variables CSS.
