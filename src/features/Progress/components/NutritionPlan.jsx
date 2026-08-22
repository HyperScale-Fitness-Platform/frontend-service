import { useEffect, useState } from "react";

import progressApi from "../progressApi";

import NutritionPlanForm from "./NutritionPlanForm";
import NutritionPlanEditForm from "./NutritionPlanEditForm";
import NutritionPlanSummary from "./NutritionPlanSummary";
import NutritionPlanHistory from "./NutritionPlanHistory";

import styles from "./NutritionPlan.module.css";

function NutritionPlan() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [pageError, setPageError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const customerId = localStorage.getItem("userId");

  async function loadNutritionPlans() {
    if (!customerId) {
      setPageError(
        "Unable to identify the logged-in customer."
      );

      setLoadingLatest(false);
      setLoadingHistory(false);

      return;
    }

    setPageError("");

    setLoadingLatest(true);
    setLoadingHistory(true);

    try {
      /*
       * Latest nutrition plan
       */
      try {
        const latestResult =
          await progressApi.getLatestNutritionPlan(
            customerId
          );

        setLatest(latestResult);
      } catch (error) {
        if (error?.response?.status === 404) {
          setLatest(null);
        } else {
          console.error(
            "Failed to load latest nutrition plan:",
            error
          );

          setPageError(
            "Unable to load your nutrition plan."
          );
        }
      } finally {
        setLoadingLatest(false);
      }

      /*
       * Nutrition plan history
       */
      try {
        const historyResult =
          await progressApi.getNutritionPlanHistory(
            customerId,
            {
              page: 1,
              limit: 20,
            }
          );

        setHistory(
          Array.isArray(historyResult)
            ? historyResult
            : historyResult?.records || []
        );
      } catch (error) {
        console.error(
          "Failed to load nutrition plan history:",
          error
        );
      } finally {
        setLoadingHistory(false);
      }
    } catch (error) {
      console.error(
        "Failed to refresh nutrition plans:",
        error
      );

      setPageError(
        "Unable to refresh your nutrition plans."
      );

      setLoadingLatest(false);
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadNutritionPlans();
  }, [customerId]);

  /*
   * CREATE
   */
  function handleCreated(plan) {
    setLatest(plan);

    setHistory((previous) => {
      const withoutDuplicate = previous.filter(
        (item) => item.id !== plan.id
      );

      return [plan, ...withoutDuplicate];
    });

    setShowForm(false);
  }

  /*
   * UPDATE
   */
  function handleUpdated(updatedPlan) {
    setLatest((previous) => {
      if (previous?.id === updatedPlan.id) {
        return updatedPlan;
      }

      return previous;
    });

    setHistory((previous) =>
      previous.map((plan) =>
        plan.id === updatedPlan.id
          ? updatedPlan
          : plan
      )
    );

    setEditingPlan(null);
  }

  /*
   * DELETE
   */
  async function handleDelete(plan) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${plan.plan_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await progressApi.deleteNutritionPlan(
        plan.id
      );

      setHistory((previous) =>
        previous.filter(
          (item) => item.id !== plan.id
        )
      );

      /*
       * Reload latest because the deleted
       * plan may have been the latest one.
       */
      try {
        const latestResult =
          await progressApi.getLatestNutritionPlan(
            customerId
          );

        setLatest(latestResult);
      } catch (error) {
        if (error?.response?.status === 404) {
          setLatest(null);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error(
        "Failed to delete nutrition plan:",
        error
      );

      setPageError(
        error?.response?.data?.message ||
          "Failed to delete the nutrition plan."
      );
    }
  }

  async function handleHistoryChanged() {
    await loadNutritionPlans();
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            NUTRITION PROGRAM
          </span>

          <h2>Nutrition Plan</h2>

          <p>
            Follow your nutrition program and
            track your daily calorie and
            macronutrient targets.
          </p>
        </div>

        {!showForm && !editingPlan && (
          <button
            className={styles.primaryButton}
            onClick={() => setShowForm(true)}
          >
            + Add Nutrition Plan
          </button>
        )}
      </div>

      {pageError && (
        <div className={styles.errorBox}>
          {pageError}
        </div>
      )}

      {showForm && (
        <NutritionPlanForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPlan && (
        <NutritionPlanEditForm
          record={editingPlan}
          onCancel={() => setEditingPlan(null)}
          onUpdated={handleUpdated}
        />
      )}

      {!showForm && !editingPlan && (
        <>
          <NutritionPlanSummary
            plan={latest}
            loading={loadingLatest}
            onAddNew={() => setShowForm(true)}
            onEdit={(plan) =>
              setEditingPlan(plan)
            }
            onDelete={handleDelete}
          />

          <NutritionPlanHistory
            records={history}
            loading={loadingHistory}
            onEdit={(plan) =>
              setEditingPlan(plan)
            }
            onDelete={handleDelete}
            onChanged={handleHistoryChanged}
          />
        </>
      )}
    </section>
  );
}

export default NutritionPlan;