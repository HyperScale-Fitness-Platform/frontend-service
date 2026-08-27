import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";

import { stripePromise } from "../../utils/stripe";
import CheckoutForm from "../Payment/CheckoutForm";
import { getCart, updateCartItem, removeCartItem, checkout } from "./orderApi";
import { getCatalogProductById } from "../Catalog/catalogApi";
import styles from "./Order.module.css";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

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
      // order-service now starts a payment intent as part of checkout —
      // same shape as MembershipPlans/PTPackages: hold the clientSecret in
      // state and render Stripe's CheckoutForm rather than navigating away
      // immediately, since the order isn't paid yet at this point.
      if (order.clientSecret) {
        setPendingOrderId(order.order_id);
        setClientSecret(order.clientSecret);
      } else {
        // Shouldn't normally happen — checkout only returns 201 once a
        // payment intent was created — but fall back to the order page
        // rather than getting stuck if it ever does.
        navigate(`/orders/${order.order_id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  }

  function handlePaymentSuccess() {
    setClientSecret(null);
    toast.success("Payment succeeded! Order placed.");
    const orderId = pendingOrderId;
    setPendingOrderId(null);
    navigate(`/orders/${orderId}`);
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
                      {(item.unit_price_cents / 100).toFixed(2)} EGP each
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
            <p className={styles.total}>Total: {(totalCents / 100).toFixed(2)} EGP</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleCheckout}
              disabled={checkingOut || Boolean(clientSecret)}
            >
              {checkingOut ? "Placing order..." : "Checkout"}
            </button>
          </div>

          {clientSecret && (
            <div className={styles.formCard}>
              <h3>Complete your payment</h3>
              <p>Enter your card details below to finish placing this order.</p>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          )}
        </>
      )}
    </div>
  );
}
