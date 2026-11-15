import { bookingMatchesSpa, spaSlugFromPath } from "./spa-host";
import { describe, expect, it } from "@jest/globals";

describe("spa path", () => {
  it("reads the spa slug from the public path", () => {
    expect(spaSlugFromPath("emi-nails")).toBe("emi-nails");
    expect(spaSlugFromPath("EMI-NAILS")).toBe("emi-nails");
    expect(spaSlugFromPath(" bella-nails ")).toBe("bella-nails");
  });

  it("rejects reserved, empty and malformed slugs", () => {
    for (const slug of ["app", "api", "www", "admin", "form", "", "emi_nails", "emi.nails", "a/b"]) {
      expect(spaSlugFromPath(slug)).toBeNull();
    }
    expect(spaSlugFromPath(null)).toBeNull();
  });

  it("does not treat another spa's booking as the current path", () => {
    const emi = { slug: "emi-nails", name: "EmiNails" };
    expect(bookingMatchesSpa({ spaName: "EmiNails" }, emi)).toBe(true);
    expect(bookingMatchesSpa({ spaName: "Bella" }, emi)).toBe(false);
    expect(bookingMatchesSpa({ spaSlug: "bella-nails", spaName: "EmiNails" }, emi)).toBe(false);
    expect(bookingMatchesSpa({ spaSlug: "emi-nails", spaName: "EmiNails" }, emi)).toBe(true);
  });
});
