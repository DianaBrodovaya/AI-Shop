import { describe, it, expect } from "vitest";
import { filterProducts } from "../filters.js";

const products = [
  { id: 1, name: "A", price: 1000, category: "Одежда", inStock: true },
  { id: 2, name: "B", price: 5000, category: "Обувь", inStock: true },
  { id: 3, name: "C", price: 3000, category: "Одежда", inStock: false },
  { id: 4, name: "D", price: 8000, category: "Аксессуары", inStock: true },
];

describe("filterProducts", () => {
  it("returns all products when no filters", () => {
    expect(filterProducts(products)).toHaveLength(4);
  });

  it("filters by price range", () => {
    const result = filterProducts(products, { minPrice: 2000, maxPrice: 6000 });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual([2, 3]);
  });

  it("filters by category", () => {
    const result = filterProducts(products, { categories: ["Одежда"] });
    expect(result).toHaveLength(2);
  });

  it("combines price and category filters", () => {
    const result = filterProducts(products, {
      minPrice: 2000,
      categories: ["Одежда"],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("returns empty array when nothing matches", () => {
    const result = filterProducts(products, { minPrice: 50000 });
    expect(result).toHaveLength(0);
  });

  it("returns all when filter object is empty", () => {
    expect(filterProducts(products, {})).toHaveLength(4);
  });

  it("handles empty products array", () => {
    expect(filterProducts([], { minPrice: 100 })).toHaveLength(0);
  });

  it("ignores undefined filter fields", () => {
    const result = filterProducts(products, { minPrice: undefined, categories: undefined });
    expect(result).toHaveLength(4);
  });

  it("handles minPrice greater than maxPrice", () => {
    const result = filterProducts(products, { minPrice: 9000, maxPrice: 1000 });
    expect(result).toHaveLength(0);
  });

  it("filters by multiple categories", () => {
    const result = filterProducts(products, { categories: ["Одежда", "Обувь"] });
    expect(result).toHaveLength(3);
  });
});
