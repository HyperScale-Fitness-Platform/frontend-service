import { useEffect, useState } from "react";

import progressApi from "./progressApi";

import InBodyForm from "./components/InBodyForm";
import InBodySummary from "./components/InBodySummary";
import InBodyHistory from "./components/InBodyHistory";
import ExercisePlan from "./components/ExercisePlan";
import NutritionPlan from "./components/NutritionPlan";

import styles from "./Progress.module.css";

function Progress() {
    const [latest, setLatest] = useState(null);
    const [history, setHistory] = useState([]);

    const [loadingLatest, setLoadingLatest] =
        useState(true);

    const [loadingHistory, setLoadingHistory] =
        useState(true);

    const [pageError, setPageError] = useState("");

    const [showForm, setShowForm] = useState(false);

    const customerId =
        localStorage.getItem("userId");

    /**
     * Load the latest InBody record and history.
     *
     * This is the single refresh function used by:
     * - initial page load
     * - create
     * - update
     * - delete
     */
    async function loadProgress() {
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
             * Load latest InBody
             */
            try {
                const latestResult =
                    await progressApi.getLatestInBody(
                        customerId
                    );

                setLatest(latestResult);
            } catch (error) {
                if (
                    error?.response?.status === 404
                ) {
                    // Customer has no InBody records
                    setLatest(null);
                } else {
                    console.error(
                        "Failed to load latest InBody:",
                        error
                    );

                    setPageError(
                        "Unable to load your InBody information."
                    );
                }
            } finally {
                setLoadingLatest(false);
            }

            /*
             * Load history
             */
            try {
                const historyResult =
                    await progressApi.getInBodyHistory(
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
                    "Failed to load InBody history:",
                    error
                );
            } finally {
                setLoadingHistory(false);
            }
        } catch (error) {
            console.error(
                "Failed to refresh progress:",
                error
            );

            setPageError(
                "Unable to refresh your progress information."
            );

            setLoadingLatest(false);
            setLoadingHistory(false);
        }
    }

    /*
     * Initial load
     */
    useEffect(() => {
        loadProgress();
    }, [customerId]);

    /*
     * Called after creating a new InBody record.
     *
     * We update the UI immediately instead of waiting
     * for another request.
     */
    function handleCreated(record) {
        setLatest(record);

        setHistory((previous) => {
            const withoutDuplicate =
                previous.filter(
                    (item) => item.id !== record.id
                );

            return [
                record,
                ...withoutDuplicate,
            ];
        });

        setShowForm(false);
    }

    /*
     * Called when the user clicks "View".
     */
    function handleSelect(record) {
        setLatest(record);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    /*
     * Called after editing or deleting an InBody.
     *
     * We reload both:
     * - latest
     * - history
     *
     * This is important because the edited/deleted
     * record may also be the latest record.
     */
    async function handleHistoryChanged() {
        await loadProgress();
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.pageHeader}>
                    <div>
                        <span className={styles.eyebrow}>
                            MY FITNESS JOURNEY
                        </span>

                        <h1>Progress</h1>

                        <p>
                            Track your body composition and
                            monitor your fitness progress over time.
                        </p>
                    </div>

                    {!showForm && (
                        <button
                            className={styles.primaryButton}
                            onClick={() =>
                                setShowForm(true)
                            }
                        >
                            + Add InBody
                        </button>
                    )}
                </header>

                {pageError && (
                    <div className={styles.errorBox}>
                        {pageError}
                    </div>
                )}

                {showForm && (
                    <div className={styles.formSection}>
                        <div className={styles.formTop}>
                            <button
                                className={styles.backButton}
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                ← Back to Progress
                            </button>
                        </div>

                        <InBodyForm
                            onCreated={handleCreated}
                        />
                    </div>
                )}

                {!showForm && (
                    <>
                        <section
                            className={styles.overview}
                        >
                            <InBodySummary
                                record={latest}
                                loading={loadingLatest}
                                onAddNew={() =>
                                    setShowForm(true)
                                }
                            />
                        </section>

                        <section
                            className={styles.history}
                        >
                            <InBodyHistory
                                records={history}
                                loading={loadingHistory}
                                onSelect={handleSelect}
                                onChanged={
                                    handleHistoryChanged
                                }
                            />
                        </section>
                        <section className={styles.exercisePlan}>
                            <ExercisePlan />
                        </section>
                        <section className={styles.nutritionPlan}>
                            <NutritionPlan />
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}

export default Progress;