import { bookingMatchesSpa, spaSlugFromHost, spaSlugFromRequestHeaders } from "./spa-host";
import { describe, expect, it } from "@jest/globals";

const local = ["localhost"];
const production = ["tryvenueflow.com"];

describe("spa hostname", () => {
  it("reads a single spa label from the configured parent domain", () => {
    expect(spaSlugFromHost("emi-nails.localhost:3002", local)).toBe("emi-nails");
    expect(spaSlugFromHost("bella-nails.localhost", local)).toBe("bella-nails");
    expect(spaSlugFromHost("EMI-NAILS.LOCALHOST:3002", local)).toBe("emi-nails");
    expect(spaSlugFromHost("emi-nails.tryvenueflow.com", production)).toBe("emi-nails");
  });

  it("rejects apex hosts, reserved labels, extra labels and foreign domains", () => {
    expect(spaSlugFromHost("localhost:3002", local)).toBeNull();
    expect(spaSlugFromHost("tryvenueflow.com", production)).toBeNull();
    for (const label of ["app", "api", "www", "admin"]) {
      expect(spaSlugFromHost(`${label}.localhost`, local)).toBeNull();
      expect(spaSlugFromHost(`${label}.tryvenueflow.com`, production)).toBeNull();
    }
    expect(spaSlugFromHost("foo.emi-nails.localhost", local)).toBeNull();
    expect(spaSlugFromHost("emi_nails.localhost", local)).toBeNull();
    expect(spaSlugFromHost("emi-nails.example.com", local)).toBeNull();
    expect(spaSlugFromHost("emi-nails.localhost.evil.com", production)).toBeNull();
    expect(spaSlugFromHost(null, local)).toBeNull();
  });

  it("ignores client-supplied tenant headers", () => {
    const source = {
      get(name: string) {
        const values: Record<string, string> = {
          host: "api.localhost:3002",
          "x-forwarded-host": "emi-nails.localhost:3002",
          "x-spa-slug": "emi-nails",
        };
        return values[name] ?? null;
      },
    };
    expect(spaSlugFromRequestHeaders(source, local)).toBeNull();
  });

  it("does not treat another spa's booking as the current host", () => {
    const emi = { slug: "emi-nails", name: "EmiNails" };
    expect(bookingMatchesSpa({ spaName: "EmiNails" }, emi)).toBe(true);
    expect(bookingMatchesSpa({ spaName: "Bella" }, emi)).toBe(false);
    expect(bookingMatchesSpa({ spaSlug: "bella-nails", spaName: "EmiNails" }, emi)).toBe(false);
    expect(bookingMatchesSpa({ spaSlug: "emi-nails", spaName: "EmiNails" }, emi)).toBe(true);
  });
});
