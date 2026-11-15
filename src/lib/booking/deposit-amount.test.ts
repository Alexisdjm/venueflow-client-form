import { quotedDeposit } from "./deposit-amount";

describe("quotedDeposit", () => {
  it("rounds a percentage of the service total to cents", () => {
    expect(quotedDeposit(
      { deposit: { mode: "PERCENT", percent: 50 }, holdMinutes: 240, methods: [] },
      [19.99],
      "USD",
    )).toEqual({ amount: 10, currency: "USD" });
  });

  it("keeps the fixed amount in the currency declared by the spa", () => {
    expect(quotedDeposit(
      { deposit: { mode: "FIXED", amount: 15, currency: "VES" }, holdMinutes: 240, methods: [] },
      [80],
      "USD",
    )).toEqual({ amount: 15, currency: "VES" });
  });
});
