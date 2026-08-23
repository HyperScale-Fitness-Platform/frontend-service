import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import toast from "react-hot-toast";

import {
    sendPlanCoachMessage,
    getPlanCoachHistory,
} from "../AI/aiApi";
import progressApi from "../Progress/progressApi";
import {
    getCurrentMembership,
} from "../Membership/membershipApi";
import { getCustomerPackages } from "../PTPackages/ptPackagesApi";

import RichText from "./RichText";

import styles from "./AIPlans.module.css";

function RobotAvatar() {
    return <span className={styles.robot}>AI</span>;
}

export default function AIPlans() {

    const [messages, setMessages] = useState([]);

    const [sessionId, setSessionId] = useState(null);

    const [input, setInput] = useState("");

    const [loading, setLoading] = useState(false);

    const [historyLoading, setHistoryLoading] = useState(true);

    const [adoptingIndex, setAdoptingIndex] = useState(null);

    const [hasTrainerRelation, setHasTrainerRelation] =
        useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        async function loadHistory() {
            try {
                const data = await getPlanCoachHistory();

                setSessionId(data.sessionId || null);
                setMessages(
                    Array.isArray(data.messages)
                        ? data.messages.map((m) => ({
                              role: m.role,
                              content: m.content,
                          }))
                        : []
                );
            } catch (error) {
                console.error(
                    "Failed to load AI plans history:",
                    error
                );
            } finally {
                setHistoryLoading(false);
            }
        }

        loadHistory();
    }, []);

    /*
     * Soft notice for customers who already have a trainer
     * relationship (membership or PT package).
     */
    useEffect(() => {
        async function checkTrainerRelation() {
            const customerId =
                localStorage.getItem("userId");

            if (!customerId) return;

            try {
                const membership =
                    await getCurrentMembership().catch(
                        () => null
                    );

                if (
                    membership &&
                    ["ACTIVE", "FROZEN"].includes(
                        membership.status
                    )
                ) {
                    setHasTrainerRelation(true);
                    return;
                }

                const packages =
                    await getCustomerPackages(customerId);

                const usable = (
                    Array.isArray(packages)
                        ? packages
                        : []
                ).some((pkg) =>
                    ["ACTIVE", "EXHAUSTED"].includes(
                        pkg.status
                    )
                );

                setHasTrainerRelation(usable);
            } catch {
                // Notice is best-effort only.
            }
        }

        checkTrainerRelation();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    function updateMessage(index, patch) {
        setMessages((previous) =>
            previous.map((message, i) =>
                i === index
                    ? { ...message, ...patch }
                    : message
            )
        );
    }

    async function handleSend(event) {
        event.preventDefault();

        const text = input.trim();

        if (!text || loading) return;

        setInput("");

        const userMessage = {
            role: "user",
            content: text,
        };

        setMessages((previous) => [
            ...previous,
            userMessage,
        ]);

        setLoading(true);

        try {
            const data = await sendPlanCoachMessage({
                message: text,
                sessionId,
            });

            setSessionId(data.sessionId || sessionId);

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: data.reply,
                    draft: data.draft || null,
                    draftStatus: data.draft
                        ? "pending"
                        : undefined,
                },
            ]);
        } catch (error) {
            console.error(
                "AI plans coach failed:",
                error?.response?.data || error
            );

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: "Sorry, I could not process your request. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend(event);
        }
    }

    async function handleAdopt(index) {
        const message = messages[index];

        if (!message?.draft) return;

        const customerId =
            localStorage.getItem("userId");

        if (!customerId) {
            toast.error("Please log in again.");
            return;
        }

        setAdoptingIndex(index);

        try {
            if (message.draft.exercisePlan) {
                await progressApi.createExercisePlan({
                    ...message.draft.exercisePlan,
                    source: "ai",
                });
            }

            if (message.draft.nutritionPlan) {
                await progressApi.createNutritionPlan({
                    ...message.draft.nutritionPlan,
                    generated_by: "ai",
                });
            }

            updateMessage(index, {
                draftStatus: "adopted",
            });

            toast.success(
                "Plans added to your Progress page!"
            );
        } catch (error) {
            console.error(
                "Failed to adopt AI plans:",
                error?.response?.data || error
            );

            toast.error(
                error?.response?.data?.message ||
                    "Could not add the plans. Try again."
            );
        } finally {
            setAdoptingIndex(null);
        }
    }

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        <span className={styles.robotLarge}>
                            AI
                        </span>

                        <div>
                            <p className={styles.eyebrow}>
                                PERSONAL COACH
                            </p>

                            <h1>AI Plans</h1>

                            <p className={styles.subtitle}>
                                Chat with your AI coach to build your
                                exercise and nutrition plans.
                            </p>
                        </div>
                    </div>

                    {hasTrainerRelation && (
                        <div className={styles.notice}>
                            You have an active trainer relationship — their
                            plans take priority. You can still experiment
                            here.
                        </div>
                    )}
                </header>

                <div className={styles.chatCard}>
                    <div className={styles.messages}>
                        {!historyLoading &&
                            messages.length === 0 && (
                                <div className={styles.welcome}>
                                    <h3>
                                        Hi! I'm your AI plans coach 💪
                                    </h3>

                                    <p>
                                        Tell me your goal — or just say
                                        "build me a plan". If you already have
                                        plans, I'll improve them based on your
                                        history.
                                    </p>
                                </div>
                            )}

                        {historyLoading && (
                            <div className={styles.welcome}>
                                <p>Loading conversation...</p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div key={index}>
                                <div
                                    className={`${styles.messageRow} ${
                                        msg.role === "user"
                                            ? styles.mine
                                            : ""
                                    }`}
                                >
                                    {msg.role !== "user" && (
                                        <RobotAvatar />
                                    )}

                                    <div
                                        className={`${styles.bubble} ${
                                            msg.role === "user"
                                                ? styles.userBubble
                                                : styles.aiBubble
                                        }`}
                                    >
                                        {msg.role === "assistant" ? (
                                            <RichText
                                                text={msg.content}
                                            />
                                        ) : (
                                            msg.content
                                        )}
                                    </div>
                                </div>

                                {msg.draft &&
                                    msg.draftStatus ===
                                        "pending" && (
                                        <DraftCard
                                            draft={msg.draft}
                                            busy={
                                                adoptingIndex ===
                                                index
                                            }
                                            onAdopt={() =>
                                                handleAdopt(index)
                                            }
                                            onDiscard={() =>
                                                updateMessage(
                                                    index,
                                                    {
                                                        draftStatus:
                                                            "discarded",
                                                    }
                                                )
                                            }
                                        />
                                    )}

                                {msg.draftStatus ===
                                    "adopted" && (
                                    <div
                                        className={`${styles.adoptedChip} ${styles.messageRow}`}
                                    >
                                        ✓ Added to your Progress page
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className={styles.messageRow}>
                                <RobotAvatar />

                                <div
                                    className={`${styles.bubble} ${styles.aiBubble}`}
                                >
                                    Thinking…
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        className={styles.inputArea}
                        onSubmit={handleSend}
                    >
                        <textarea
                            value={input}
                            onChange={(event) =>
                                setInput(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask your AI coach..."
                            rows={1}
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                    </form>
                </div>

                <Link
                    to="/progress"
                    className={styles.progressLink}
                >
                    View my saved plans →
                </Link>
            </div>
        </main>
    );
}

function DraftCard({ draft, busy, onAdopt, onDiscard }) {
    const exercise = draft.exercisePlan;

    const nutrition = draft.nutritionPlan;

    return (
        <div className={styles.draftCard}>
            <h4>Your new plans are ready 🎉</h4>

            {exercise && (
                <div className={styles.draftSection}>
                    <strong>{exercise.plan_name}</strong>

                    <ul>
                        {(exercise.exercises || []).map(
                            (ex, i) => (
                                <li key={i}>
                                    {ex.exercise_name} —{" "}
                                    {ex.sets}×{ex.reps}
                                    {ex.weight_kg
                                        ? ` @ ${ex.weight_kg}kg`
                                        : ""}
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}

            {nutrition && (
                <div className={styles.draftSection}>
                    <strong>{nutrition.plan_name}</strong>

                    <p className={styles.draftMeta}>
                        {nutrition.daily_calorie_target} kcal/day ·{" "}
                        P {nutrition.daily_protein_target_g}g · C{" "}
                        {nutrition.daily_carbohydrate_target_g}g · F{" "}
                        {nutrition.daily_fat_target_g}g
                    </p>

                    <ul>
                        {(nutrition.meals || []).map((meal, i) => (
                            <li key={i}>
                                {meal.meal_name}:{" "}
                                {(meal.foods || []).join(", ")}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <p className={styles.draftHint}>
                Add these to your Progress page?
            </p>

            <div className={styles.draftActions}>
                <button
                    type="button"
                    className={styles.adoptButton}
                    onClick={onAdopt}
                    disabled={busy}
                >
                    {busy ? "Adding..." : "Add to my plans"}
                </button>

                <button
                    type="button"
                    className={styles.discardButton}
                    onClick={onDiscard}
                    disabled={busy}
                >
                    Discard
                </button>
            </div>
        </div>
    );
}
