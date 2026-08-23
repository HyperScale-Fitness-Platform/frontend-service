import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import progressApi from "../Progress/progressApi";
import { getTrainerCustomers } from "./trainerPlansApi";

import ExercisePlanForm from "../Progress/components/ExercisePlanForm";
import ExercisePlanEditForm from "../Progress/components/ExercisePlanEditForm";
import ExercisePlanSummary from "../Progress/components/ExercisePlanSummary";
import ExercisePlanHistory from "../Progress/components/ExercisePlanHistory";
import NutritionPlanForm from "../Progress/components/NutritionPlanForm";
import NutritionPlanEditForm from "../Progress/components/NutritionPlanEditForm";
import NutritionPlanSummary from "../Progress/components/NutritionPlanSummary";
import NutritionPlanHistory from "../Progress/components/NutritionPlanHistory";

import styles from "./TrainerPlans.module.css";

function TrainerPlans() {
    const trainerId = localStorage.getItem("userId");

    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [loadingCustomers, setLoadingCustomers] = useState(true);

    const [exercisePlans, setExercisePlans] = useState({ latest: null, history: [] });
    const [nutritionPlans, setNutritionPlans] = useState({ latest: null, history: [] });

    const [loadingPlans, setLoadingPlans] = useState(false);

    const [creatingExercise, setCreatingExercise] = useState(false);
    const [editingExercisePlan, setEditingExercisePlan] = useState(null);

    const [creatingNutrition, setCreatingNutrition] = useState(false);
    const [editingNutritionPlan, setEditingNutritionPlan] = useState(null);

    useEffect(() => {
        async function loadCustomers() {
            if (!trainerId) {
                toast.error("Unable to identify the logged-in trainer.");
                setLoadingCustomers(false);
                return;
            }

            try {
                const data = await getTrainerCustomers(trainerId);

                setCustomers(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error("Failed to load PT customers:", error);
                toast.error(
                    error?.response?.data?.message ||
                        "Failed to load your customers."
                );
            } finally {
                setLoadingCustomers(false);
            }
        }

        loadCustomers();
    }, [trainerId]);

    useEffect(() => {
        if (!selectedCustomer) {
            return;
        }

        resetPlanEditors();

        loadCustomerPlans(selectedCustomer.customerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCustomer?.customerId]);

    function resetPlanEditors() {
        setCreatingExercise(false);
        setEditingExercisePlan(null);
        setCreatingNutrition(false);
        setEditingNutritionPlan(null);
    }

    async function loadCustomerPlans(customerId) {
        setLoadingPlans(true);

        const [latestExercise, latestNutrition, exerciseHistory, nutritionHistory] =
            await Promise.allSettled([
                progressApi.getLatestExercisePlan(customerId),
                progressApi.getLatestNutritionPlan(customerId),
                progressApi.getExercisePlanHistory(customerId, { page: 1, limit: 20 }),
                progressApi.getNutritionPlanHistory(customerId, { page: 1, limit: 20 }),
            ]);

        setExercisePlans({
            latest: latestExercise?.status === "fulfilled" ? latestExercise.value : null,
            history:
                exerciseHistory?.status === "fulfilled"
                    ? Array.isArray(exerciseHistory.value)
                        ? exerciseHistory.value
                        : exerciseHistory.value?.records || []
                    : [],
        });

        setNutritionPlans({
            latest: latestNutrition?.status === "fulfilled" ? latestNutrition.value : null,
            history:
                nutritionHistory?.status === "fulfilled"
                    ? Array.isArray(nutritionHistory.value)
                        ? nutritionHistory.value
                        : nutritionHistory.value?.records || []
                    : [],
        });

        setLoadingPlans(false);
    }

    function handleBackToList() {
        setSelectedCustomer(null);
    }

    /*
     * EXERCISE PLAN handlers
     */
    function handleExerciseCreated(plan) {
        setExercisePlans((previous) => ({
            latest: plan,
            history: [plan, ...previous.history],
        }));

        setCreatingExercise(false);
        toast.success("Exercise plan created for your customer.");
    }

    function handleExerciseUpdated(updatedPlan) {
        setExercisePlans((previous) => ({
            latest: previous.latest?.id === updatedPlan.id ? updatedPlan : previous.latest,
            history: previous.history.map((plan) =>
                plan.id === updatedPlan.id ? updatedPlan : plan
            ),
        }));

        setEditingExercisePlan(null);
        toast.success("Exercise plan updated.");
    }

    async function handleExerciseDelete(plan) {
        const confirmed = window.confirm(
            `Delete the exercise plan "${plan.plan_name}"?`
        );

        if (!confirmed) return;

        try {
            await progressApi.deleteExercisePlan(plan.id);

            setExercisePlans((previous) => {
                const history = previous.history.filter(
                    (item) => item.id !== plan.id
                );

                return {
                    history,
                    latest:
                        previous.latest?.id === plan.id
                            ? history[0] || null
                            : previous.latest,
                };
            });

            toast.success("Exercise plan deleted.");
        } catch (error) {
            console.error("Failed to delete exercise plan:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Failed to delete the exercise plan."
            );
        }
    }

    /*
     * NUTRITION PLAN handlers
     */
    function handleNutritionCreated(plan) {
        setNutritionPlans((previous) => ({
            latest: plan,
            history: [plan, ...previous.history],
        }));

        setCreatingNutrition(false);
        toast.success("Nutrition plan created for your customer.");
    }

    function handleNutritionUpdated(updatedPlan) {
        setNutritionPlans((previous) => ({
            latest: previous.latest?.id === updatedPlan.id ? updatedPlan : previous.latest,
            history: previous.history.map((plan) =>
                plan.id === updatedPlan.id ? updatedPlan : plan
            ),
        }));

        setEditingNutritionPlan(null);
        toast.success("Nutrition plan updated.");
    }

    async function handleNutritionDelete(plan) {
        const confirmed = window.confirm(
            `Delete the nutrition plan "${plan.plan_name}"?`
        );

        if (!confirmed) return;

        try {
            await progressApi.deleteNutritionPlan(plan.id);

            setNutritionPlans((previous) => {
                const history = previous.history.filter(
                    (item) => item.id !== plan.id
                );

                return {
                    history,
                    latest:
                        previous.latest?.id === plan.id
                            ? history[0] || null
                            : previous.latest,
                };
            });

            toast.success("Nutrition plan deleted.");
        } catch (error) {
            console.error("Failed to delete nutrition plan:", error);
            toast.error(
                error?.response?.data?.message ||
                    "Failed to delete the nutrition plan."
            );
        }
    }

    if (loadingCustomers) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.status}>Loading your customers...</div>
                </div>
            </div>
        );
    }

    /*
     * CUSTOMER DETAIL VIEW
     */
    if (selectedCustomer) {
        return (
            <div className={styles.page}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <button
                            type="button"
                            className={styles.backButton}
                            onClick={handleBackToList}
                        >
                            ← All Customers
                        </button>

                        <p className={styles.eyebrow}>CUSTOMER PLANS</p>

                        <h1 className={styles.title}>{selectedCustomer.fullName}</h1>

                        <p className={styles.subtitle}>
                            {selectedCustomer.source === "membership"
                                ? "Membership PT session customer"
                                : `${selectedCustomer.packageType} session package · ${selectedCustomer.sessionsUsed}/${selectedCustomer.sessionsTotal} used · ${selectedCustomer.status}`}
                        </p>
                    </header>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <span className={styles.sectionEyebrow}>WORKOUT PROGRAM</span>
                                <h2>Exercise Plan</h2>
                            </div>

                            {!creatingExercise && !editingExercisePlan && (
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => {
                                        resetPlanEditors();
                                        setCreatingExercise(true);
                                    }}
                                >
                                    + Create Exercise Plan
                                </button>
                            )}
                        </div>

                        {creatingExercise && (
                            <ExercisePlanForm
                                targetCustomerId={selectedCustomer.customerId}
                                onCreated={handleExerciseCreated}
                                onCancel={() => setCreatingExercise(false)}
                            />
                        )}

                        {editingExercisePlan && (
                            <ExercisePlanEditForm
                                record={editingExercisePlan}
                                onUpdated={handleExerciseUpdated}
                                onCancel={() => setEditingExercisePlan(null)}
                            />
                        )}

                        {!creatingExercise && !editingExercisePlan && (
                            <>
                                <ExercisePlanSummary
                                    plan={exercisePlans.latest}
                                    loading={loadingPlans}
                                    onEdit={(plan) => {
                                        resetPlanEditors();
                                        setEditingExercisePlan(plan);
                                    }}
                                    onDelete={handleExerciseDelete}
                                />

                                <ExercisePlanHistory
                                    records={exercisePlans.history}
                                    loading={loadingPlans}
                                    onEdit={(plan) => {
                                        resetPlanEditors();
                                        setEditingExercisePlan(plan);
                                    }}
                                    onDelete={handleExerciseDelete}
                                />
                            </>
                        )}
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <span className={styles.sectionEyebrow}>NUTRITION PROGRAM</span>
                                <h2>Nutrition Plan</h2>
                            </div>

                            {!creatingNutrition && !editingNutritionPlan && (
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    onClick={() => {
                                        resetPlanEditors();
                                        setCreatingNutrition(true);
                                    }}
                                >
                                    + Create Nutrition Plan
                                </button>
                            )}
                        </div>

                        {creatingNutrition && (
                            <NutritionPlanForm
                                targetCustomerId={selectedCustomer.customerId}
                                onCreated={handleNutritionCreated}
                                onCancel={() => setCreatingNutrition(false)}
                            />
                        )}

                        {editingNutritionPlan && (
                            <NutritionPlanEditForm
                                record={editingNutritionPlan}
                                onUpdated={handleNutritionUpdated}
                                onCancel={() => setEditingNutritionPlan(null)}
                            />
                        )}

                        {!creatingNutrition && !editingNutritionPlan && (
                            <>
                                <NutritionPlanSummary
                                    plan={nutritionPlans.latest}
                                    loading={loadingPlans}
                                    onEdit={(plan) => {
                                        resetPlanEditors();
                                        setEditingNutritionPlan(plan);
                                    }}
                                    onDelete={handleNutritionDelete}
                                />

                                <NutritionPlanHistory
                                    records={nutritionPlans.history}
                                    loading={loadingPlans}
                                    onEdit={(plan) => {
                                        resetPlanEditors();
                                        setEditingNutritionPlan(plan);
                                    }}
                                    onDelete={handleNutritionDelete}
                                />
                            </>
                        )}
                    </section>
                </div>
            </div>
        );
    }

    /*
     * CUSTOMER LIST VIEW
     */
    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <p className={styles.eyebrow}>PERSONAL TRAINING</p>

                    <h1 className={styles.title}>Plans</h1>

                    <p className={styles.subtitle}>
                        Select a customer to build their exercise and
                        nutrition plans.
                    </p>
                </header>

                {customers.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>No PT customers yet</h3>

                        <p>
                            Customers who purchase a PT package with you
                            will appear here.
                        </p>
                    </div>
                ) : (
                    <div className={styles.customerList}>
                        {customers.map((customer) => (
                            <button
                                key={customer.customerId}
                                type="button"
                                className={styles.customerCard}
                                onClick={() => {
                                    resetPlanEditors();
                                    setSelectedCustomer(customer);
                                }}
                            >
                                <div className={styles.profile}>
                                    <span className={styles.avatarPlaceholder}>
                                        {customer.fullName?.charAt(0)?.toUpperCase() || "?"}
                                    </span>

                                    <div className={styles.profileInfo}>
                                        <h3>{customer.fullName}</h3>

                                        {customer.source === "membership" ? (
                                            <span>
                                                Membership PT Session
                                            </span>
                                        ) : (
                                            <span>
                                                {customer.packageType} sessions ·{" "}
                                                {customer.sessionsUsed}/
                                                {customer.sessionsTotal} used
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <span className={`${styles.statusPill} ${customer.status === "ACTIVE" ? styles.statusActive : ""}`}>
                                    {customer.status}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default TrainerPlans;
