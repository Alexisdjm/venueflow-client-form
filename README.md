# VenueFlow Client Form

Aplicación Next.js independiente para desarrollar, demostrar y extraer el formulario público de reservas de VenueFlow. No es un dashboard ni envía correos desde el navegador.

## Requisitos y comandos

- Node.js 20 o superior
- npm

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

Abre `http://localhost:3002`. El modo predeterminado es `demo` y nunca crea reservas reales. En modo `api`, el spa sale del subdominio: `emi-nails.localhost:3002`.

## Configuración

Copia `.env.example` a `.env.local`:

```env
NEXT_PUBLIC_BOOKING_MODE=demo
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
BOOKING_HOST_SUFFIXES=localhost
```

En modo `api`, `NEXT_PUBLIC_API_BASE_URL` y `BOOKING_HOST_SUFFIXES` son obligatorios. No hay un slug global de respaldo. El navegador llama a `/api/v1` en su propio host y Next reenvía esa ruta al API. No configures claves de Brevo ni secretos como variables públicas.

## Estructura

- `src/components/booking`: componente y presentación reutilizables.
- `src/lib/api`: contrato HTTP desacoplado.
- `src/lib/booking`: adaptadores demo y resolución de modo.
- `src/types`: API pública de tipos.
- `src/app/booking`: verificación, confirmación y calendario.
- `docs`: integración, contrato y flujo.

El modo API usa los endpoints públicos de `venueflow-api`. Un hostname sin spa válido responde 404. El modo demo sigue mostrando Atelier Luma sin leer el hostname.
