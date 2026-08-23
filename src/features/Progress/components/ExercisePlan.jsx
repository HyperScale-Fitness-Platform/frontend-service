import { useEffect, useState } from "react";

import progressApi from "../progressApi";

import ExercisePlanSummary from "./ExercisePlanSummary";
import ExercisePlanHistory from "./ExercisePlanHistory";

import styles from "./ExercisePlan.module.css";

/*
 * Read-only view of the customer's exercise plans.
 * Plans are created and managed by the customer's
 * personal trainer from the trainer Plans page.
 */
function ExercisePlan() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [pageError, setPageError] = useState("");

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
      </div>

      {pageError && (
        <div className={styles.errorBox}>
          {pageError}
        </div>
      )}

      <ExercisePlanSummary
        plan={latest}
        loading={loadingLatest}
      />

      <ExercisePlanHistory
        records={history}
        loading={loadingHistory}
      />
    </section>
  );
}

export default ExercisePlan;
