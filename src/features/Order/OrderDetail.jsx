import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";

import { getOrderById } from "./orderApi";
import styles from "./Order.module.css";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        toast.error("Unable to load order");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p>Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <p>Order not found.</p>
        <Link to="/orders" className={styles.backLink}>
          ← Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/orders" className={styles.backLink}>
        ← Back to orders
      </Link>

      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Order #{order.id.slice(0, 8)}</p>
          <h1>{order.status.replace(/_/g, " ")}</h1>
        </div>
      </div>

      <div className={styles.cartList}>
        {(order.items || []).map((item) => (
          <div key={item.id} className={styles.cartRow}>
            <div className={styles.cartRowInfo}>
              <h3>Product #{item.product_id.slice(0, 8)}</h3>
              <p className={styles.unitPrice}>
                {(item.unit_price_cents / 100).toFixed(2)} EGP each
              </p>
            </div>
            <p>Qty: {item.quantity}</p>
            <p className={styles.lineTotal}>
              {((item.quantity * item.unit_price_cents) / 100).toFixed(2)} USD
            </p>
          </div>
        ))}
      </div>

      <div className={styles.cartFooter}>
        <p className={styles.total}>Total: {(order.total_cents / 100).toFixed(2)} EGP</p>
      </div>
    </div>
  );
}
