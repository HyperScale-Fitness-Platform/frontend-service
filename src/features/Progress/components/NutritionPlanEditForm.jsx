import { useEffect, useState } from "react";

import progressApi from "../progressApi";

import styles from "./NutritionPlanEditForm.module.css";

function NutritionPlanEditForm({
  record,
  onUpdated,
  onCancel,
}) {
  const [form, setForm] = useState({
    plan_name: "",
    start_date: "",
    end_date: "",
    daily_calorie_target: "",
    daily_protein_target_g: "",
    daily_carbohydrate_target_g: "",
    daily_fat_target_g: "",
    goal: "maintenance",
    notes: "",
  });

  const [meals, setMeals] = useState([]);

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
        ? formatInputDate(
            record.start_date
          )
        : "",

      end_date: record.end_date
        ? formatInputDate(record.end_date)
        : "",

      daily_calorie_target:
        record.daily_calorie_target ??
        "",

      daily_protein_target_g:
        record.daily_protein_target_g ??
        "",

      daily_carbohydrate_target_g:
        record.daily_carbohydrate_target_g ??
        "",

      daily_fat_target_g:
        record.daily_fat_target_g ?? "",

      goal:
        record.goal || "maintenance",

      notes: record.notes || "",
    });

    setMeals(
      (record.meals || []).map(
        (meal) => ({
          _id: meal._id,

          meal_name:
            meal.meal_name || "",

          foods:
            Array.isArray(meal.foods) &&
            meal.foods.length
              ? meal.foods
              : [""],

          calories_kcal:
            meal.calories_kcal ??
            "",

          protein_g:
            meal.protein_g ?? "",

          carbohydrates_g:
            meal.carbohydrates_g ?? "",

          fat_g: meal.fat_g ?? "",
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

  function handleMealChange(
    index,
    field,
    value
  ) {
    setMeals((previous) =>
      previous.map((meal, mealIndex) =>
        mealIndex === index
          ? {
              ...meal,
              [field]: value,
            }
          : meal
      )
    );

    setSubmitError("");
  }

  function handleFoodChange(
    mealIndex,
    foodIndex,
    value
  ) {
    setMeals((previous) =>
      previous.map((meal, index) => {
        if (index !== mealIndex) {
          return meal;
        }

        const foods = [...meal.foods];

        foods[foodIndex] = value;

        return {
          ...meal,
          foods,
        };
      })
    );

    setSubmitError("");
  }

  function addFood(mealIndex) {
    setMeals((previous) =>
      previous.map((meal, index) =>
        index === mealIndex
          ? {
              ...meal,
              foods: [...meal.foods, ""],
            }
          : meal
      )
    );
  }

  function removeFood(
    mealIndex,
    foodIndex
  ) {
    setMeals((previous) =>
      previous.map((meal, index) => {
        if (index !== mealIndex) {
          return meal;
        }

        if (meal.foods.length === 1) {
          return meal;
        }

        return {
          ...meal,
          foods: meal.foods.filter(
            (_, index) =>
              index !== foodIndex
          ),
        };
      })
    );
  }

  function addMeal() {
    setMeals((previous) => [
      ...previous,
      {
        meal_name: "",
        foods: [""],
        calories_kcal: "",
        protein_g: "",
        carbohydrates_g: "",
        fat_g: "",
      },
    ]);
  }

  function removeMeal(index) {
    if (meals.length === 1) {
      return;
    }

    setMeals((previous) =>
      previous.filter(
        (_, mealIndex) =>
          mealIndex !== index
      )
    );
  }

  function validateNumber(
    value,
    field,
    min,
    max,
    errors,
    required = false
  ) {
    if (value === "") {
      if (required) {
        errors[field] = "This field is required";
      }

      return;
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      errors[field] =
        `Must be between ${min} and ${max}`;
    }
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

    validateNumber(
      form.daily_calorie_target,
      "daily_calorie_target",
      0,
      10000,
      newErrors,
      true
    );

    validateNumber(
      form.daily_protein_target_g,
      "daily_protein_target_g",
      0,
      1000,
      newErrors,
      true
    );

    validateNumber(
      form.daily_carbohydrate_target_g,
      "daily_carbohydrate_target_g",
      0,
      1000,
      newErrors,
      true
    );

    validateNumber(
      form.daily_fat_target_g,
      "daily_fat_target_g",
      0,
      1000,
      newErrors,
      true
    );

    if (!form.goal) {
      newErrors.goal = "Goal is required";
    }

    if (!meals.length) {
      newErrors.meals =
        "At least one meal is required";
    }

    meals.forEach((meal, index) => {
      if (!meal.meal_name.trim()) {
        newErrors[
          `meal_${index}_meal_name`
        ] = "Meal name is required";
      }

      const foods = meal.foods.filter(
        (food) => food.trim()
      );

      if (!foods.length) {
        newErrors[
          `meal_${index}_foods`
        ] =
          "At least one food is required";
      }

      validateNumber(
        meal.calories_kcal,
        `meal_${index}_calories_kcal`,
        0,
        10000,
        newErrors
      );

      validateNumber(
        meal.protein_g,
        `meal_${index}_protein_g`,
        0,
        1000,
        newErrors
      );

      validateNumber(
        meal.carbohydrates_g,
        `meal_${index}_carbohydrates_g`,
        0,
        1000,
        newErrors
      );

      validateNumber(
        meal.fat_g,
        `meal_${index}_fat_g`,
        0,
        1000,
        newErrors
      );
    });

    if (form.notes.length > 3000) {
      newErrors.notes =
        "Notes cannot exceed 3000 characters";
    }

    return newErrors;
  }

  function buildPayload() {
    return {
      plan_name: form.plan_name.trim(),

      start_date: form.start_date,

      end_date: form.end_date || null,

      daily_calorie_target: Number(
        form.daily_calorie_target
      ),

      daily_protein_target_g: Number(
        form.daily_protein_target_g
      ),

      daily_carbohydrate_target_g: Number(
        form.daily_carbohydrate_target_g
      ),

      daily_fat_target_g: Number(
        form.daily_fat_target_g
      ),

      goal: form.goal,

      notes: form.notes.trim(),

      meals: meals.map((meal) => ({
        ...(meal._id
          ? {
              _id: meal._id,
            }
          : {}),

        meal_name:
          meal.meal_name.trim(),

        foods: meal.foods
          .map((food) => food.trim())
          .filter(Boolean),

        ...(meal.calories_kcal !== ""
          ? {
              calories_kcal: Number(
                meal.calories_kcal
              ),
            }
          : {}),

        ...(meal.protein_g !== ""
          ? {
              protein_g: Number(
                meal.protein_g
              ),
            }
          : {}),

        ...(meal.carbohydrates_g !== ""
          ? {
              carbohydrates_g: Number(
                meal.carbohydrates_g
              ),
            }
          : {}),

        ...(meal.fat_g !== ""
          ? {
              fat_g: Number(meal.fat_g),
            }
          : {}),
      })),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitError("");

    const validationErrors = validate();

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
        await progressApi.updateNutritionPlan(
          record.id,
          buildPayload()
        );

      if (onUpdated) {
        onUpdated(updated);
      }
    } catch (error) {
      console.error(
        "Failed to update nutrition plan:",
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
          "Failed to update the nutrition plan."
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
            EDIT NUTRITION PLAN
          </span>

          <h2>Update Nutrition Plan</h2>

          <p>
            Update your nutrition targets and
            meals.
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
            Plan Information
          </div>

          <div className={styles.grid}>
            <Field
              label="Plan Name"
              name="plan_name"
              value={form.plan_name}
              onChange={handleFormChange}
              error={errors.plan_name}
            />

            <Field
              label="Start Date"
              name="start_date"
              type="date"
              value={form.start_date}
              onChange={handleFormChange}
              error={errors.start_date}
            />

            <Field
              label="End Date"
              name="end_date"
              type="date"
              value={form.end_date}
              onChange={handleFormChange}
              error={errors.end_date}
            />

            <div className={styles.field}>
              <label htmlFor="edit-goal">
                Goal
              </label>

              <select
                id="edit-goal"
                name="goal"
                value={form.goal}
                onChange={handleFormChange}
              >
                <option value="maintenance">
                  Maintenance
                </option>

                <option value="weight_loss">
                  Weight Loss
                </option>

                <option value="muscle_gain">
                  Muscle Gain
                </option>

                <option value="recomposition">
                  Recomposition
                </option>
              </select>

              {errors.goal && (
                <span
                  className={
                    styles.fieldError
                  }
                >
                  {errors.goal}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Daily Nutrition Targets
          </div>

          <div className={styles.grid}>
            <Field
              label="Calories"
              name="daily_calorie_target"
              type="number"
              value={
                form.daily_calorie_target
              }
              onChange={handleFormChange}
              error={
                errors.daily_calorie_target
              }
              suffix="kcal"
            />

            <Field
              label="Protein"
              name="daily_protein_target_g"
              type="number"
              value={
                form.daily_protein_target_g
              }
              onChange={handleFormChange}
              error={
                errors.daily_protein_target_g
              }
              suffix="g"
            />

            <Field
              label="Carbohydrates"
              name="daily_carbohydrate_target_g"
              type="number"
              value={
                form.daily_carbohydrate_target_g
              }
              onChange={handleFormChange}
              error={
                errors.daily_carbohydrate_target_g
              }
              suffix="g"
            />

            <Field
              label="Fat"
              name="daily_fat_target_g"
              type="number"
              value={
                form.daily_fat_target_g
              }
              onChange={handleFormChange}
              error={
                errors.daily_fat_target_g
              }
              suffix="g"
            />
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Plan Notes
          </div>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleFormChange}
            rows={4}
            maxLength={3000}
          />

          {errors.notes && (
            <span className={styles.fieldError}>
              {errors.notes}
            </span>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.exerciseHeader}>
            <div
              className={styles.sectionTitle}
            >
              Meals
            </div>

            <button
              type="button"
              className={styles.addButton}
              onClick={addMeal}
              disabled={loading}
            >
              + Add Meal
            </button>
          </div>

          {errors.meals && (
            <div className={styles.errorBox}>
              {errors.meals}
            </div>
          )}

          {meals.map(
            (meal, mealIndex) => (
              <div
                className={styles.mealCard}
                key={
                  meal._id ||
                  `new-${mealIndex}`
                }
              >
                <div
                  className={
                    styles.mealHeader
                  }
                >
                  <h3>
                    Meal {mealIndex + 1}
                  </h3>

                  {meals.length > 1 && (
                    <button
                      type="button"
                      className={
                        styles.removeButton
                      }
                      onClick={() =>
                        removeMeal(
                          mealIndex
                        )
                      }
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <Field
                  label="Meal Name"
                  value={meal.meal_name}
                  onChange={(event) =>
                    handleMealChange(
                      mealIndex,
                      "meal_name",
                      event.target.value
                    )
                  }
                  error={
                    errors[
                      `meal_${mealIndex}_meal_name`
                    ]
                  }
                  placeholder="e.g. Breakfast"
                />

                <div
                  className={
                    styles.foodSection
                  }
                >
                  <div
                    className={
                      styles.foodHeader
                    }
                  >
                    <label>Foods</label>

                    <button
                      type="button"
                      onClick={() =>
                        addFood(
                          mealIndex
                        )
                      }
                      disabled={loading}
                    >
                      + Add Food
                    </button>
                  </div>

                  {meal.foods.map(
                    (
                      food,
                      foodIndex
                    ) => (
                      <div
                        className={
                          styles.foodRow
                        }
                        key={
                          foodIndex
                        }
                      >
                        <input
                          type="text"
                          value={food}
                          onChange={(
                            event
                          ) =>
                            handleFoodChange(
                              mealIndex,
                              foodIndex,
                              event.target
                                .value
                            )
                          }
                        />

                        {meal.foods
                          .length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeFood(
                                mealIndex,
                                foodIndex
                              )
                            }
                            disabled={
                              loading
                            }
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className={styles.grid}>
                  <Field
                    label="Calories"
                    type="number"
                    value={
                      meal.calories_kcal
                    }
                    onChange={(event) =>
                      handleMealChange(
                        mealIndex,
                        "calories_kcal",
                        event.target
                          .value
                      )
                    }
                    error={
                      errors[
                        `meal_${mealIndex}_calories_kcal`
                      ]
                    }
                    suffix="kcal"
                  />

                  <Field
                    label="Protein"
                    type="number"
                    value={
                      meal.protein_g
                    }
                    onChange={(event) =>
                      handleMealChange(
                        mealIndex,
                        "protein_g",
                        event.target
                          .value
                      )
                    }
                    error={
                      errors[
                        `meal_${mealIndex}_protein_g`
                      ]
                    }
                    suffix="g"
                  />

                  <Field
                    label="Carbohydrates"
                    type="number"
                    value={
                      meal.carbohydrates_g
                    }
                    onChange={(event) =>
                      handleMealChange(
                        mealIndex,
                        "carbohydrates_g",
                        event.target
                          .value
                      )
                    }
                    error={
                      errors[
                        `meal_${mealIndex}_carbohydrates_g`
                      ]
                    }
                    suffix="g"
                  />

                  <Field
                    label="Fat"
                    type="number"
                    value={meal.fat_g}
                    onChange={(event) =>
                      handleMealChange(
                        mealIndex,
                        "fat_g",
                        event.target
                          .value
                      )
                    }
                    error={
                      errors[
                        `meal_${mealIndex}_fat_g`
                      ]
                    }
                    suffix="g"
                  />
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
              : "Update Nutrition Plan"}
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
          className={`${styles.input} ${
            error
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

export default NutritionPlanEditForm;