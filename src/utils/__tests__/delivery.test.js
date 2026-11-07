import { describe, it, expect } from "vitest";
import { getDeliveryPrice } from "../cart-utils.js";

describe("getDeliveryPrice", () => {
  it("returns delivery cost below threshold", () => {
    expect(getDeliveryPrice(1000)).toBe(350);
  });

  it("returns free delivery at threshold", () => {
    expect(getDeliveryPrice(2000)).toBe(0);
  });

  it("returns free delivery above threshold", () => {
    expect(getDeliveryPrice(5000)).toBe(0);
  });

  it("returns delivery cost for zero", () => {
    expect(getDeliveryPrice(0)).toBe(350);
  });

  it("throws for NaN", () => {
    expect(() => getDeliveryPrice(NaN)).toThrow("orderTotal must be a number");
  });

  it("throws for negative", () => {
    expect(() => getDeliveryPrice(-100)).toThrow("orderTotal must not be negative");
  });

  it("throws for non-number", () => {
    expect(() => getDeliveryPrice("100")).toThrow("orderTotal must be a number");
  });
});
