import { describe, it, expect } from "vitest";
import { calcDiscountPrice } from "../price.js";

describe("calcDiscountPrice", () => {
  it("applies percentage discount", () => {
    expect(calcDiscountPrice(5000, 20)).toBe(4000);
  });

  it("returns original price when discount is 0", () => {
    expect(calcDiscountPrice(5000, 0)).toBe(5000);
  });

  it("returns 0 when discount is 100%", () => {
    expect(calcDiscountPrice(5000, 100)).toBe(0);
  });

  it("clamps to 0 when discount exceeds 100%", () => {
    expect(calcDiscountPrice(5000, 150)).toBe(0);
  });

  it("returns original price for negative discount", () => {
    expect(calcDiscountPrice(5000, -10)).toBe(5000);
  });

  it("returns 0 when price is 0", () => {
    expect(calcDiscountPrice(0, 20)).toBe(0);
  });

  it("rounds to nearest integer", () => {
    expect(calcDiscountPrice(999, 33)).toBe(669);
  });

  it("returns original price for null discount", () => {
    expect(calcDiscountPrice(5000, null)).toBe(5000);
  });

  it("returns original price for undefined discount", () => {
    expect(calcDiscountPrice(5000, undefined)).toBe(5000);
  });

  it("handles fractional discount correctly", () => {
    expect(calcDiscountPrice(1000, 33.33)).toBe(667);
  });
});
