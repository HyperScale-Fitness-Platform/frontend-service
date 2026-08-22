import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

import { getCart, updateCartItem, removeCartItem, checkout } from "./orderApi";
import { getCatalogProductById } from "../Catalog/catalogApi";
import styles from "./Order.module.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      setLoading(true);
      const data = await getCart();
      setCart(data);

      const items = data?.items || [];
      const entries = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await getCatalogProductById(item.product_id);
            return [item.product_id, product];
          } catch {
            // Product may have been deleted since it was added to the cart;
            // fall back to showing just the id rather than breaking the page.
            return [item.product_id, null];
          }
        }),
      );
      setProducts(Object.fromEntries(entries));
    } catch (error) {
      toast.error("Unable to load cart");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuantityChange(productId, nextQuantity) {
    if (nextQuantity < 1) return;
    try {
      await updateCartItem(productId, nextQuantity);
      await loadCart();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update quantity");
    }
  }

  async function handleRemove(productId) {
    try {
      await removeCartItem(productId);
      await loadCart();
    } catch (error) {
      toast.error("Unable to remove item");
    }
  }

  async function handleCheckout() {
    try {
      setCheckingOut(true);
      const order = await checkout();
      toast.success("Order placed");
      navigate(`/orders/${order.order_id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalCents = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_cents,
    0,
  );

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Shop</p>
          <h1>Your Cart</h1>
        </div>
        <Link to="/orders" className={styles.secondaryLink}>
          View past orders →
        </Link>
      </div>

      {items.length === 0 ? (
        <p>
          Your cart is empty.{" "}
          <Link to="/catalog" className={styles.secondaryLink}>
            Browse the catalog
          </Link>
        </p>
      ) : (
        <>
          <div className={styles.cartList}>
            {items.map((item) => {
              const product = products[item.product_id];
              return (
                <div key={item.id} className={styles.cartRow}>
                  <div className={styles.cartRowInfo}>
                    <h3>{product?.name || "Product unavailable"}</h3>
                    <p className={styles.unitPrice}>
                      {(item.unit_price_cents / 100).toFixed(2)} USD each
                    </p>
                  </div>

                  <div className={styles.qtyControls}>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className={styles.lineTotal}>
                    {((item.quantity * item.unit_price_cents) / 100).toFixed(2)} USD
                  </p>

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemove(item.product_id)}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className={styles.cartFooter}>
            <p className={styles.total}>Total: {(totalCents / 100).toFixed(2)} USD</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? "Placing order..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
