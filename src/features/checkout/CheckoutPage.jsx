import { useState } from 'react';
import { useCart } from '../cart/CartContext';
import { OrderForm } from './OrderForm';
import styles from './CheckoutPage.module.css';

function CheckoutPage() {
  const { items, getTotal } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleOrderSubmit = (orderData) => {
    // В реальном проекте здесь будет отправка на сервер
    console.log('Order submitted:', orderData);
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className={styles.success}>
        <h2>Заказ оформлен</h2>
        <p>Спасибо за покупку! Мы свяжемся с вами для подтверждения.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Оформление заказа</h2>
        <p>Корзина пуста. Добавьте товары в каталоге.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <OrderForm
        cartItems={items}
        totalPrice={getTotal()}
        onSubmit={handleOrderSubmit}
      />
    </div>
  );
}

export default CheckoutPage;
