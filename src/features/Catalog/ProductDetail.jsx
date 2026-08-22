import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";

import { getCatalogProductById } from "./catalogApi";
import { addCartItem } from "../Order/orderApi";
import styles from "./Catalog.module.css";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getCatalogProductById(productId);
        setProduct(data);
      } catch (error) {
        toast.error("Unable to load product details");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleAddToCart() {
    try {
      setAddingToCart(true);
      await addCartItem(productId, quantity);
      toast.success("Added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add to cart");
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return <div className={styles.page}><p>Loading product...</p></div>;
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <p>Product not found.</p>
        <button onClick={() => navigate("/catalog")} className={styles.primaryButton}>Back to catalog</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Link to="/catalog" className={styles.backLink}>← Back to catalog</Link>

      <div className={styles.detailLayout}>
        <div className={styles.detailImageWrap}>
          {product.image_path ? (
            <img src={product.image_path} alt={product.name} className={styles.detailImage} />
          ) : (
            <div className={styles.imagePlaceholderLarge}>No image</div>
          )}
        </div>

        <div className={styles.detailContent}>
          <p className={styles.eyebrow}>{product.category}</p>
          <h1>{product.name}</h1>
          <p className={styles.priceLarge}>{(product.price_cents / 100).toFixed(2)} USD</p>
          <p className={styles.stockLarge}>Available stock: {product.stock_qty}</p>

          <p className={styles.description}>{product.description || "No description provided."}</p>

          {product.image_path && (
            <p className={styles.imagePathText}>Stored image path: {product.image_path}</p>
          )}

          <div className={styles.qtyControls}>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock_qty || 1, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            className={styles.primaryButton}
            type="button"
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock_qty === 0}
          >
            {product.stock_qty === 0
              ? "Out of stock"
              : addingToCart
                ? "Adding..."
                : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
