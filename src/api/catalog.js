import { ApiError, ErrorType, isRetryable } from "./errors.js";
import { adaptProductList } from "./catalog-adapter.js";

const API_BASE = "/api/v2";
const TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;
const CACHE_KEY = "products_cache";

function getApiKey() {
  return import.meta.env.VITE_API_KEY || "";
}

async function fetchProducts(params = {}) {
  const url = new URL(`${API_BASE}/products`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, value);
  });

  let response;
  try {
    response = await fetch(url.toString(), {
      headers: { "X-Api-Key": getApiKey() },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new ApiError("Request timed out", ErrorType.TIMEOUT);
    }
    throw new ApiError("Network error", ErrorType.NETWORK);
  }

  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    throw new ApiError(
      `Rate limited. Retry after ${retryAfter}s`,
      ErrorType.RATE_LIMIT,
      429,
    );
  }

  if (response.status >= 500) {
    throw new ApiError(`Server error: ${response.status}`, ErrorType.SERVER, response.status);
  }

  if (!response.ok) {
    throw new ApiError(`Client error: ${response.status}`, ErrorType.CLIENT, response.status);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Invalid JSON", ErrorType.INVALID_RESPONSE);
  }

  const adapted = adaptProductList(data);
  saveToCache(CACHE_KEY, adapted);
  return adapted;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchProductsWithRetry(params = {}, { onRetry } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchProducts(params);
    } catch (error) {
      lastError = error;

      if (!isRetryable(error) || attempt === MAX_RETRIES) {
        break;
      }

      if (onRetry) onRetry(attempt);
      await delay(attempt * 1000);
    }
  }

  const cached = loadFromCache(CACHE_KEY);
  if (cached) return { ...cached, fromCache: true };

  throw lastError;
}

function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // localStorage may be unavailable
  }
}

function loadFromCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch {
    return null;
  }
}

export function fetchProductsMock() {
  return import("./mocks/catalog.json").then((m) => m.default);
}
