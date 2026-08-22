import { useEffect, useState } from "react";
import progressApi from "../progressApi";
import styles from "./InBodyEditForm.module.css";

const EDITABLE_FIELDS = [
  "test_date",
  "weight_kg",
  "height_cm",
  "bmi",
  "body_fat_pct",
  "body_fat_mass_kg",
  "skeletal_muscle_mass_kg",
  "fat_free_mass_kg",
  "basal_metabolic_rate_kcal",
  "visceral_fat_level",
  "waist_hip_ratio",
  "waist_circumference_cm",
  "inbody_score",
  "phase_angle",
];

function InBodyEditForm({
  record,
  onUpdated,
  onCancel,
}) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!record) return;

    const initial = {};

    EDITABLE_FIELDS.forEach((field) => {
      if (field === "test_date") {
        initial[field] = record[field]
          ? new Date(record[field])
              .toISOString()
              .split("T")[0]
          : "";
      } else {
        initial[field] =
          record[field] !== undefined &&
          record[field] !== null
            ? record[field]
            : "";
      }
    });

    setForm(initial);
  }, [record]);

  function handleChange(event) {
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

  function validate() {
    const newErrors = {};

    if (!form.test_date) {
      newErrors.test_date = "Required";
    }

    validateNumber(
      "weight_kg",
      0,
      500,
      newErrors
    );

    validateNumber(
      "height_cm",
      50,
      250,
      newErrors
    );

    validateNumber(
      "bmi",
      5,
      100,
      newErrors
    );

    validateNumber(
      "body_fat_pct",
      0,
      100,
      newErrors
    );

    validateNumber(
      "body_fat_mass_kg",
      0,
      500,
      newErrors
    );

    validateNumber(
      "skeletal_muscle_mass_kg",
      0,
      200,
      newErrors
    );

    validateNumber(
      "fat_free_mass_kg",
      0,
      500,
      newErrors
    );

    validateNumber(
      "basal_metabolic_rate_kcal",
      0,
      10000,
      newErrors
    );

    validateOptionalNumber(
      "visceral_fat_level",
      0,
      50,
      newErrors
    );

    validateOptionalNumber(
      "waist_hip_ratio",
      0,
      5,
      newErrors
    );

    validateOptionalNumber(
      "waist_circumference_cm",
      0,
      300,
      newErrors
    );

    validateOptionalNumber(
      "inbody_score",
      0,
      100,
      newErrors
    );

    validateOptionalNumber(
      "phase_angle",
      0,
      20,
      newErrors
    );

    return newErrors;
  }

  function validateNumber(field, min, max, errors) {
    const value = form[field];

    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      errors[field] = "Required";
      return;
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      errors[field] = `Must be between ${min} and ${max}`;
    }
  }

  function validateOptionalNumber(
    field,
    min,
    max,
    errors
  ) {
    const value = form[field];

    if (
      value === undefined ||
      value === null ||
      String(value).trim() === ""
    ) {
      return;
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      errors[field] = `Must be between ${min} and ${max}`;
    }
  }

  function buildPayload() {
    const payload = {
      test_date: form.test_date,

      weight_kg: Number(form.weight_kg),
      height_cm: Number(form.height_cm),
      bmi: Number(form.bmi),

      body_fat_pct: Number(form.body_fat_pct),
      body_fat_mass_kg: Number(form.body_fat_mass_kg),

      skeletal_muscle_mass_kg: Number(
        form.skeletal_muscle_mass_kg
      ),

      fat_free_mass_kg: Number(
        form.fat_free_mass_kg
      ),

      basal_metabolic_rate_kcal: Number(
        form.basal_metabolic_rate_kcal
      ),
    };

    const optionalFields = [
      "visceral_fat_level",
      "waist_hip_ratio",
      "waist_circumference_cm",
      "inbody_score",
      "phase_angle",
    ];

    optionalFields.forEach((field) => {
      if (
        form[field] !== undefined &&
        form[field] !== null &&
        String(form[field]).trim() !== ""
      ) {
        payload[field] = Number(form[field]);
      }
    });

    return payload;
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

        const updated =
            await progressApi.updateInBody(
                record.id,
                payload
            );

        /*
         * Tell InBodyHistory that the update
         * succeeded.
         */
        if (onUpdated) {
            await onUpdated(updated);
        }
    } catch (error) {
        console.error(
            "Failed to update InBody:",
            error
        );

        if (error?.response?.data?.errors) {
            setErrors(
                error.response.data.errors
            );
        }

        setSubmitError(
            error?.response?.data?.message ||
                "Failed to update the InBody result."
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
            EDIT INBODY
          </span>

          <h2>Update your measurements</h2>

          <p>
            Update the values from your latest InBody
            result.
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
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Test Information
          </div>

          <div className={styles.grid}>
            <Field
              label="Test Date"
              name="test_date"
              type="date"
              value={form.test_date || ""}
              onChange={handleChange}
              error={errors.test_date}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Basic Measurements
          </div>

          <div className={styles.grid}>
            <Field
              label="Weight"
              name="weight_kg"
              value={form.weight_kg || ""}
              onChange={handleChange}
              suffix="kg"
              error={errors.weight_kg}
            />

            <Field
              label="Height"
              name="height_cm"
              value={form.height_cm || ""}
              onChange={handleChange}
              suffix="cm"
              error={errors.height_cm}
            />

            <Field
              label="BMI"
              name="bmi"
              value={form.bmi || ""}
              onChange={handleChange}
              error={errors.bmi}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Body Composition
          </div>

          <div className={styles.grid}>
            <Field
              label="Body Fat"
              name="body_fat_pct"
              value={form.body_fat_pct || ""}
              onChange={handleChange}
              suffix="%"
              error={errors.body_fat_pct}
            />

            <Field
              label="Body Fat Mass"
              name="body_fat_mass_kg"
              value={form.body_fat_mass_kg || ""}
              onChange={handleChange}
              suffix="kg"
              error={errors.body_fat_mass_kg}
            />

            <Field
              label="Skeletal Muscle Mass"
              name="skeletal_muscle_mass_kg"
              value={
                form.skeletal_muscle_mass_kg || ""
              }
              onChange={handleChange}
              suffix="kg"
              error={
                errors.skeletal_muscle_mass_kg
              }
            />

            <Field
              label="Fat Free Mass"
              name="fat_free_mass_kg"
              value={form.fat_free_mass_kg || ""}
              onChange={handleChange}
              suffix="kg"
              error={errors.fat_free_mass_kg}
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Metabolism
          </div>

          <div className={styles.grid}>
            <Field
              label="Basal Metabolic Rate"
              name="basal_metabolic_rate_kcal"
              value={
                form.basal_metabolic_rate_kcal || ""
              }
              onChange={handleChange}
              suffix="kcal"
              error={
                errors.basal_metabolic_rate_kcal
              }
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Additional Measurements
          </div>

          <div className={styles.grid}>
            <Field
              label="Visceral Fat Level"
              name="visceral_fat_level"
              value={form.visceral_fat_level || ""}
              onChange={handleChange}
              error={errors.visceral_fat_level}
            />

            <Field
              label="Waist-Hip Ratio"
              name="waist_hip_ratio"
              value={form.waist_hip_ratio || ""}
              onChange={handleChange}
              error={errors.waist_hip_ratio}
            />

            <Field
              label="Waist Circumference"
              name="waist_circumference_cm"
              value={
                form.waist_circumference_cm || ""
              }
              onChange={handleChange}
              suffix="cm"
              error={
                errors.waist_circumference_cm
              }
            />

            <Field
              label="InBody Score"
              name="inbody_score"
              value={form.inbody_score || ""}
              onChange={handleChange}
              suffix="/ 100"
              error={errors.inbody_score}
            />

            <Field
              label="Phase Angle"
              name="phase_angle"
              value={form.phase_angle || ""}
              onChange={handleChange}
              suffix="°"
              error={errors.phase_angle}
            />
          </div>
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
              : "Update InBody"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  type = "number",
  value,
  onChange,
  suffix,
  error,
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{label}</label>

      <div className={styles.inputWrap}>
        <input
          id={name}
          name={name}
          type={type}
          step="0.1"
          value={value}
          onChange={onChange}
          className={`${styles.input} ${
            error ? styles.inputError : ""
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

export default InBodyEditForm;