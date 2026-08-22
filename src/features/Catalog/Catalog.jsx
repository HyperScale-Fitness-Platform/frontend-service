import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";

import { getCatalogProducts } from "./catalogApi";
import styles from "./Catalog.module.css";

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await getCatalogProducts({ is_active: true });
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Unable to load catalog");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Shop</p>
          <h1>Gym Catalog</h1>
        </div>
      </div>

      <section className={styles.catalogSection}>
        <h2>Featured products</h2>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available yet.</p>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product) => (
              <article key={product.id} className={styles.productCard}>
                <Link to={`/catalog/${product.id}`} className={styles.productLink}>
                  <div className={styles.imageWrap}>
                    {product.image_path ? (
                      <img src={product.image_path} alt={product.name} className={styles.productImage} />
                    ) : (
                      <div className={styles.imagePlaceholder}>No image</div>
                    )}
                  </div>

                  <div className={styles.productBody}>
                    <p className={styles.category}>{product.category}</p>
                    <h3>{product.name}</h3>
                    <p className={styles.price}>{(product.price_cents / 100).toFixed(2)} USD</p>
                    <p className={styles.stock}>Stock: {product.stock_qty}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
