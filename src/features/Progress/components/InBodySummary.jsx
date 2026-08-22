import styles from "./InBodySummary.module.css";

function InBodySummary({ record, loading, onAddNew }) {
  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.loading}>
          Loading your latest InBody...
        </div>
      </section>
    );
  }

  if (!record) {
    return (
      <section className={styles.empty}>
        <span className={styles.emptyEyebrow}>
          YOUR PROGRESS
        </span>

        <h2>No InBody result yet</h2>

        <p>
          Add your latest InBody measurements to start
          tracking your body composition.
        </p>

        {onAddNew && (
          <button
            className={styles.button}
            onClick={onAddNew}
          >
            Add InBody Result
          </button>
        )}
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            LATEST RESULT
          </span>

          <h2>InBody Overview</h2>

          <p>
            Test date:{" "}
            <strong>{formatDate(record.test_date)}</strong>
          </p>
        </div>

        {onAddNew && (
          <button
            className={styles.secondaryButton}
            onClick={onAddNew}
          >
            + New Result
          </button>
        )}
      </div>

      <div className={styles.primaryGrid}>
        <Metric
          label="Weight"
          value={record.weight_kg}
          unit="kg"
          highlight
        />

        <Metric
          label="Body Fat"
          value={record.body_fat_pct}
          unit="%"
          highlight
        />

        <Metric
          label="Skeletal Muscle"
          value={record.skeletal_muscle_mass_kg}
          unit="kg"
          highlight
        />

        <Metric
          label="BMI"
          value={record.bmi}
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          BODY COMPOSITION
        </div>

        <div className={styles.metricGrid}>
          <Metric
            label="Body Fat Mass"
            value={record.body_fat_mass_kg}
            unit="kg"
          />

          <Metric
            label="Fat Free Mass"
            value={record.fat_free_mass_kg}
            unit="kg"
          />

          <Metric
            label="Basal Metabolic Rate"
            value={record.basal_metabolic_rate_kcal}
            unit="kcal"
          />

          <Metric
            label="Visceral Fat"
            value={record.visceral_fat_level}
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          BODY MEASUREMENTS
        </div>

        <div className={styles.metricGrid}>
          <Metric
            label="Waist-Hip Ratio"
            value={record.waist_hip_ratio}
          />

          <Metric
            label="Waist Circumference"
            value={record.waist_circumference_cm}
            unit="cm"
          />

          <Metric
            label="InBody Score"
            value={record.inbody_score}
            unit="/ 100"
          />

          <Metric
            label="Phase Angle"
            value={record.phase_angle}
            unit="°"
          />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, unit, highlight }) {
  return (
    <div
      className={`${styles.metric} ${
        highlight ? styles.highlight : ""
      }`}
    >
      <span>{label}</span>

      <strong>
        {value !== undefined &&
        value !== null &&
        value !== ""
          ? value
          : "—"}
      </strong>

      {unit && (
        <small>{unit}</small>
      )}
    </div>
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

export default InBodySummary;