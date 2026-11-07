import { ApiError, ErrorType } from "./errors.js";

/**
 * Преобразует товар из формата поставщика во внутреннюю модель.
 * При изменении формата поставщика правки только здесь.
 * @param {Object} raw - объект из API поставщика
 * @returns {{ id: number, name: string, price: number, inStock: boolean }}
 */
export function adaptProduct(raw) {
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
  if (!response.items || !Array.isArray(response.items)) {
    throw new ApiError("Invalid response: missing items array", ErrorType.INVALID_RESPONSE);
  }

  return {
    products: response.items.map(adaptProduct),
    total: response.total,
    page: response.page,
  };
}
