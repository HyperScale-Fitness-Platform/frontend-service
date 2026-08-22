import { useState } from "react";

import progressApi from "../progressApi";

import styles from "./NutritionPlanHistory.module.css";

function NutritionPlanHistory({
  records = [],
  loading,
  onEdit,
  onDelete,
  onChanged,
}) {
  const [deletingId, setDeletingId] =
    useState(null);

  const [actionError, setActionError] =
    useState("");

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.plan_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(record.id);
      setActionError("");

      await progressApi.deleteNutritionPlan(
        record.id
      );

      if (onChanged) {
        await onChanged();
      }
    } catch (error) {
      console.error(
        "Failed to delete nutrition plan:",
        error
      );

      setActionError(
        error?.response?.data?.message ||
          "Failed to delete the nutrition plan."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.loading}>
          Loading nutrition plan history...
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            HISTORY
          </span>

          <h2>Previous Nutrition Plans</h2>
        </div>

        <span className={styles.count}>
          {records.length}{" "}
          {records.length === 1
            ? "plan"
            : "plans"}
        </span>
      </div>

      {actionError && (
        <div className={styles.errorBox}>
          {actionError}
        </div>
      )}

      {records.length === 0 ? (
        <div className={styles.empty}>
          <p>
            Your previous nutrition plans
            will appear here.
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {records.map((record) => (
            <div
              className={styles.plan}
              key={record.id}
            >
              <div className={styles.planInfo}>
                <h3>
                  {record.plan_name}
                </h3>

                <p>
                  {formatDate(
                    record.start_date
                  )}

                  {record.end_date
                    ? ` → ${formatDate(
                        record.end_date
                      )}`
                    : ""}
                </p>

                <div
                  className={
                    styles.details
                  }
                >
                  <span>
                    {formatGoal(
                      record.goal
                    )}
                  </span>

                  <span>
                    {
                      record.meals
                        ?.length || 0
                    }{" "}
                    meals
                  </span>

                  <span>
                    {
                      record.daily_calorie_target
                    }{" "}
                    kcal/day
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={
                    styles.editButton
                  }
                  onClick={() => {
                    setActionError("");

                    if (onEdit) {
                      onEdit(record);
                    }
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className={
                    styles.deleteButton
                  }
                  onClick={() =>
                    handleDelete(record)
                  }
                  disabled={
                    deletingId ===
                    record.id
                  }
                >
                  {deletingId ===
                  record.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatGoal(goal) {
  const labels = {
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain",
    maintenance: "Maintenance",
    recomposition: "Recomposition",
  };

  return labels[goal] || goal;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default NutritionPlanHistory;