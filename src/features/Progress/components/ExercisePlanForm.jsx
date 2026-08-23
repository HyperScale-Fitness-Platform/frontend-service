import { useState } from "react";
import progressApi from "../progressApi";
import {
    MUSCLE_GROUPS,
    getExercisesForGroup,
} from "./exerciseCatalog";
import styles from "./ExercisePlanForm.module.css";

const CUSTOM_OPTION = "__custom__";

function ExercisePlanForm({ onCreated, onCancel, targetCustomerId }) {
    const [form, setForm] = useState({
        plan_name: "",
        start_date: "",
        end_date: "",
        notes: "",
    });

    const [exercises, setExercises] = useState([
        {
            exercise_name: "",
            machine_name: "",
            weight_kg: "",
            sets: 3,
            reps: 10,
            notes: "",
            muscle_group: "",
            selection_mode: "",
        },
    ]);

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);

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

    function handleExerciseChange(index, field, value) {
        setExercises((previous) =>
            previous.map((exercise, exerciseIndex) =>
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
            [`exercise_${index}_${field}`]: "",
        }));

        setSubmitError("");
    }

    function handleMuscleGroupChange(index, group) {
        setExercises((previous) =>
            previous.map((exercise, exerciseIndex) => {
                if (exerciseIndex !== index) {
                    return exercise;
                }

                if (group === CUSTOM_OPTION) {
                    return {
                        ...exercise,
                        muscle_group: group,
                        selection_mode: CUSTOM_OPTION,
                        exercise_name: "",
                        machine_name: "",
                    };
                }

                return {
                    ...exercise,
                    muscle_group: group,
                    selection_mode: "",
                    exercise_name: "",
                    machine_name: "",
                };
            })
        );

        setErrors((previous) => ({
            ...previous,
            [`exercise_${index}_exercise_name`]: "",
            [`exercise_${index}_machine_name`]: "",
        }));

        setSubmitError("");
    }

    function handleCatalogExerciseChange(index, exerciseName) {
        const selected = getExercisesForGroup(
            exercises[index].muscle_group
        ).find((item) => item.exercise === exerciseName);

        if (!selected) {
            return;
        }

        setExercises((previous) =>
            previous.map((exercise, exerciseIndex) =>
                exerciseIndex === index
                    ? {
                        ...exercise,
                        exercise_name: selected.exercise,
                        machine_name: selected.machine,
                    }
                    : exercise
            )
        );

        setErrors((previous) => ({
            ...previous,
            [`exercise_${index}_exercise_name`]: "",
            [`exercise_${index}_machine_name`]: "",
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
                muscle_group: "",
                selection_mode: "",
            },
        ]);
    }

    function removeExercise(index) {
        if (exercises.length === 1) {
            return;
        }

        setExercises((previous) =>
            previous.filter(
                (_, exerciseIndex) => exerciseIndex !== index
            )
        );
    }

    function validate() {
        const newErrors = {};

        if (!form.plan_name.trim()) {
            newErrors.plan_name = "Plan name is required";
        }

        if (!form.start_date) {
            newErrors.start_date = "Start date is required";
        }

        if (form.end_date && form.start_date) {
            if (
                new Date(form.end_date) <
                new Date(form.start_date)
            ) {
                newErrors.end_date =
                    "End date cannot be before start date";
            }
        }

        if (exercises.length === 0) {
            newErrors.exercises =
                "At least one exercise is required";
        }

        exercises.forEach((exercise, index) => {
            if (!exercise.muscle_group) {
                newErrors[
                    `exercise_${index}_muscle_group`
                ] = "Muscle group is required";
            }

            if (!exercise.exercise_name.trim()) {
                newErrors[
                    `exercise_${index}_exercise_name`
                ] = "Exercise name is required";
            }

            /*
             * Your backend validation currently requires
             * machine_name, so keep it required here too.
             */
            if (!exercise.machine_name.trim()) {
                newErrors[
                    `exercise_${index}_machine_name`
                ] = "Machine name is required";
            }

            const weight = Number(exercise.weight_kg);

            if (
                exercise.weight_kg === "" ||
                !Number.isFinite(weight) ||
                weight < 0 ||
                weight > 1000
            ) {
                newErrors[
                    `exercise_${index}_weight_kg`
                ] = "Weight must be between 0 and 1000";
            }

            const sets = Number(exercise.sets);

            if (
                !Number.isInteger(sets) ||
                sets < 1 ||
                sets > 20
            ) {
                newErrors[
                    `exercise_${index}_sets`
                ] = "Sets must be between 1 and 20";
            }

            const reps = Number(exercise.reps);

            if (
                !Number.isInteger(reps) ||
                reps < 1 ||
                reps > 100
            ) {
                newErrors[
                    `exercise_${index}_reps`
                ] = "Reps must be between 1 and 100";
            }

            if (
                exercise.notes &&
                exercise.notes.length > 500
            ) {
                newErrors[
                    `exercise_${index}_notes`
                ] = "Notes cannot exceed 500 characters";
            }
        });

        if (form.notes.length > 300) {
            newErrors.notes =
                "Plan notes cannot exceed 300 characters";
        }

        return newErrors;
    }

    function buildPayload() {
  return {
    ...(targetCustomerId
      ? { customer_id: targetCustomerId }
      : {}),

    plan_name: form.plan_name.trim(),

    start_date: form.start_date,

    end_date: form.end_date || null,

    notes: form.notes.trim(),

    exercises: exercises.map((exercise) => ({
      exercise_name:
        exercise.exercise_name.trim(),

      machine_name:
        exercise.machine_name.trim(),

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

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const payload = buildPayload();

            const created =
                await progressApi.createExercisePlan(
                    payload
                );

            if (onCreated) {
                onCreated(created);
            }
        } catch (error) {
            console.error(
                "Failed to create exercise plan:",
                error?.response?.data || error
            );

            if (error?.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }

            setSubmitError(
                error?.response?.data?.message ||
                "Failed to create the exercise plan."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        EXERCISE PLAN
                    </span>

                    <h2>Create Exercise Plan</h2>

                    <p>
                        Build your workout plan and add the
                        exercises you want to follow.
                    </p>
                </div>

                {onCancel && (
                    <button
                        type="button"
                        className={styles.cancelTop}
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
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
                            placeholder="e.g. Strength Program"
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
                        <label htmlFor="notes">
                            Plan Notes
                        </label>

                        <textarea
                            id="notes"
                            name="notes"
                            value={form.notes}
                            onChange={handleFormChange}
                            placeholder="Add notes about this plan..."
                            rows={4}
                            maxLength={300}
                        />

                        {errors.notes && (
                            <span className={styles.fieldError}>
                                {errors.notes}
                            </span>
                        )}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.exerciseHeader}>
                        <div>
                            <div className={styles.sectionTitle}>
                                Exercises
                            </div>

                            <p>
                                Add the exercises included in this
                                plan.
                            </p>
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

                    <div className={styles.exerciseList}>
                        {exercises.map((exercise, index) => (
                            <div
                                className={styles.exerciseCard}
                                key={index}
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
                                                removeExercise(index)
                                            }
                                            disabled={loading}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className={styles.grid}>
                                    <div className={styles.field}>
                                        <label>
                                            Muscle Group
                                        </label>

                                        <select
                                            className={styles.input}
                                            value={
                                                exercise.muscle_group
                                            }
                                            onChange={(event) =>
                                                handleMuscleGroupChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            <option value="">
                                                Select muscle group...
                                            </option>

                                            {MUSCLE_GROUPS.map((group) => (
                                                <option
                                                    key={group}
                                                    value={group}
                                                >
                                                    {group}
                                                </option>
                                            ))}

                                            <option value={CUSTOM_OPTION}>
                                                Custom (type manually)
                                            </option>
                                        </select>

                                        {errors[
                                            `exercise_${index}_muscle_group`
                                        ] && (
                                                <span
                                                    className={
                                                        styles.fieldError
                                                    }
                                                >
                                                    {
                                                        errors[
                                                        `exercise_${index}_muscle_group`
                                                        ]
                                                    }
                                                </span>
                                            )}
                                    </div>

                                    {exercise.selection_mode ===
                                        CUSTOM_OPTION ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <div className={styles.field}>
                                            <label>
                                                Exercise / Machine
                                            </label>

                                            <select
                                                className={styles.input}
                                                value={
                                                    exercises[index]
                                                        .exercise_name
                                                }
                                                onChange={(event) =>
                                                    handleCatalogExerciseChange(
                                                        index,
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    loading ||
                                                    !exercise.muscle_group
                                                }
                                            >
                                                <option value="">
                                                    {!exercise.muscle_group
                                                        ? "Choose a muscle group first..."
                                                        : "Select exercise..."}
                                                </option>

                                                {getExercisesForGroup(
                                                    exercise.muscle_group
                                                ).map((item) => (
                                                    <option
                                                        key={item.exercise}
                                                        value={item.exercise}
                                                    >
                                                        {item.exercise}
                                                    </option>
                                                ))}
                                            </select>

                                            {(errors[
                                                `exercise_${index}_exercise_name`
                                            ] ||
                                                errors[
                                                `exercise_${index}_machine_name`
                                                ]) && (
                                                    <span
                                                        className={
                                                            styles.fieldError
                                                        }
                                                    >
                                                        {
                                                            errors[
                                                            `exercise_${index}_exercise_name`
                                                            ]
                                                        }
                                                    </span>
                                                )}

                                            {exercises[index].machine_name && (
                                                <span
                                                    className={
                                                        styles.machineHint
                                                    }
                                                >
                                                    Equipment:{" "}
                                                    {
                                                        exercises[index]
                                                            .machine_name
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <Field
                                        label="Weight"
                                        value={exercise.weight_kg}
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
                                        placeholder="e.g. 40"
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
                                        placeholder="e.g. 3"
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
                                        placeholder="e.g. 10"
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label>
                                        Exercise Notes
                                    </label>

                                    <textarea
                                        value={exercise.notes}
                                        onChange={(event) =>
                                            handleExerciseChange(
                                                index,
                                                "notes",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Optional notes..."
                                        rows={3}
                                        maxLength={300}
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
                        ))}
                    </div>
                </div>

                {submitError && (
                    <div className={styles.errorBox}>
                        {submitError}
                    </div>
                )}

                <div className={styles.footer}>
                    {onCancel && (
                        <button
                            type="button"
                            className={styles.cancel}
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}

                    <button
                        type="submit"
                        className={styles.submit}
                        disabled={loading}
                    >
                        {loading
                            ? "Creating..."
                            : "Create Exercise Plan"}
                    </button>
                </div>
            </form>
        </section>
    );
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
            <label htmlFor={name}>{label}</label>

            <div className={styles.inputWrap}>
                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value ?? ""}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`${styles.input} ${error ? styles.inputError : ""
                        }`}
                />

                {suffix && (
                    <span className={styles.suffix}>
                        {suffix}
                    </span>
                )}
            </div>

            {error && (
                <span className={styles.fieldError}>
                    {error}
                </span>
            )}
        </div>
    );
}

export default ExercisePlanForm;