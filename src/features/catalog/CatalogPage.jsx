import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { products as staticProducts } from "../../data/products.js";
import { useCart } from "../cart/CartContext.jsx";
import { useProducts } from "../../hooks/useProducts.js";
import { calcDiscountPrice } from "../../utils/price.js";
import { filterProducts } from "../../utils/filters.js";
import CatalogFilters from "./CatalogFilters.jsx";
import CatalogSkeleton from "../../components/CatalogSkeleton.jsx";
import styles from "./CatalogPage.module.css";

function parseFiltersFromParams(params) {
  const filters = {};
  const min = params.get("minPrice");
  const max = params.get("maxPrice");
  const cats = params.get("categories");
  if (min) filters.minPrice = Number(min);
  if (max) filters.maxPrice = Number(max);
  if (cats) filters.categories = cats.split(",");
  return filters;
}

function filtersToParams(filters) {
  const params = {};
  if (filters.minPrice !== undefined) params.minPrice = String(filters.minPrice);
  if (filters.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
  if (filters.categories && filters.categories.length > 0) {
    params.categories = filters.categories.join(",");
  }
  return params;
}

function CatalogPage() {
  const { addToCart } = useCart();
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, status, error, retry } = useProducts();

  const filters = parseFiltersFromParams(searchParams);

  const categories = useMemo(
    () => [...new Set(staticProducts.map((p) => p.category))],
    [],
  );

  function handleFiltersChange(next) {
    setSearchParams(filtersToParams(next));
  }

  let visibleProducts = filterProducts(products, filters);
  if (onlyInStock) {
    visibleProducts = visibleProducts.filter((p) => p.inStock);
  }

  return (
    <section>
      <h1 className={styles.title}>Каталог</h1>

      {status === "loading" && (
        <CatalogSkeleton />
      )}

      {status === "retrying" && (
        <>
          <CatalogSkeleton />
          <p className={styles.statusMessage}>Повторяем запрос...</p>
        </>
      )}

      {status === "fallback" && (
        <p className={styles.fallbackNotice}>
          Показаны данные из кеша — API временно недоступен.
        </p>
      )}

      {status === "failed" && (
        <div className={styles.errorBlock}>
          <p>Не удалось загрузить каталог. {error?.message}</p>
          <button className={styles.resetButton} onClick={retry}>
            Попробовать снова
          </button>
        </div>
      )}

      {(status === "success" || status === "fallback") && (
        <>
          <CatalogFilters
            filters={filters}
            categories={categories}
            onChange={handleFiltersChange}
            resultCount={visibleProducts.length}
          />
          <label className={styles.filter}>
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
            />
            Только в наличии
          </label>
          {visibleProducts.length === 0 ? (
            <div className={styles.empty}>
              <p>Товары не найдены</p>
              <button
                className={styles.resetButton}
                onClick={() => {
                  setSearchParams({});
                  setOnlyInStock(false);
                }}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {visibleProducts.map((product) => {
                const discountedPrice =
                  product.discount > 0
                    ? calcDiscountPrice(product.price, product.discount)
                    : null;

                return (
                  <article key={product.id} className={styles.card}>
                    <div className={styles.imagePlaceholder} />
                    <h2 className={styles.name}>
                      <Link to={`/product/${product.id}`}>{product.name}</Link>
                    </h2>
                    {discountedPrice !== null ? (
                      <div className={styles.priceRow}>
                        <span className={styles.priceOld}>{product.price} ₽</span>
                        <span className={styles.price}>{discountedPrice} ₽</span>
                        <span className={styles.badge}>-{product.discount}%</span>
                      </div>
                    ) : (
                      <p className={styles.price}>{product.price} ₽</p>
                    )}
                    <button
                      className={styles.button}
                      disabled={!product.inStock}
                      onClick={() => addToCart(product)}
                    >
                      {product.inStock ? "В корзину" : "Нет в наличии"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default CatalogPage;
