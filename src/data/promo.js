const PROMO_CODES = {
  SALE15: 15,
  SALE20: 20,
  WELCOME10: 10,
};

export function validatePromo(code) {
  const discount = PROMO_CODES[code.toUpperCase()];
  return discount ? { valid: true, discount } : { valid: false };
}
