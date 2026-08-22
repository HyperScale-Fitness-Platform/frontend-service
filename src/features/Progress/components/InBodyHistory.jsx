import { useState } from "react";
import progressApi from "../progressApi";
import InBodyEditForm from "./InBodyEditForm";
import styles from "./InBodyHistory.module.css";

function InBodyHistory({
    records = [],
    loading,
    onSelect,
    onChanged,
}) {
    const [editingRecord, setEditingRecord] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [actionError, setActionError] =
        useState("");

    async function handleDelete(record) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this InBody result?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(record.id);
            setActionError("");

            /*
             * Delete from backend
             */
            await progressApi.deleteInBody(
                record.id
            );

            /*
             * Refresh parent.
             *
             * Progress.jsx will reload BOTH:
             * - latest
             * - history
             */
            if (onChanged) {
                await onChanged();
            }
        } catch (error) {
            console.error(
                "Failed to delete InBody:",
                error
            );

            setActionError(
                error?.response?.data?.message ||
                    "Failed to delete the InBody result."
            );
        } finally {
            setDeletingId(null);
        }
    }

    async function handleUpdated(updatedRecord) {
        /*
         * Close edit form immediately
         */
        setEditingRecord(null);

        setActionError("");

        /*
         * Refresh parent.
         *
         * This updates both the table and
         * the InBody summary at the top.
         */
        if (onChanged) {
            await onChanged();
        }
    }

    /*
     * Show edit form
     */
    if (editingRecord) {
        return (
            <InBodyEditForm
                record={editingRecord}
                onCancel={() => {
                    setEditingRecord(null);
                    setActionError("");
                }}
                onUpdated={handleUpdated}
            />
        );
    }

    if (loading) {
        return (
            <section className={styles.card}>
                <div className={styles.loading}>
                    Loading InBody history...
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

                    <h2>
                        Previous InBody Results
                    </h2>
                </div>

                <span className={styles.count}>
                    {records.length}{" "}
                    {records.length === 1
                        ? "result"
                        : "results"}
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
                        Your previous InBody results
                        will appear here.
                    </p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Weight</th>
                                <th>Body Fat</th>
                                <th>Muscle</th>
                                <th>BMI</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map(
                                (record) => (
                                    <tr
                                        key={
                                            record.id
                                        }
                                    >
                                        <td>
                                            {formatDate(
                                                record.test_date
                                            )}
                                        </td>

                                        <td>
                                            <strong>
                                                {
                                                    record.weight_kg
                                                }
                                            </strong>{" "}
                                            kg
                                        </td>

                                        <td>
                                            {
                                                record.body_fat_pct
                                            }
                                            %
                                        </td>

                                        <td>
                                            {
                                                record.skeletal_muscle_mass_kg
                                            }{" "}
                                            kg
                                        </td>

                                        <td>
                                            {
                                                record.bmi
                                            }
                                        </td>

                                        <td>
                                            {record.inbody_score ??
                                                "—"}
                                        </td>

                                        <td>
                                            <div
                                                className={
                                                    styles.actions
                                                }
                                            >
                                                {onSelect && (
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.viewButton
                                                        }
                                                        onClick={() =>
                                                            onSelect(
                                                                record
                                                            )
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className={
                                                        styles.editButton
                                                    }
                                                    onClick={() => {
                                                        setActionError(
                                                            ""
                                                        );

                                                        setEditingRecord(
                                                            record
                                                        );
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
                                                        handleDelete(
                                                            record
                                                        )
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
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function formatDate(value) {
    if (!value) return "—";

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

export default InBodyHistory;