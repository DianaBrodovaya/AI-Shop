export function getSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function applyDiscount(subtotal, discountPercent) {
  if (!discountPercent || discountPercent <= 0) return subtotal;
  return Math.round(subtotal * (1 - discountPercent / 100));
}

const FREE_DELIVERY_THRESHOLD = 2000;
const DELIVERY_COST = 350;

export function getDeliveryPrice(orderTotal) {
  if (typeof orderTotal !== "number" || Number.isNaN(orderTotal)) {
    throw new Error("orderTotal must be a number");
  }
  if (orderTotal < 0) {
    throw new Error("orderTotal must not be negative");
  }
  return orderTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
}

export function calculateTotal(items, promoDiscount) {
  const subtotal = getSubtotal(items);
  const discounted = applyDiscount(subtotal, promoDiscount);
  const delivery = getDeliveryPrice(discounted);
  return discounted + delivery;
}
