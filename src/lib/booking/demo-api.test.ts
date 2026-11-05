import { demoBookingApi } from "./demo-api";
import { describe, expect, it } from "@jest/globals";
describe("demoBookingApi", () => {
  it("represents expired links without confirming them", async () => {
    await expect(demoBookingApi.getVerificationDetails("demo-expired")).resolves.toMatchObject({ status: "EXPIRED" });
  });
  it("makes repeated confirmation idempotent", async () => {
    const first = await demoBookingApi.confirmBooking("demo-valid-token", "one");
    const second = await demoBookingApi.confirmBooking("demo-valid-token", "two");
    expect(second.bookingCode).toBe(first.bookingCode);
  });
});
