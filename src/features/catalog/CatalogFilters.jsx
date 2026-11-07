import styles from "./CatalogFilters.module.css";

function CatalogFilters({ filters, categories, onChange, resultCount }) {
  function handleMinPrice(e) {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    onChange({ ...filters, minPrice: value });
  }

  function handleMaxPrice(e) {
    const value = e.target.value === "" ? undefined : Number(e.target.value);
    onChange({ ...filters, maxPrice: value });
  }

  function handleCategory(category) {
    const current = filters.categories || [];
    const next = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange({ ...filters, categories: next });
  }

  function handleReset() {
    onChange({});
  }

  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    (filters.categories && filters.categories.length > 0);

  return (
    <div className={styles.filters}>
      <div className={styles.group}>
        <span className={styles.label}>Цена</span>
        <input
          className={styles.input}
          type="number"
          placeholder="от"
          value={filters.minPrice ?? ""}
          onChange={handleMinPrice}
        />
        <span className={styles.separator}>-</span>
        <input
          className={styles.input}
          type="number"
          placeholder="до"
          value={filters.maxPrice ?? ""}
          onChange={handleMaxPrice}
        />
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Категория</span>
        {categories.map((cat) => (
          <label key={cat} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={(filters.categories || []).includes(cat)}
              onChange={() => handleCategory(cat)}
            />
            {cat}
          </label>
        ))}
      </div>
      <div className={styles.meta}>
        <span className={styles.count}>Найдено: {resultCount}</span>
        {hasActiveFilters && (
          <button className={styles.reset} onClick={handleReset}>
            Сбросить фильтры
          </button>
        )}
      </div>
    </div>
  );
}

export default CatalogFilters;
