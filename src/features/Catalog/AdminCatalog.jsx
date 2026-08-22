import { useState } from "react";
import toast from "react-hot-toast";

import { createCatalogProduct } from "./catalogApi";
import styles from "./Catalog.module.css";

const emptyForm = {
  name: "",
  description: "",
  category: "supplements",
  price_cents: 1999,
  stock_qty: 10,
  image_path: "",
};

export default function AdminCatalog() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
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

    try {
      setSubmitting(true);
      await createCatalogProduct(payload);
      setForm(emptyForm);
      toast.success("Product created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to create product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.eyebrow}>Catalog management</p>
          <h1>Products</h1>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Add Product</h2>
        <div className={styles.formGrid}>
          <label>Name<input name="name" value={form.name} onChange={handleChange} required /></label>
          <label>Category<input name="category" value={form.category} onChange={handleChange} required /></label>
          <label>Price (cents)<input type="number" name="price_cents" value={form.price_cents} onChange={handleChange} min="0" required /></label>
          <label>Stock<input type="number" name="stock_qty" value={form.stock_qty} onChange={handleChange} min="0" required /></label>
        </div>
        <label>Product image path (S3 URL or object key)<input name="image_path" value={form.image_path} onChange={handleChange} placeholder="s3://gym-assets/products/athletic-shoe.jpg" /></label>
        <label>Description<textarea name="description" value={form.description} onChange={handleChange} rows="4" /></label>
        <button type="submit" disabled={submitting} className={styles.primaryButton}>
          {submitting ? "Saving..." : "Create product"}
        </button>
      </form>
    </div>
  );
}
