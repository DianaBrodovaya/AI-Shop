// Цена после скидки, округлённая до целого.
// discount — процент (0..100): 0 или меньше → исходная цена, 100 и больше → 0.
export function calcDiscountPrice(price, discount) {
  if (!discount || discount <= 0) return price;
  if (discount >= 100) return 0;
  return Math.round(price * (1 - discount / 100));
}
