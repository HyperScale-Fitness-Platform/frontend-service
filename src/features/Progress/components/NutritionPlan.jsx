import { useEffect, useState } from "react";

import progressApi from "../progressApi";

import NutritionPlanSummary from "./NutritionPlanSummary";
import NutritionPlanHistory from "./NutritionPlanHistory";

import styles from "./NutritionPlan.module.css";

/*
 * Read-only view of the customer's nutrition plans.
 * Plans are created and managed by the customer's
 * personal trainer from the trainer Plans page.
 */
function NutritionPlan() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);

  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [pageError, setPageError] = useState("");

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
      </div>

      {pageError && (
        <div className={styles.errorBox}>
          {pageError}
        </div>
      )}

      <NutritionPlanSummary
        plan={latest}
        loading={loadingLatest}
      />

      <NutritionPlanHistory
        records={history}
        loading={loadingHistory}
      />
    </section>
  );
}

export default NutritionPlan;
