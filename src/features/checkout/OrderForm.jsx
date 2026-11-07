import { useState } from 'react';
import styles from './OrderForm.module.css';

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OrderForm({ cartItems, totalPrice, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const next = {};
    if (!data.name.trim()) next.name = 'Введите имя';
    else if (data.name.trim().length < 2) next.name = 'Имя слишком короткое';

    const phoneDigits = data.phone.replace(/[^0-9+]/g, '');
    if (!phoneDigits) next.phone = 'Введите телефон';
    else if (!PHONE_REGEX.test(phoneDigits)) next.phone = 'Телефон в формате +7XXXXXXXXXX';

    if (!data.email.trim()) next.email = 'Введите email';
    else if (!EMAIL_REGEX.test(data.email.trim())) next.email = 'Некорректный email';

    if (!data.address.trim()) next.address = 'Введите адрес доставки';
    else if (data.address.trim().length < 5) next.address = 'Адрес слишком короткий';

    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };
    setFormData(nextData);
    if (touched[name]) {
      setErrors(validate(nextData));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(formData));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {},
    );
    setTouched(allTouched);
    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      ...formData,
      items: cartItems,
      total: totalPrice,
    });
  };

  const isValid = Object.keys(validate(formData)).length === 0;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2>Оформление заказа</h2>

      <div className={styles.summary}>
        <p>Товаров: {cartItems.length}</p>
        <p className={styles.total}>Итого: {totalPrice} ₽</p>
      </div>

      <div className={styles.field}>
        <label htmlFor="name">Имя</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(errors.name && touched.name)}
          aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
        />
        {errors.name && touched.name && (
          <span id="name-error" className={styles.error} role="alert">
            {errors.name}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="phone">Телефон</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(errors.phone && touched.phone)}
          aria-describedby={errors.phone && touched.phone ? 'phone-error' : undefined}
        />
        {errors.phone && touched.phone && (
          <span id="phone-error" className={styles.error} role="alert">
            {errors.phone}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(errors.email && touched.email)}
          aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
        />
        {errors.email && touched.email && (
          <span id="email-error" className={styles.error} role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="address">Адрес доставки</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          onBlur={handleBlur}
          rows={3}
          aria-invalid={Boolean(errors.address && touched.address)}
          aria-describedby={errors.address && touched.address ? 'address-error' : undefined}
        />
        {errors.address && touched.address && (
          <span id="address-error" className={styles.error} role="alert">
            {errors.address}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={!isValid}
      >
        Оформить заказ
      </button>
    </form>
  );
}
