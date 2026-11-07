import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError, ErrorType } from "../errors.js";
import { fetchProductsWithRetry } from "../catalog.js";

describe("API Client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn());
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("adapts successful response", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        items: [{ item_id: 1, item_name: "Test", item_price: 100, in_stock: true }],
        total: 1,
        page: 1,
      }),
    });

    const result = await fetchProductsWithRetry();
    expect(result.products[0].name).toBe("Test");
    expect(result.products[0].id).toBe(1);
  });

  it("throws TimeoutError on timeout", async () => {
    fetch.mockRejectedValue(Object.assign(new Error("Timeout"), { name: "TimeoutError" }));

    // attach catch before timers run to avoid unhandled rejection warnings
    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(false);
    expect(result.e).toBeInstanceOf(ApiError);
  });

  it("throws ApiError SERVER on 500", async () => {
    fetch.mockResolvedValue({ ok: false, status: 500, headers: new Headers() });

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(false);
    expect(result.e).toBeInstanceOf(ApiError);
    expect(result.e.type).toBe(ErrorType.SERVER);
  });

  it("throws ApiError CLIENT on 404 without retry", async () => {
    fetch.mockResolvedValue({ ok: false, status: 404, headers: new Headers() });

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(false);
    expect(result.e.type).toBe(ErrorType.CLIENT);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to cache when API fails", async () => {
    const cachedData = {
      data: { products: [{ id: 1, name: "Cached" }], total: 1, page: 1 },
      timestamp: Date.now(),
    };
    localStorage.getItem.mockReturnValue(JSON.stringify(cachedData));
    fetch.mockRejectedValue(new Error("Network error"));

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(true);
    expect(result.v.fromCache).toBe(true);
  });

  it("throws when no cache and API fails", async () => {
    localStorage.getItem.mockReturnValue(null);
    fetch.mockRejectedValue(new Error("Network error"));

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(false);
  });

  it("throws INVALID_RESPONSE when items array is missing", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ wrong: "format" }),
    });

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(false);
    expect(result.e.type).toBe(ErrorType.INVALID_RESPONSE);
  });

  it("handles rate limit 429", async () => {
    const headers = new Headers();
    headers.set("Retry-After", "5");
    fetch.mockResolvedValue({ ok: false, status: 429, headers });

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    const result = await settled;
    expect(result.ok).toBe(false);
    expect(result.e.type).toBe(ErrorType.RATE_LIMIT);
  });

  it("retries on network error up to 3 times", async () => {
    localStorage.getItem.mockReturnValue(null);
    fetch.mockRejectedValue(new Error("Network error"));

    const promise = fetchProductsWithRetry();
    const settled = promise.then((v) => ({ ok: true, v })).catch((e) => ({ ok: false, e }));
    await vi.runAllTimersAsync();

    await settled;
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
