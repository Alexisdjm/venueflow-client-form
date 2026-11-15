import { Suspense } from "react";
import { HostedBooking } from "@/components/booking/HostedBooking";

async function Booking({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HostedBooking slug={slug} />;
}

export default function SpaBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main aria-live="polite">Abriendo reservas…</main>}>
      <Booking params={params} />
    </Suspense>
  );
}
