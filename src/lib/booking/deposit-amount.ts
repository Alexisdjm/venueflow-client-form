import type { BookingPolicy } from "@/types/booking";

export function quotedDeposit(policy: BookingPolicy, prices: number[], serviceCurrency: string) {
  if (policy.deposit.mode === "NONE") return null;
  if (policy.deposit.mode === "FIXED") {
    return { amount: policy.deposit.amount, currency: policy.deposit.currency };
  }
  const cents = prices.reduce((sum, price) => sum + Number(price.toFixed(2).replace(".", "")), 0);
  return {
    amount: Math.round((cents * policy.deposit.percent) / 100) / 100,
    currency: serviceCurrency,
  };
}

export function formatMoney(amount: number, currency: string) {
  return `${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatBolivars(amount: number) {
  return `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
