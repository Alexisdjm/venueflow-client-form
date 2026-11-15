import { BookingForm } from "@/components/booking";

const theme = { primary: "#765746", secondary: "#d6baa7", radius: "24px" };

export default function Home() {
  if (process.env.NEXT_PUBLIC_BOOKING_MODE === "api") {
    return <main style={{ padding: "clamp(16px, 4vw, 52px)" }}>
      <h1>Reservas VenueFlow</h1>
      <p>Abre el enlace de tu spa: form.tryvenueflow.com/nombre-del-spa.</p>
    </main>;
  }
  return <main style={{ padding: "clamp(16px, 4vw, 52px)" }}>
    <BookingForm spaSlug="atelier-luma" mode="demo" theme={theme} whatsappNumber={process.env.NEXT_PUBLIC_BOOKING_WHATSAPP} />
  </main>;
}
