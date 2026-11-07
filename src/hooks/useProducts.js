import { useState, useEffect, useCallback } from "react";
import { fetchProductsWithRetry, fetchProductsMock } from "../api/catalog.js";

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      let result;
      if (useMockData) {
        const mock = await fetchProductsMock();
        const { adaptProductList } = await import("../api/catalog-adapter.js");
        result = adaptProductList(mock);
      } else {
        result = await fetchProductsWithRetry({}, {
          onRetry: () => setStatus("retrying"),
        });
      }

      setProducts(result.products);
      setStatus(result.fromCache ? "fallback" : "success");
    } catch (err) {
      setError(err);
      setStatus("failed");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { products, status, error, retry: load };
}
