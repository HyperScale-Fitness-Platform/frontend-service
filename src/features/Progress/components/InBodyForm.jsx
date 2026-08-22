import { useState } from "react";
import progressApi from "../progressApi";
import styles from "./InBodyForm.module.css";

function generateInBodyId() {
    return `inbody-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
}

const initialForm = {
    test_date: new Date().toISOString().split("T")[0],

    weight_kg: "",
    height_cm: "",
    bmi: "",

    body_fat_pct: "",
    body_fat_mass_kg: "",

    skeletal_muscle_mass_kg: "",
    fat_free_mass_kg: "",

    basal_metabolic_rate_kcal: "",

    visceral_fat_level: "",

    waist_hip_ratio: "",
    waist_circumference_cm: "",

    inbody_score: "",
    phase_angle: "",
};

function InBodyForm({ onCreated }) {
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

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
        setSuccess("");
    }

    function validate() {
        const newErrors = {};

        const requiredFields = [
            "test_date",
            "weight_kg",
            "height_cm",
            "bmi",
            "body_fat_pct",
            "body_fat_mass_kg",
            "skeletal_muscle_mass_kg",
            "fat_free_mass_kg",
            "basal_metabolic_rate_kcal",
        ];

        requiredFields.forEach((field) => {
            if (
                form[field] === undefined ||
                form[field] === null ||
                String(form[field]).trim() === ""
            ) {
                newErrors[field] = "Required";
            }
        });

        if (
            form.weight_kg &&
            (Number(form.weight_kg) < 0 ||
                Number(form.weight_kg) > 500)
        ) {
            newErrors.weight_kg = "Enter a valid weight";
        }

        if (
            form.height_cm &&
            (Number(form.height_cm) < 50 ||
                Number(form.height_cm) > 250)
        ) {
            newErrors.height_cm = "Enter a valid height";
        }

        if (
            form.body_fat_pct &&
            (Number(form.body_fat_pct) < 0 ||
                Number(form.body_fat_pct) > 100)
        ) {
            newErrors.body_fat_pct = "Enter a value between 0 and 100";
        }

        return newErrors;
    }

    function buildPayload() {
        const payload = {
            id: generateInBodyId(),
            test_date: form.test_date,

            weight_kg: Number(form.weight_kg),
            height_cm: Number(form.height_cm),
            bmi: Number(form.bmi),

            body_fat_pct: Number(form.body_fat_pct),
            body_fat_mass_kg: Number(form.body_fat_mass_kg),

            skeletal_muscle_mass_kg: Number(
                form.skeletal_muscle_mass_kg
            ),

            fat_free_mass_kg: Number(form.fat_free_mass_kg),

            basal_metabolic_rate_kcal: Number(
                form.basal_metabolic_rate_kcal
            ),
        };

        const optionalNumericFields = [
            "visceral_fat_level",
            "waist_hip_ratio",
            "waist_circumference_cm",
            "inbody_score",
            "phase_angle",
        ];

        optionalNumericFields.forEach((field) => {
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
        setSuccess("");

        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);

            const payload = buildPayload();

            const created = await progressApi.createInBody(payload);

            setSuccess("InBody result saved successfully.");

            setForm(initialForm);
            setErrors({});

            if (onCreated) {
                onCreated(created);
            }
        } catch (error) {
            console.error("Failed to create InBody");
            console.error("Status:", error?.response?.status);
            console.error("Response:", error?.response?.data);
            console.error("Full error:", error);

            const backendErrors = error?.response?.data?.errors;

            if (backendErrors) {
                setErrors(backendErrors);
            }

            setSubmitError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to save the InBody result."
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
                        INBODY RESULT
                    </span>

                    <h2>Enter your measurements</h2>

                    <p>
                        Enter the values exactly as shown on your
                        InBody result sheet.
                    </p>
                </div>

                <div className={styles.deviceBadge}>
                    INBODY
                </div>
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
                            value={form.test_date}
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
                            type="number"
                            step="0.1"
                            placeholder="e.g. 82.5"
                            value={form.weight_kg}
                            onChange={handleChange}
                            suffix="kg"
                            error={errors.weight_kg}
                        />

                        <Field
                            label="Height"
                            name="height_cm"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 178"
                            value={form.height_cm}
                            onChange={handleChange}
                            suffix="cm"
                            error={errors.height_cm}
                        />

                        <Field
                            label="BMI"
                            name="bmi"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 26.0"
                            value={form.bmi}
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
                            type="number"
                            step="0.1"
                            placeholder="e.g. 22.1"
                            value={form.body_fat_pct}
                            onChange={handleChange}
                            suffix="%"
                            error={errors.body_fat_pct}
                        />

                        <Field
                            label="Body Fat Mass"
                            name="body_fat_mass_kg"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 18.2"
                            value={form.body_fat_mass_kg}
                            onChange={handleChange}
                            suffix="kg"
                            error={errors.body_fat_mass_kg}
                        />

                        <Field
                            label="Skeletal Muscle Mass"
                            name="skeletal_muscle_mass_kg"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 34.2"
                            value={form.skeletal_muscle_mass_kg}
                            onChange={handleChange}
                            suffix="kg"
                            error={errors.skeletal_muscle_mass_kg}
                        />

                        <Field
                            label="Fat Free Mass"
                            name="fat_free_mass_kg"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 64.3"
                            value={form.fat_free_mass_kg}
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
                            type="number"
                            step="1"
                            placeholder="e.g. 1750"
                            value={form.basal_metabolic_rate_kcal}
                            onChange={handleChange}
                            suffix="kcal"
                            error={errors.basal_metabolic_rate_kcal}
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
                            type="number"
                            step="1"
                            placeholder="e.g. 9"
                            value={form.visceral_fat_level}
                            onChange={handleChange}
                            error={errors.visceral_fat_level}
                        />

                        <Field
                            label="Waist-Hip Ratio"
                            name="waist_hip_ratio"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 0.86"
                            value={form.waist_hip_ratio}
                            onChange={handleChange}
                            error={errors.waist_hip_ratio}
                        />

                        <Field
                            label="Waist Circumference"
                            name="waist_circumference_cm"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 91"
                            value={form.waist_circumference_cm}
                            onChange={handleChange}
                            suffix="cm"
                            error={errors.waist_circumference_cm}
                        />

                        <Field
                            label="InBody Score"
                            name="inbody_score"
                            type="number"
                            step="1"
                            placeholder="e.g. 82"
                            value={form.inbody_score}
                            onChange={handleChange}
                            suffix="/ 100"
                            error={errors.inbody_score}
                        />

                        <Field
                            label="Phase Angle"
                            name="phase_angle"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 6.2"
                            value={form.phase_angle}
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

                {success && (
                    <div className={styles.successBox}>
                        {success}
                    </div>
                )}

                <div className={styles.footer}>
                    <p>
                        Make sure your measurements match the values
                        printed on your InBody result.
                    </p>

                    <button
                        type="submit"
                        className={styles.submit}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save InBody Result"}
                    </button>
                </div>
            </form>
        </section>
    );
}

function Field({
    label,
    name,
    type = "text",
    step,
    placeholder,
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
                    step={step}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
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

export default InBodyForm;