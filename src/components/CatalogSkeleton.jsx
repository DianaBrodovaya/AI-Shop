import styles from "./CatalogSkeleton.module.css";

function CatalogSkeleton({ count = 6 }) {
  return (
    <div className={styles.grid} role="status" aria-label="Загрузка каталога">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.image} />
          <div className={styles.line} />
          <div className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}

export default CatalogSkeleton;
