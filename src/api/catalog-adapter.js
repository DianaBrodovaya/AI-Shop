import { ApiError, ErrorType } from "./errors.js";

const REQUIRED_PRODUCT_FIELDS = ["item_id", "item_name", "item_price", "in_stock"];

/**
 * Преобразует товар из формата поставщика во внутреннюю модель.
 * При изменении формата поставщика правки только здесь.
 * @param {Object} raw - объект из API поставщика
 * @returns {{ id: number, name: string, price: number, inStock: boolean, category: string, discount: number, image: string, description: string }}
 */
export function adaptProduct(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new ApiError("Invalid response: product is not an object", ErrorType.INVALID_RESPONSE);
  }

  for (const field of REQUIRED_PRODUCT_FIELDS) {
    if (raw[field] === undefined || raw[field] === null) {
      throw new ApiError(`Invalid response: missing ${field}`, ErrorType.INVALID_RESPONSE);
    }
  }

  return {
    id: raw.item_id,
    name: raw.item_name,
    price: raw.item_price,
    inStock: raw.in_stock,
    category: raw.category || "Без категории",
    discount: raw.discount || 0,
    image: raw.image || "",
    description: raw.description || "",
  };
}

export function adaptProductList(response) {
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    throw new ApiError("Invalid response: expected object", ErrorType.INVALID_RESPONSE);
  }

  if (!Array.isArray(response.items)) {
    throw new ApiError("Invalid response: missing items array", ErrorType.INVALID_RESPONSE);
  }

  return {
    products: response.items.map(adaptProduct),
    total: response.total,
    page: response.page,
  };
}
