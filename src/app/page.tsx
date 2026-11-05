import { BookingForm } from "@/components/booking";

export default function Home() {
  const mode = process.env.NEXT_PUBLIC_BOOKING_MODE === "api" ? "api" : "demo";
  return <main style={{ padding: "clamp(16px, 4vw, 52px)" }}>
    <BookingForm
      spaSlug={process.env.NEXT_PUBLIC_SPA_SLUG ?? "atelier-luma"}
      apiBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL}
      mode={mode}
      whatsappNumber={process.env.NEXT_PUBLIC_BOOKING_WHATSAPP}
      theme={{ primary: "#765746", secondary: "#d6baa7", radius: "24px" }}
    />
  </main>;
}
