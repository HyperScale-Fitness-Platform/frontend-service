import { useState } from "react";

import progressApi from "../progressApi";

import styles from "./NutritionPlanForm.module.css";

function NutritionPlanForm({
  onCreated,
  onCancel,
  targetCustomerId,
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

  const [meals, setMeals] = useState([
    {
      meal_name: "",
      foods: [""],
      calories_kcal: "",
      protein_g: "",
      carbohydrates_g: "",
      fat_g: "",
    },
  ]);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

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
    mealIndex,
    field,
    value
  ) {
    setMeals((previous) =>
      previous.map((meal, index) =>
        index === mealIndex
          ? {
              ...meal,
              [field]: value,
            }
          : meal
      )
    );

    setErrors((previous) => ({
      ...previous,
      [`meal_${mealIndex}_${field}`]: "",
    }));

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

  function validateNumberField(
    value,
    field,
    min,
    max,
    newErrors
  ) {
    const number = Number(value);

    if (
      value === "" ||
      !Number.isFinite(number) ||
      number < min ||
      number > max
    ) {
      newErrors[field] =
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

    validateNumberField(
      form.daily_calorie_target,
      "daily_calorie_target",
      0,
      10000,
      newErrors
    );

    validateNumberField(
      form.daily_protein_target_g,
      "daily_protein_target_g",
      0,
      1000,
      newErrors
    );

    validateNumberField(
      form.daily_carbohydrate_target_g,
      "daily_carbohydrate_target_g",
      0,
      1000,
      newErrors
    );

    validateNumberField(
      form.daily_fat_target_g,
      "daily_fat_target_g",
      0,
      1000,
      newErrors
    );

    if (!form.goal) {
      newErrors.goal = "Goal is required";
    }

    if (!meals.length) {
      newErrors.meals =
        "At least one meal is required";
    }

    meals.forEach((meal, mealIndex) => {
      if (!meal.meal_name.trim()) {
        newErrors[
          `meal_${mealIndex}_meal_name`
        ] = "Meal name is required";
      }

      const validFoods =
        meal.foods.filter(
          (food) => food.trim()
        );

      if (!validFoods.length) {
        newErrors[
          `meal_${mealIndex}_foods`
        ] =
          "At least one food is required";
      }

      validateMealNumber(
        meal.calories_kcal,
        `meal_${mealIndex}_calories_kcal`,
        0,
        10000,
        newErrors
      );

      validateMealNumber(
        meal.protein_g,
        `meal_${mealIndex}_protein_g`,
        0,
        1000,
        newErrors
      );

      validateMealNumber(
        meal.carbohydrates_g,
        `meal_${mealIndex}_carbohydrates_g`,
        0,
        1000,
        newErrors
      );

      validateMealNumber(
        meal.fat_g,
        `meal_${mealIndex}_fat_g`,
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

  function validateMealNumber(
    value,
    field,
    min,
    max,
    errors
  ) {
    /*
     * These values are optional in the backend.
     */
    if (value === "") {
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

  function buildPayload() {
    const planId =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID ===
        "function"
        ? crypto.randomUUID()
        : `nutrition-plan-${Date.now()}`;

    return {
      id: planId,

      ...(targetCustomerId
        ? { customer_id: targetCustomerId }
        : {}),

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

      generated_by: "trainer",

      notes: form.notes.trim(),

      meals: meals.map((meal) => ({
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

      const created =
        await progressApi.createNutritionPlan(
          buildPayload()
        );

      if (onCreated) {
        onCreated(created);
      }
    } catch (error) {
      console.error(
        "Failed to create nutrition plan:",
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
          "Failed to create the nutrition plan."
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
            NUTRITION PLAN
          </span>

          <h2>Create Nutrition Plan</h2>

          <p>
            Build your nutrition program and
            define your daily targets and meals.
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
              placeholder="e.g. Muscle Gain Plan"
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
              <label htmlFor="goal">
                Goal
              </label>

              <select
                id="goal"
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

        {/* DAILY TARGETS */}

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
              placeholder="e.g. 2500"
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
              placeholder="e.g. 180"
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
              placeholder="e.g. 300"
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
              placeholder="e.g. 80"
            />
          </div>
        </div>

        {/* NOTES */}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Plan Notes
          </div>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleFormChange}
            placeholder="Add notes about this nutrition plan..."
            rows={4}
            maxLength={3000}
          />

          {errors.notes && (
            <span className={styles.fieldError}>
              {errors.notes}
            </span>
          )}
        </div>

        {/* MEALS */}

        <div className={styles.section}>
          <div className={styles.exerciseHeader}>
            <div>
              <div
                className={styles.sectionTitle}
              >
                Meals
              </div>

              <p>
                Add the meals and foods included
                in this nutrition plan.
              </p>
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
                key={mealIndex}
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

                <div className={styles.foodSection}>
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
                        key={foodIndex}
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
                          placeholder="e.g. Eggs"
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

                  {errors[
                    `meal_${mealIndex}_foods`
                  ] && (
                    <span
                      className={
                        styles.fieldError
                      }
                    >
                      {
                        errors[
                          `meal_${mealIndex}_foods`
                        ]
                      }
                    </span>
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
              : "Create Nutrition Plan"}
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

export default NutritionPlanForm;