import { Suspense } from "react";
import { BookingForm } from "@/components/booking";
import { HostedBooking } from "@/components/booking/HostedBooking";

const theme = { primary: "#765746", secondary: "#d6baa7", radius: "24px" };

export default function Home() {
  if (process.env.NEXT_PUBLIC_BOOKING_MODE === "api") {
    return <Suspense fallback={<main aria-live="polite">Abriendo reservas…</main>}><HostedBooking /></Suspense>;
  }
  return <main style={{ padding: "clamp(16px, 4vw, 52px)" }}>
    <BookingForm spaSlug="atelier-luma" mode="demo" theme={theme} whatsappNumber={process.env.NEXT_PUBLIC_BOOKING_WHATSAPP} />
  </main>;
}
