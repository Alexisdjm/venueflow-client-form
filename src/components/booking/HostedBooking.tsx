import { BookingForm } from "./BookingForm";
import { resolveSpaBySlug } from "@/lib/booking/resolve-spa-host";

const theme = { primary: "#765746", secondary: "#d6baa7", radius: "24px" };

export async function HostedBooking({ slug }: { slug: string }) {
  const spa = await resolveSpaBySlug(slug);
  return <main style={{ padding: "clamp(16px, 4vw, 52px)" }}>
    <BookingForm
      key={spa.slug}
      spaSlug={spa.slug}
      apiBaseUrl="/api/v1"
      mode="api"
      whatsappNumber={process.env.NEXT_PUBLIC_BOOKING_WHATSAPP}
      theme={theme}
    />
  </main>;
}
