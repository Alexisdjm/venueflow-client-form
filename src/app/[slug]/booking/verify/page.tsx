import { Suspense } from "react";
import { HostedVerification } from "@/components/booking/HostedTokenPages";

async function Verification({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <HostedVerification slug={slug} />;
}

export default function SpaVerifyPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<main aria-live="polite">Validando enlace…</main>}>
      <Verification params={params} />
    </Suspense>
  );
}
