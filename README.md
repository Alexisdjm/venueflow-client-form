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

Abre `http://localhost:3000`. El modo predeterminado es `demo` y nunca crea reservas reales.

## Configuración

Copia `.env.example` a `.env.local`:

```env
NEXT_PUBLIC_BOOKING_MODE=demo
NEXT_PUBLIC_SPA_SLUG=atelier-luma
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

En modo `api`, `NEXT_PUBLIC_API_BASE_URL` es obligatorio. No configures claves de Brevo ni secretos como variables públicas.

## Estructura

- `src/components/booking`: componente y presentación reutilizables.
- `src/lib/api`: contrato HTTP desacoplado.
- `src/lib/booking`: adaptadores demo y resolución de modo.
- `src/types`: API pública de tipos.
- `src/app/booking`: verificación, confirmación y calendario.
- `docs`: integración, contrato y flujo.

La API existente de VenueFlow todavía no tiene endpoints públicos. Por ello el modo API no aplica fallback demo y mostrará el error real hasta implementar los contratos documentados.
