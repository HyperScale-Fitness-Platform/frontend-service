import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";

import { getOrders } from "./orderApi";
import styles from "./Order.module.css";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Unable to load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Shop</p>
          <h1>Your Orders</h1>
        </div>
        <Link to="/cart" className={styles.secondaryLink}>
          Back to cart →
        </Link>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className={styles.orderRow}>
              <div>
                <p className={styles.orderId}>Order #{order.id.slice(0, 8)}</p>
                <p className={styles.orderDate}>
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <span className={styles.statusBadge}>{order.status.replace(/_/g, " ")}</span>
              <p className={styles.orderTotal}>{(order.total_cents / 100).toFixed(2)} USD</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
