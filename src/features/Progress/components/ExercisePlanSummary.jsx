import styles from "./ExercisePlanSummary.module.css";

function ExercisePlanSummary({
  plan,
  loading,
  onAddNew,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.loading}>
          Loading exercise plan...
        </div>
      </section>
    );
  }

  if (!plan) {
    return (
      <section className={styles.card}>
        <div className={styles.empty}>
          <span className={styles.eyebrow}>
            EXERCISE PLAN
          </span>

          <h2>No Exercise Plan Yet</h2>

          <p>
            Create an exercise plan to start
            tracking your workouts.
          </p>

          {onAddNew && (
            <button
              className={styles.primaryButton}
              onClick={onAddNew}
            >
              + Create Exercise Plan
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            CURRENT PLAN
          </span>

          <h2>{plan.plan_name}</h2>

          <p>
            {formatDate(plan.start_date)}
            {plan.end_date
              ? ` → ${formatDate(plan.end_date)}`
              : ""}
          </p>
        </div>

        <div className={styles.actions}>
          {onEdit && (
            <button
              type="button"
              className={styles.editButton}
              onClick={() => onEdit(plan)}
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => onDelete(plan)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {plan.notes && (
        <div className={styles.notes}>
          <strong>Notes</strong>
          <p>{plan.notes}</p>
        </div>
      )}

      <div className={styles.exerciseHeader}>
        <h3>Exercises</h3>

        <span>
          {plan.exercises?.length || 0} exercises
        </span>
      </div>

      <div className={styles.exerciseList}>
        {plan.exercises?.map((exercise, index) => (
          <div
            className={styles.exercise}
            key={exercise._id || index}
          >
            <div className={styles.exerciseNumber}>
              {index + 1}
            </div>

            <div className={styles.exerciseInfo}>
              <h4>
                {exercise.exercise_name}
              </h4>

              {exercise.machine_name && (
                <p>
                  {exercise.machine_name}
                </p>
              )}

              <div className={styles.stats}>
                <span>
                  {exercise.sets} sets
                </span>

                <span>
                  {exercise.reps} reps
                </span>

                <span>
                  {exercise.weight_kg} kg
                </span>
              </div>

              {exercise.notes && (
                <small>
                  {exercise.notes}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default ExercisePlanSummary;