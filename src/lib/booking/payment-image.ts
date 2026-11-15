import type { BookingPaymentProof } from "@/types/booking";

const maxEdge = 1280;
const maxBytes = 1_500_000;

export async function compressPaymentImage(file: File): Promise<BookingPaymentProof> {
  if (!file.type.startsWith("image/")) throw new Error("Adjunta una imagen JPG, PNG o WebP.");
  if (file.size > 8_000_000) throw new Error("La imagen es demasiado grande.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("No se pudo preparar la imagen.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  if (!blob || blob.size > maxBytes) throw new Error("La captura sigue siendo muy pesada. Prueba con otra imagen.");
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return { mime: "image/jpeg", data: btoa(binary) };
}
