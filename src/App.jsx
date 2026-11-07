import { Routes, Route, Link } from "react-router-dom";
import CatalogPage from "./features/catalog/CatalogPage.jsx";
import ProductPage from "./features/catalog/ProductPage.jsx";
import CartPage from "./features/cart/CartPage.jsx";
import CheckoutPage from "./features/checkout/CheckoutPage.jsx";
import { CartProvider } from "./features/cart/CartContext.jsx";
import styles from "./App.module.css";

function App() {
  return (
    <CartProvider>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          HTML Academy Shop
        </Link>
        <nav className={styles.nav}>
          <Link to="/">Каталог</Link>
          <Link to="/cart">Корзина</Link>
        </nav>
      </header>
      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </main>
    </CartProvider>
  );
}

export default App;
