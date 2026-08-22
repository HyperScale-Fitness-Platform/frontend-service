import { useEffect, useState } from "react";

import progressApi from "../progressApi";

import ExercisePlanForm from "./ExercisePlanForm";
import ExercisePlanEditForm from "./ExercisePlanEditForm";
import ExercisePlanSummary from "./ExercisePlanSummary";
import ExercisePlanHistory from "./ExercisePlanHistory";

import styles from "./ExercisePlan.module.css";

function ExercisePlan() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [pageError, setPageError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const customerId = localStorage.getItem("userId");

  async function loadExercisePlans() {
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
       * Latest exercise plan
       */
      try {
        const latestResult =
          await progressApi.getLatestExercisePlan(
            customerId
          );

        setLatest(latestResult);
      } catch (error) {
        if (error?.response?.status === 404) {
          setLatest(null);
        } else {
          console.error(
            "Failed to load latest exercise plan:",
            error
          );

          setPageError(
            "Unable to load your exercise plan."
          );
        }
      } finally {
        setLoadingLatest(false);
      }

      /*
       * Exercise plan history
       */
      try {
        const historyResult =
          await progressApi.getExercisePlanHistory(
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
          "Failed to load exercise plan history:",
          error
        );
      } finally {
        setLoadingHistory(false);
      }
    } catch (error) {
      console.error(
        "Failed to refresh exercise plans:",
        error
      );

      setPageError(
        "Unable to refresh your exercise plans."
      );

      setLoadingLatest(false);
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    loadExercisePlans();
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
      `Are you sure you want to delete "${plan.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await progressApi.deleteExercisePlan(plan.id);

      setHistory((previous) =>
        previous.filter(
          (item) => item.id !== plan.id
        )
      );

      /*
       * Reload latest because the deleted plan
       * may have been the latest one.
       */
      try {
        const latestResult =
          await progressApi.getLatestExercisePlan(
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
        "Failed to delete exercise plan:",
        error
      );

      setPageError(
        error?.response?.data?.message ||
          "Failed to delete the exercise plan."
      );
    }
  }

  async function handleHistoryChanged() {
    await loadExercisePlans();
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            WORKOUT PROGRAM
          </span>

          <h2>Exercise Plan</h2>

          <p>
            Follow your workout program and track
            the exercises included in your plan.
          </p>
        </div>

        {!showForm && !editingPlan && (
          <button
            className={styles.primaryButton}
            onClick={() => setShowForm(true)}
          >
            + Add Exercise Plan
          </button>
        )}
      </div>

      {pageError && (
        <div className={styles.errorBox}>
          {pageError}
        </div>
      )}

      {showForm && (
        <ExercisePlanForm
          onCreated={handleCreated}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPlan && (
        <ExercisePlanEditForm
          record={editingPlan}
          onCancel={() => setEditingPlan(null)}
          onUpdated={handleUpdated}
        />
      )}

      {!showForm && !editingPlan && (
        <>
          <ExercisePlanSummary
            plan={latest}
            loading={loadingLatest}
            onAddNew={() => setShowForm(true)}
            onEdit={(plan) => setEditingPlan(plan)}
            onDelete={handleDelete}
          />

          <ExercisePlanHistory
            records={history}
            loading={loadingHistory}
            onEdit={(plan) => setEditingPlan(plan)}
            onDelete={handleDelete}
            onChanged={handleHistoryChanged}
          />
        </>
      )}
    </section>
  );
}

export default ExercisePlan;