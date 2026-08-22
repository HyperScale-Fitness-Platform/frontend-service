import { useEffect, useState } from "react";

import progressApi from "../progressApi";

import styles from "./ExercisePlanEditForm.module.css";

function ExercisePlanEditForm({
    record,
    onUpdated,
    onCancel,
}) {
    const [form, setForm] = useState({
        plan_name: "",
        start_date: "",
        end_date: "",
        notes: "",
    });

    const [exercises, setExercises] = useState([]);

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        if (!record) {
            return;
        }

        setForm({
            plan_name: record.plan_name || "",

            start_date: record.start_date
                ? formatInputDate(record.start_date)
                : "",

            end_date: record.end_date
                ? formatInputDate(record.end_date)
                : "",

            notes: record.notes || "",
        });

        setExercises(
            (record.exercises || []).map(
                (exercise) => ({
                    _id: exercise._id,

                    exercise_name:
                        exercise.exercise_name || "",

                    machine_name:
                        exercise.machine_name || "",

                    weight_kg:
                        exercise.weight_kg ?? "",

                    sets:
                        exercise.sets ?? 3,

                    reps:
                        exercise.reps ?? 10,

                    notes:
                        exercise.notes || "",
                })
            )
        );

        setErrors({});
        setSubmitError("");
    }, [record]);

    function handleFormChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setSubmitError("");
    }

    function handleExerciseChange(
        index,
        field,
        value
    ) {
        setExercises((previous) =>
            previous.map(
                (exercise, exerciseIndex) =>
                    exerciseIndex === index
                        ? {
                            ...exercise,
                            [field]: value,
                        }
                        : exercise
            )
        );

        setErrors((previous) => ({
            ...previous,
            [`exercise_${index}_${field}`]:
                "",
        }));

        setSubmitError("");
    }

    function addExercise() {
        setExercises((previous) => [
            ...previous,
            {
                exercise_name: "",
                machine_name: "",
                weight_kg: "",
                sets: 3,
                reps: 10,
                notes: "",
            },
        ]);
    }

    function removeExercise(index) {
        if (exercises.length === 1) {
            return;
        }

        setExercises((previous) =>
            previous.filter(
                (_, exerciseIndex) =>
                    exerciseIndex !== index
            )
        );
    }

    function validate() {
        const newErrors = {};

        if (!form.plan_name.trim()) {
            newErrors.plan_name =
                "Plan name is required";
        }

        if (!form.start_date) {
            newErrors.start_date =
                "Start date is required";
        }

        if (
            form.end_date &&
            form.start_date &&
            new Date(form.end_date) <
            new Date(form.start_date)
        ) {
            newErrors.end_date =
                "End date cannot be before start date";
        }

        if (form.notes.length > 500) {
            newErrors.notes =
                "Plan notes cannot exceed 500 characters";
        }

        if (exercises.length === 0) {
            newErrors.exercises =
                "At least one exercise is required";
        }

        exercises.forEach((exercise, index) => {
            if (!exercise.exercise_name.trim()) {
                newErrors[
                    `exercise_${index}_exercise_name`
                ] = "Exercise name is required";
            }

            if (!exercise.machine_name.trim()) {
                newErrors[
                    `exercise_${index}_machine_name`
                ] = "Machine name is required";
            }

            const weight = Number(
                exercise.weight_kg
            );

            if (
                exercise.weight_kg === "" ||
                !Number.isFinite(weight) ||
                weight < 0 ||
                weight > 1000
            ) {
                newErrors[
                    `exercise_${index}_weight_kg`
                ] =
                    "Weight must be between 0 and 1000";
            }

            const sets = Number(exercise.sets);

            if (
                !Number.isInteger(sets) ||
                sets < 1 ||
                sets > 20
            ) {
                newErrors[
                    `exercise_${index}_sets`
                ] =
                    "Sets must be between 1 and 20";
            }

            const reps = Number(exercise.reps);

            if (
                !Number.isInteger(reps) ||
                reps < 1 ||
                reps > 100
            ) {
                newErrors[
                    `exercise_${index}_reps`
                ] =
                    "Reps must be between 1 and 100";
            }

            if (
                exercise.notes &&
                exercise.notes.length > 500
            ) {
                newErrors[
                    `exercise_${index}_notes`
                ] =
                    "Notes cannot exceed 500 characters";
            }
        });

        return newErrors;
    }

    function buildPayload() {
        return {
            plan_name: form.plan_name.trim(),

            start_date: form.start_date,

            end_date: form.end_date || null,

            notes: form.notes.trim(),

            exercises: exercises.map((exercise) => ({
                exercise_name: exercise.exercise_name.trim(),

                machine_name: exercise.machine_name.trim(),

                weight_kg: Number(exercise.weight_kg),

                sets: Number(exercise.sets),

                reps: Number(exercise.reps),

                ...(exercise.notes.trim()
                    ? {
                        notes: exercise.notes.trim(),
                    }
                    : {}),
            })),
        };
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSubmitError("");

        const validationErrors =
            validate();

        if (
            Object.keys(validationErrors)
                .length > 0
        ) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const updated =
                await progressApi.updateExercisePlan(
                    record.id,
                    buildPayload()
                );

            if (onUpdated) {
                onUpdated(updated);
            }
        } catch (error) {
            console.error(
                "Failed to update exercise plan:",
                error
            );

            if (
                error?.response?.data?.errors
            ) {
                setErrors(
                    error.response.data.errors
                );
            }

            setSubmitError(
                error?.response?.data?.message ||
                "Failed to update the exercise plan."
            );
        } finally {
            setLoading(false);
        }
    }

    if (!record) {
        return null;
    }

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        EDIT EXERCISE PLAN
                    </span>

                    <h2>Update Exercise Plan</h2>

                    <p>
                        Update your workout plan and
                        exercises.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.cancelTop}
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                {/* PLAN INFORMATION */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        Plan Information
                    </div>

                    <div className={styles.grid}>
                        <Field
                            label="Plan Name"
                            name="plan_name"
                            value={form.plan_name}
                            onChange={handleFormChange}
                            error={errors.plan_name}
                            type="text"
                        />

                        <Field
                            label="Start Date"
                            name="start_date"
                            value={form.start_date}
                            onChange={handleFormChange}
                            error={errors.start_date}
                            type="date"
                        />

                        <Field
                            label="End Date"
                            name="end_date"
                            value={form.end_date}
                            onChange={handleFormChange}
                            error={errors.end_date}
                            type="date"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="plan-notes">
                            Plan Notes
                        </label>

                        <textarea
                            id="plan-notes"
                            name="notes"
                            value={form.notes}
                            onChange={handleFormChange}
                            placeholder="Add notes about this plan..."
                            rows={4}
                            maxLength={500}
                        />

                        {errors.notes && (
                            <span
                                className={styles.fieldError}
                            >
                                {errors.notes}
                            </span>
                        )}
                    </div>
                </div>

                {/* EXERCISES */}
                <div className={styles.section}>
                    <div
                        className={styles.exerciseHeader}
                    >
                        <div
                            className={styles.sectionTitle}
                        >
                            Exercises
                        </div>

                        <button
                            type="button"
                            className={styles.addButton}
                            onClick={addExercise}
                            disabled={loading}
                        >
                            + Add Exercise
                        </button>
                    </div>

                    {errors.exercises && (
                        <div className={styles.errorBox}>
                            {errors.exercises}
                        </div>
                    )}

                    {exercises.map(
                        (exercise, index) => (
                            <div
                                className={
                                    styles.exerciseCard
                                }
                                key={
                                    exercise._id ||
                                    `new-${index}`
                                }
                            >
                                <div
                                    className={
                                        styles.exerciseCardHeader
                                    }
                                >
                                    <h3>
                                        Exercise {index + 1}
                                    </h3>

                                    {exercises.length > 1 && (
                                        <button
                                            type="button"
                                            className={
                                                styles.removeButton
                                            }
                                            onClick={() =>
                                                removeExercise(
                                                    index
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div
                                    className={styles.grid}
                                >
                                    <Field
                                        label="Exercise Name"
                                        value={
                                            exercise.exercise_name
                                        }
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "exercise_name",
                                                event.target.value
                                            )
                                        }
                                        error={
                                            errors[
                                            `exercise_${index}_exercise_name`
                                            ]
                                        }
                                        type="text"
                                        placeholder="e.g. Bench Press"
                                    />

                                    <Field
                                        label="Machine Name"
                                        value={
                                            exercise.machine_name
                                        }
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "machine_name",
                                                event.target.value
                                            )
                                        }
                                        error={
                                            errors[
                                            `exercise_${index}_machine_name`
                                            ]
                                        }
                                        type="text"
                                        placeholder="e.g. Chest Press Machine"
                                    />

                                    <Field
                                        label="Weight"
                                        value={
                                            exercise.weight_kg
                                        }
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "weight_kg",
                                                event.target.value
                                            )
                                        }
                                        error={
                                            errors[
                                            `exercise_${index}_weight_kg`
                                            ]
                                        }
                                        suffix="kg"
                                        type="number"
                                    />

                                    <Field
                                        label="Sets"
                                        value={exercise.sets}
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "sets",
                                                event.target.value
                                            )
                                        }
                                        error={
                                            errors[
                                            `exercise_${index}_sets`
                                            ]
                                        }
                                        type="number"
                                    />

                                    <Field
                                        label="Reps"
                                        value={exercise.reps}
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "reps",
                                                event.target.value
                                            )
                                        }
                                        error={
                                            errors[
                                            `exercise_${index}_reps`
                                            ]
                                        }
                                        type="number"
                                    />
                                </div>

                                <div
                                    className={styles.field}
                                >
                                    <label>
                                        Exercise Notes
                                    </label>

                                    <textarea
                                        value={
                                            exercise.notes
                                        }
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "notes",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Optional notes..."
                                        rows={3}
                                        maxLength={500}
                                    />

                                    {errors[
                                        `exercise_${index}_notes`
                                    ] && (
                                            <span
                                                className={
                                                    styles.fieldError
                                                }
                                            >
                                                {
                                                    errors[
                                                    `exercise_${index}_notes`
                                                    ]
                                                }
                                            </span>
                                        )}
                                </div>
                            </div>
                        )
                    )}
                </div>

                {submitError && (
                    <div className={styles.errorBox}>
                        {submitError}
                    </div>
                )}

                <div className={styles.footer}>
                    <button
                        type="button"
                        className={styles.cancel}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className={styles.submit}
                        disabled={loading}
                    >
                        {loading
                            ? "Updating..."
                            : "Update Exercise Plan"}
                    </button>
                </div>
            </form>
        </section>
    );
}

function formatInputDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toISOString().split("T")[0];
}

function Field({
    label,
    name,
    value,
    onChange,
    error,
    suffix,
    type = "text",
    placeholder,
}) {
    return (
        <div className={styles.field}>
            <label htmlFor={name}>
                {label}
            </label>

            <div className={styles.inputWrap}>
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value ?? ""}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${styles.input} ${error
                            ? styles.inputError
                            : ""
                        }`}
                />

                {suffix && (
                    <span className={styles.suffix}>
                        {suffix}
                    </span>
                )}
            </div>

            {error && (
                <span
                    className={styles.fieldError}
                >
                    {error}
                </span>
            )}
        </div>
    );
}

export default ExercisePlanEditForm;