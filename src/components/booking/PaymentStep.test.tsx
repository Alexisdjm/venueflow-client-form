import { fireEvent, render, screen } from "@testing-library/react";
import { PaymentStep } from "./PaymentStep";
import type { BookingPolicy, ExchangeQuote } from "@/types/booking";

const policy: BookingPolicy = {
  deposit: { mode: "PERCENT", percent: 50 },
  holdMinutes: 240,
  methods: [{ id: "pm", type: "PAGO_MOVIL", label: "Pago móvil", requiresProof: false, details: { bank: "0134 - Banesco" } }],
};

const bolivars: ExchangeQuote = {
  amount: 7.5,
  currency: "USD",
  applicable: true,
  vesAmount: 6837.18,
  source: "BCV",
  pair: "USD/VES",
  rate: 911.6243,
  quotedAt: "2026-11-13T00:00:00-04:00",
};

const emptySender = { nationalId: "", phone: "", bank: "" };

describe("PaymentStep", () => {
  it("shows the bolivar conversion beside the transfer amount", () => {
    render(
      <PaymentStep
        policy={policy}
        amount={7.5}
        currency="USD"
        methodId="pm"
        reference=""
        pagoMovil={emptySender}
        proofName=""
        bolivars={bolivars}
        onMethod={() => undefined}
        onReference={() => undefined}
        onPagoMovil={() => undefined}
        onProof={() => undefined}
      />,
    );
    expect(screen.getByText("7,50 USD")).toBeInTheDocument();
    expect(screen.getByText("Bs. 6.837,18 a tasa BCV")).toBeInTheDocument();
  });

  it("asks for cédula, phone, bank and reference for pago móvil", () => {
    const onPagoMovil = jest.fn();
    render(
      <PaymentStep
        policy={policy}
        amount={7.5}
        currency="USD"
        methodId="pm"
        reference=""
        pagoMovil={emptySender}
        proofName=""
        bolivars={bolivars}
        onMethod={() => undefined}
        onReference={() => undefined}
        onPagoMovil={onPagoMovil}
        onProof={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Cédula del pago móvil")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono del pago móvil")).toBeInTheDocument();
    expect(screen.getByLabelText("Banco desde el que pagaste")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "0134 - Banesco" })).toBeInTheDocument();
    expect(screen.getByLabelText("Referencia del pago")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Banco desde el que pagaste"), { target: { value: "0134 - Banesco" } });
    expect(onPagoMovil).toHaveBeenCalledWith({ nationalId: "", phone: "", bank: "0134 - Banesco" });
  });

  it("tells the client the capture must be JPG, PNG or WebP up to 1.5 MB", () => {
    render(
      <PaymentStep
        policy={{
          ...policy,
          methods: [{ ...policy.methods[0], type: "ZELLE", requiresProof: true }],
        }}
        amount={7.5}
        currency="USD"
        methodId="pm"
        reference=""
        pagoMovil={emptySender}
        proofName=""
        bolivars={bolivars}
        onMethod={() => undefined}
        onReference={() => undefined}
        onPagoMovil={() => undefined}
        onProof={() => undefined}
      />,
    );
    expect(screen.queryByLabelText("Cédula del pago móvil")).not.toBeInTheDocument();
    expect(screen.getByText("JPG, PNG o WebP, hasta 1.5 MB.")).toBeInTheDocument();
  });
});
