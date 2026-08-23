import styles from "./TrainerBadge.module.css";

/*
 * Shown next to a plan name to indicate who created it.
 * variant: "trainer" | "ai"
 */
function TrainerBadge({ variant = "trainer" }) {
  return (
    <span className={styles.badge}>
      {variant === "ai"
        ? "made by AI"
        : "made by your trainer"}
    </span>
  );
}

export default TrainerBadge;
