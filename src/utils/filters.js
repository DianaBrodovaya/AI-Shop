export function filterProducts(products, { minPrice, maxPrice, categories } = {}) {
  return products.filter((product) => {
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;
    if (categories && categories.length > 0 && !categories.includes(product.category)) return false;
    return true;
  });
}
