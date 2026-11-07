import { describe, it, expect } from "vitest";
import { getSubtotal, applyDiscount, calculateTotal } from "../cart-utils.js";

describe("applyDiscount", () => {
  it("applies percentage discount", () => {
    expect(applyDiscount(10000, 15)).toBe(8500);
  });

  it("returns subtotal when no discount", () => {
    expect(applyDiscount(5000, 0)).toBe(5000);
  });

  it("returns subtotal for null discount", () => {
    expect(applyDiscount(5000, null)).toBe(5000);
  });

  it("recalculates correctly for different inputs", () => {
    expect(applyDiscount(4300, 15)).toBe(3655);
    expect(applyDiscount(1500, 15)).toBe(1275);
  });
});

describe("getSubtotal", () => {
  it("sums price * quantity", () => {
    const items = [
      { price: 1000, quantity: 2 },
      { price: 500, quantity: 3 },
    ];
    expect(getSubtotal(items)).toBe(3500);
  });

  it("returns 0 for empty array", () => {
    expect(getSubtotal([])).toBe(0);
  });
});

describe("calculateTotal", () => {
  it("includes delivery when discounted subtotal falls below threshold", () => {
    const items = [{ price: 2100, quantity: 1 }];
    // subtotal = 2100 (above threshold), but after 15% discount = 1785 (below threshold)
    // delivery should be 350
    const total = calculateTotal(items, 15);
    expect(total).toBe(1785 + 350);
  });

  it("free delivery when discounted subtotal is above threshold", () => {
    const items = [{ price: 3000, quantity: 1 }];
    // after 10% discount = 2700 (still above 2000 threshold)
    const total = calculateTotal(items, 10);
    expect(total).toBe(2700);
  });
});
