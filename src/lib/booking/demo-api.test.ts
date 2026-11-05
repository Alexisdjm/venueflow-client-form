import { demoBookingApi } from "./demo-api";
import { describe, expect, it } from "@jest/globals";
describe("demoBookingApi", () => {
  it("represents expired links without confirming them", async () => {
    await expect(demoBookingApi.getVerificationDetails("demo-expired")).resolves.toMatchObject({ status: "EXPIRED" });
  });
  it("repeats a confirmation only with the same idempotency key", async () => {
    const first = await demoBookingApi.confirmBooking("demo-valid-token", "same-key");
    const second = await demoBookingApi.confirmBooking("demo-valid-token", "same-key");
    expect(second.bookingCode).toBe(first.bookingCode);
    await expect(demoBookingApi.confirmBooking("demo-valid-token", "other-key")).rejects.toMatchObject({ status: 409 });
  });
});
