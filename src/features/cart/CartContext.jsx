import { createContext, useContext, useState, useEffect } from "react";
import { validatePromo } from "../../data/promo.js";
import { getSubtotal, applyDiscount, calculateTotal, getDeliveryPrice } from "../../utils/cart-utils.js";

const CartContext = createContext(null);

const PROMO_KEY = "appliedPromo";

function loadPromo() {
  try {
    const saved = localStorage.getItem(PROMO_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function savePromo(promo) {
  if (promo) {
    localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
  } else {
    localStorage.removeItem(PROMO_KEY);
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [promo, setPromo] = useState(loadPromo);

  useEffect(() => {
    savePromo(promo);
  }, [promo]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }

  function applyPromo(code) {
    const result = validatePromo(code);
    if (result.valid) {
      setPromo({ code: code.toUpperCase(), discount: result.discount });
      return { success: true };
    }
    return { success: false };
  }

  function removePromo() {
    setPromo(null);
  }

  function getTotal() {
    return calculateTotal(items, promo?.discount);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        promo,
        addToCart,
        removeFromCart,
        applyPromo,
        removePromo,
        getSubtotal: () => getSubtotal(items),
        getDelivery: () => getDeliveryPrice(applyDiscount(getSubtotal(items), promo?.discount)),
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
