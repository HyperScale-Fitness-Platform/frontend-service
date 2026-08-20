import { useEffect, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";

import { createCatalogProduct, getCatalogProducts } from "./catalogApi";
import styles from "./Catalog.module.css";

const emptyForm = {
  name: "",
  description: "",
  category: "supplements",
  price_cents: 1999,
  stock_qty: 10,
  image_path: "",
};

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

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

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price_cents: Number(form.price_cents),
        stock_qty: Number(form.stock_qty),
        image_path: form.image_path.trim(),
      };

      if (!payload.name || !payload.category || Number.isNaN(payload.price_cents)) {
        toast.error("Please complete the required fields");
        return;
      }

      const created = await createCatalogProduct(payload);
      setProducts((current) => [created, ...current]);
      setForm(emptyForm);
      toast.success("Product created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to create product");
    } finally {
      setSubmitting(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Shop</p>
          <h1>Gym Catalog</h1>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Add Product</h2>

        <div className={styles.formGrid}>
          <label>
            Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>

          <label>
            Category
            <input name="category" value={form.category} onChange={handleChange} required />
          </label>

          <label>
            Price (cents)
            <input
              type="number"
              name="price_cents"
              value={form.price_cents}
              onChange={handleChange}
              min="0"
              required
            />
          </label>

          <label>
            Stock
            <input
              type="number"
              name="stock_qty"
              value={form.stock_qty}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <label>
          Product image path (S3 URL or object key)
          <input
            name="image_path"
            value={form.image_path}
            onChange={handleChange}
            placeholder="s3://gym-assets/products/athletic-shoe.jpg"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
          />
        </label>

        <button type="submit" disabled={submitting} className={styles.primaryButton}>
          {submitting ? "Saving..." : "Create product"}
        </button>
      </form>

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
