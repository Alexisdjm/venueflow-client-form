import { Suspense } from "react";
import { HostedConfirmation } from "@/components/booking/HostedTokenPages";

async function Confirmation({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HostedConfirmation slug={slug} />;
}

export default function SpaConfirmationPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main aria-live="polite">Preparando comprobante…</main>}>
      <Confirmation params={params} />
    </Suspense>
  );
}
