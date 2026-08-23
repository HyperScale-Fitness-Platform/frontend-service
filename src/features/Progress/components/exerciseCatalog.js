/*
 * Static exercise catalog used by the plan forms.
 *
 * Each muscle group exposes exercises with the
 * machine/equipment typically associated with them,
 * so trainers pick from dropdowns instead of free text.
 *
 * The "Custom" group lets trainers fall back to manual
 * entry when something is not in the catalog.
 */
const EXERCISE_CATALOG = {
  Chest: [
    { exercise: "Barbell Bench Press", machine: "Barbell + Flat Bench" },
    { exercise: "Incline Barbell Bench Press", machine: "Barbell + Incline Bench" },
    { exercise: "Dumbbell Bench Press", machine: "Dumbbells + Flat Bench" },
    { exercise: "Incline Dumbbell Press", machine: "Dumbbells + Incline Bench" },
    { exercise: "Chest Press Machine", machine: "Chest Press Machine" },
    { exercise: "Pec Deck Fly", machine: "Pec Deck Machine" },
    { exercise: "Cable Crossover", machine: "Cable Station" },
    { exercise: "Push-Ups", machine: "Bodyweight" },
  ],
  Back: [
    { exercise: "Lat Pulldown", machine: "Lat Pulldown Machine" },
    { exercise: "Seated Cable Row", machine: "Seated Row Machine" },
    { exercise: "Bent-Over Barbell Row", machine: "Barbell" },
    { exercise: "One-Arm Dumbbell Row", machine: "Dumbbell + Bench" },
    { exercise: "T-Bar Row", machine: "T-Bar Row Machine" },
    { exercise: "Assisted Pull-Up", machine: "Assisted Pull-Up Machine" },
    { exercise: "Deadlift", machine: "Barbell + Plates" },
    { exercise: "Back Extension", machine: "Roman Chair" },
  ],
  Legs: [
    { exercise: "Back Squat", machine: "Squat Rack + Barbell" },
    { exercise: "Front Squat", machine: "Squat Rack + Barbell" },
    { exercise: "Leg Press", machine: "Leg Press Machine" },
    { exercise: "Hack Squat", machine: "Hack Squat Machine" },
    { exercise: "Leg Extension", machine: "Leg Extension Machine" },
    { exercise: "Lying Leg Curl", machine: "Leg Curl Machine" },
    { exercise: "Seated Leg Curl", machine: "Seated Leg Curl Machine" },
    { exercise: "Romanian Deadlift", machine: "Barbell" },
    { exercise: "Standing Calf Raise", machine: "Calf Raise Machine" },
    { exercise: "Seated Calf Raise", machine: "Calf Raise Machine" },
    { exercise: "Walking Lunges", machine: "Dumbbells" },
    { exercise: "Goblet Squat", machine: "Kettlebell / Dumbbell" },
  ],
  Shoulders: [
    { exercise: "Overhead Barbell Press", machine: "Barbell + Rack" },
    { exercise: "Seated Dumbbell Press", machine: "Dumbbells + Bench" },
    { exercise: "Lateral Raise", machine: "Dumbbells" },
    { exercise: "Front Raise", machine: "Dumbbells / Plate" },
    { exercise: "Rear Delt Fly", machine: "Pec Deck Machine (Reverse)" },
    { exercise: "Face Pull", machine: "Cable Station + Rope" },
    { exercise: "Upright Row", machine: "Barbell / Cable" },
    { exercise: "Shrugs", machine: "Dumbbells / Barbell" },
  ],
  Arms: [
    { exercise: "Barbell Curl", machine: "Barbell / EZ Bar" },
    { exercise: "Dumbbell Hammer Curl", machine: "Dumbbells" },
    { exercise: "Preacher Curl", machine: "Preacher Curl Bench" },
    { exercise: "Cable Biceps Curl", machine: "Cable Station" },
    { exercise: "Triceps Pushdown", machine: "Cable Station + Bar" },
    { exercise: "Overhead Triceps Extension", machine: "Cable Station + Rope" },
    { exercise: "Skull Crushers", machine: "EZ Bar + Bench" },
    { exercise: "Close-Grip Bench Press", machine: "Barbell + Flat Bench" },
    { exercise: "Wrist Curl", machine: "Dumbbells / Barbell" },
  ],
  Core: [
    { exercise: "Plank", machine: "Bodyweight / Mat" },
    { exercise: "Crunches", machine: "Bodyweight / Mat" },
    { exercise: "Hanging Leg Raise", machine: "Pull-Up Bar" },
    { exercise: "Cable Crunch", machine: "Cable Station" },
    { exercise: "Russian Twist", machine: "Medicine Ball" },
    { exercise: "Ab Wheel Rollout", machine: "Ab Wheel" },
    { exercise: "Cable Woodchopper", machine: "Cable Station" },
    { exercise: "Side Plank", machine: "Bodyweight / Mat" },
  ],
  Cardio: [
    { exercise: "Treadmill Run", machine: "Treadmill" },
    { exercise: "Incline Treadmill Walk", machine: "Treadmill" },
    { exercise: "Stationary Bike", machine: "Upright / Recumbent Bike" },
    { exercise: "Rowing Machine", machine: "Rowing Ergometer" },
    { exercise: "Elliptical", machine: "Elliptical Trainer" },
    { exercise: "Stair Climber", machine: "Stair Master" },
    { exercise: "Jump Rope", machine: "Jump Rope" },
    { exercise: "Battle Ropes", machine: "Battle Ropes" },
  ],
};

export const MUSCLE_GROUPS = Object.keys(EXERCISE_CATALOG);

export function getExercisesForGroup(group) {
  return EXERCISE_CATALOG[group] || [];
}

export default EXERCISE_CATALOG;
