import { useState } from "react";
import styles from "./QuantitySelector.module.css";

function QuantitySelector({ max = 10, onChange }) {
  const [value, setValue] = useState(1);

  function handleChange(next) {
    const clamped = Math.max(1, Math.min(max, next));
    setValue(clamped);
    if (onChange) onChange(clamped);
  }

  return (
    <div className={styles.selector}>
      <button
        className={styles.button}
        onClick={() => handleChange(value - 1)}
        disabled={value <= 1}
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button
        className={styles.button}
        onClick={() => handleChange(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
      {value >= max && (
        <p className={styles.limit} role="alert">
          Максимум {max} штук
        </p>
      )}
    </div>
  );
}

export default QuantitySelector;
