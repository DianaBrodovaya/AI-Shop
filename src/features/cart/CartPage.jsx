import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "./CartContext.jsx";
import styles from "./CartPage.module.css";

function CartPage() {
  const { items, promo, removeFromCart, applyPromo, removePromo, getSubtotal, getDelivery, getTotal } = useCart();
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState(null);

  function handleApplyPromo() {
    const result = applyPromo(promoInput.trim());
    if (result.success) {
      setPromoMessage({ type: "success", text: "Промокод применён" });
      setPromoInput("");
    } else {
      setPromoMessage({ type: "error", text: "Промокод не найден" });
    }
  }

  if (items.length === 0) {
    return (
      <section>
        <h1 className={styles.title}>Корзина</h1>
        <p>
          Корзина пуста. <Link to="/">Перейти в каталог</Link>
        </p>
      </section>
    );
  }

  const subtotal = getSubtotal();
  const delivery = getDelivery();
  const total = getTotal();
  const discountAmount = subtotal + delivery - total;

  return (
    <section>
      <h1 className={styles.title}>Корзина</h1>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.quantity}>&times; {item.quantity}</span>
            </div>
            <div className={styles.itemRight}>
              <span className={styles.itemPrice}>
                {item.price * item.quantity} ₽
              </span>
              <button
                className={styles.remove}
                onClick={() => removeFromCart(item.id)}
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className={styles.promoSection}>
        {promo ? (
          <div className={styles.promoApplied}>
            <span>Промокод {promo.code} (-{promo.discount}%)</span>
            <button className={styles.promoRemove} onClick={removePromo}>
              Удалить
            </button>
          </div>
        ) : (
          <div className={styles.promoForm}>
            <input
              className={styles.promoInput}
              type="text"
              placeholder="Промокод"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
            />
            <button className={styles.promoButton} onClick={handleApplyPromo}>
              Применить
            </button>
          </div>
        )}
        {promoMessage && (
          <p
            className={
              promoMessage.type === "success"
                ? styles.promoSuccess
                : styles.promoError
            }
          >
            {promoMessage.text}
          </p>
        )}
      </div>

      <div className={styles.total}>
        <div className={styles.totalRow}>
          <span>Подытог:</span>
          <span>{subtotal} ₽</span>
        </div>
        {discountAmount > 0 && (
          <div className={styles.totalRow}>
            <span>Скидка ({promo.discount}%):</span>
            <span className={styles.discount}>-{discountAmount} ₽</span>
          </div>
        )}
        <div className={styles.totalRow}>
          <span>Доставка:</span>
          <span>{delivery === 0 ? "Бесплатно" : `${delivery} ₽`}</span>
        </div>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Итого:</span>
          <span className={styles.totalPrice}>{total} ₽</span>
        </div>
      </div>

      <Link to="/checkout" className={styles.checkoutButton}>Оформить заказ</Link>
    </section>
  );
}

export default CartPage;
