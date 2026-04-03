// Seed Service - Populates PPL workouts with exercises from Hisham Elmargoushy's program
import { databaseService } from "./database";
import { WorkoutType, CycleDay, WorkoutVariation } from "../types";

interface ExerciseData {
  name: string;
  sets: Array<{ reps: number | string }>;
  notes?: string;
}

interface WorkoutData {
  name: string;
  cycleDay: CycleDay;
  variation: WorkoutVariation;
  exercises: ExerciseData[];
}

const PPL_WORKOUTS: WorkoutData[] = [
  // PUSH DAY 1 (Variation 1)
  {
    name: "Push Day 1 - Hisham PPL",
    cycleDay: "push1",
    variation: 1,
    exercises: [
      {
        name: "Flat Bench Press",
        sets: [
          { reps: 20 },
          { reps: 20 },
          { reps: 15 },
          { reps: 15 },
          { reps: 12 },
        ],
        notes: "3 warm-up sets + 2 working sets",
      },
      { name: "Incline Dumbbell Press", sets: [{ reps: 12 }, { reps: 10 }] },
      {
        name: "Pec Dec Chest Flys (Butterfly)",
        sets: [{ reps: 12 }, { reps: 12 }],
      },
      {
        name: "Dumbbell Shoulder Press",
        sets: [{ reps: 12 }, { reps: 10 }],
      },
      { name: "Side Lateral Raises", sets: [{ reps: 20 }, { reps: 15 }] },
      {
        name: "Cable Triceps Extension",
        sets: [{ reps: 12 }, { reps: 12 }],
      },
      { name: "Rope Push Down", sets: [{ reps: 15 }, { reps: 15 }] },
    ],
  },

  // PULL DAY 1 (Variation 1)
  {
    name: "Pull Day 1 - Hisham PPL",
    cycleDay: "pull1",
    variation: 1,
    exercises: [
      {
        name: "Wide Lat Pull Downs",
        sets: [
          { reps: 20 },
          { reps: 20 },
          { reps: 15 },
          { reps: 20 },
          { reps: 15 },
          { reps: 12 },
        ],
        notes: "3 warm-up sets + 3 working sets",
      },
      { name: "Barbell Rows", sets: [{ reps: 12 }, { reps: 10 }] },
      {
        name: "Low Pulley Narrow Cable Rows",
        sets: [{ reps: 12 }, { reps: 10 }],
      },
      {
        name: "One Hand Dumbbell Rows",
        sets: [{ reps: 12 }, { reps: 10 }],
      },
      { name: "Rope Face Pulls", sets: [{ reps: 12 }, { reps: 12 }] },
      {
        name: "Reverse Pec Dec Rear Delt (Butterfly Machine)",
        sets: [{ reps: "12-15" }, { reps: "12-15" }],
      },
      { name: "DB Shrugs", sets: [{ reps: 15 }, { reps: 15 }] },
      { name: "Hyperextension", sets: [{ reps: 15 }, { reps: 12 }] },
      {
        name: "Standing Alternative Dumbbell Curls",
        sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
      },
      {
        name: "Cable Hammer Curls",
        sets: [{ reps: 12 }, { reps: 12 }],
      },
    ],
  },

  // LEG DAY 1 (Variation 1)
  {
    name: "Leg Day 1 - Hisham PPL",
    cycleDay: "legs1",
    variation: 1,
    exercises: [
      {
        name: "Leg Extensions",
        sets: [
          { reps: 20 },
          { reps: 20 },
          { reps: 20 },
          { reps: 20 },
          { reps: 15 },
          { reps: 15 },
        ],
        notes: "2 warm-up sets + 3 working sets",
      },
      {
        name: "Free Barbell Back Squats (Shoulder Width)",
        sets: [{ reps: 15 }, { reps: 12 }],
      },
      {
        name: "Narrow Leg Press",
        sets: [{ reps: 15 }, { reps: 12 }, { reps: 10 }],
      },
      {
        name: "Bulgarian Split Squats",
        sets: [{ reps: 15 }, { reps: 12 }],
      },
      {
        name: "Standing Calf Raises on Smith Machine",
        sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }],
      },
      {
        name: "Cable Rope Crunches",
        sets: [{ reps: 25 }, { reps: 20 }, { reps: 15 }],
        notes: "ABS Exercise",
      },
      {
        name: "Weighted Decline Crunches",
        sets: [{ reps: "15-12" }, { reps: "15-12" }, { reps: "15-12" }],
        notes: "ABS Exercise",
      },
      {
        name: "Weighted Leg Raises",
        sets: [{ reps: "15-12" }, { reps: "15-12" }, { reps: "15-12" }],
        notes: "ABS Exercise",
      },
    ],
  },

  // PUSH DAY 2 (Variation 2)
  {
    name: "Push Day 2 - Hisham PPL",
    cycleDay: "push2",
    variation: 2,
    exercises: [
      {
        name: "Dumbbell Shoulder Press",
        sets: [
          { reps: 20 },
          { reps: 15 },
          { reps: 15 },
          { reps: 12 },
          { reps: 10 },
        ],
        notes: "3 warm-up sets + 2 working sets",
      },
      { name: "Incline Dumbbell Press", sets: [{ reps: 12 }, { reps: 10 }] },
      {
        name: "Flat Machine Chest Press",
        sets: [{ reps: 12 }, { reps: 10 }],
      },
      { name: "Cable Cross", sets: [{ reps: 12 }, { reps: 10 }] },
      {
        name: "Side Lateral Raises",
        sets: [{ reps: 20 }, { reps: 15 }, { reps: 12 }],
      },
      {
        name: "Dumbbell Front Raises Neutral Grip",
        sets: [{ reps: 12 }, { reps: 12 }],
      },
      {
        name: "Machine Chest Dips",
        sets: [{ reps: 12 }, { reps: 12 }],
      },
      {
        name: "Narrow Grip EZ Bar Cable Push Down",
        sets: [{ reps: 20 }, { reps: 15 }],
      },
    ],
  },

  // PULL DAY 2 (Variation 2)
  {
    name: "Pull Day 2 - Hisham PPL",
    cycleDay: "pull2",
    variation: 2,
    exercises: [
      {
        name: "Reverse Grip Pulldown",
        sets: [
          { reps: 20 },
          { reps: 20 },
          { reps: 20 },
          { reps: 20 },
          { reps: 15 },
          { reps: 12 },
        ],
        notes: "3 warm-up sets + 3 working sets",
      },
      {
        name: "Low Pulley Narrow Cable Rows",
        sets: [{ reps: 12 }, { reps: 10 }, { reps: 10 }, { reps: 10 }],
        notes: "4 sets",
      },
      {
        name: "One Hand Dumbbell Rows",
        sets: [{ reps: 10 }, { reps: 10 }, { reps: 10 }],
      },
      { name: "DB Shrugs", sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }] },
      {
        name: "Reverse Pec Dec Rear Delt (Butterfly Machine)",
        sets: [{ reps: "12-15" }, { reps: "12-15" }, { reps: "12-15" }],
      },
      {
        name: "Horse EZ-Barbell Narrow Curls",
        sets: [{ reps: 12 }, { reps: 10 }],
      },
      {
        name: "Cable Hammer Curls",
        sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }],
      },
    ],
  },

  // LEG DAY 2 (Variation 2)
  {
    name: "Leg Day 2 - Hisham PPL",
    cycleDay: "legs2",
    variation: 2,
    exercises: [
      {
        name: "Heavy Hip Thrusts",
        sets: [
          { reps: 20 },
          { reps: 20 },
          { reps: 20 },
          { reps: "10-15" },
          { reps: "10-15" },
          { reps: "10-15" },
        ],
        notes: "3 warm-up sets + 3 working sets",
      },
      {
        name: "Leg Curls (Seated or Lying)",
        sets: [{ reps: 15 }, { reps: 12 }, { reps: 10 }, { reps: 8 }],
      },
      {
        name: "Romanian Deadlifts",
        sets: [{ reps: "8-12" }, { reps: "8-12" }, { reps: "8-12" }],
      },
      {
        name: "Machine Adduction",
        sets: [{ reps: "8-12" }, { reps: "8-12" }, { reps: "8-12" }],
      },
      {
        name: "Standing Calf Raises on Smith Machine",
        sets: [{ reps: 15 }, { reps: 15 }, { reps: 15 }, { reps: 15 }],
      },
      {
        name: "Decline Bench Crunches",
        sets: [{ reps: "15-20" }, { reps: "15-20" }, { reps: "15-20" }],
        notes: "ABS Exercise - 1 min rest",
      },
      {
        name: "Lying Leg Raises",
        sets: [{ reps: "15-20" }, { reps: "15-20" }],
        notes: "ABS Exercise - 1 min rest",
      },
      {
        name: "Cable Crunches",
        sets: [{ reps: "15-20" }, { reps: "15-20" }, { reps: "15-20" }],
        notes: "ABS Exercise",
      },
    ],
  },
];

export async function seedPPLWorkouts(): Promise<void> {
  try {
    // Check if Week 0 PPL workouts already exist
    const existingWorkouts = await databaseService.getWorkoutPlans();
    const week0PPLWorkouts = existingWorkouts.filter(
      (w) => w.name.includes("Hisham") && (w.cycleOccurrence ?? 0) === 0,
    );

    // Check if Week 0 is complete AND has correct exercise structure
    const needsReseeding =
      week0PPLWorkouts.length < PPL_WORKOUTS.length ||
      !isWeek0Correct(week0PPLWorkouts);

    // Only seed Week 0 if it doesn't exist or is incorrect
    if (needsReseeding) {
      // Delete ALL Week 0 entries to start fresh
      const allWeek0 = existingWorkouts.filter(
        (w) => (w.cycleOccurrence ?? 0) === 0,
      );
      for (const workout of allWeek0) {
        await databaseService.deleteWorkoutPlan(workout.id);
      }

      console.log("Seeding PPL workouts from Hisham Elmargoushy program...");

      for (const workoutData of PPL_WORKOUTS) {
        try {
          // Create workout plan
          const workoutId = await databaseService.createWorkoutPlan(
            workoutData.name,
            workoutData.cycleDay.includes("push")
              ? "push"
              : workoutData.cycleDay.includes("pull")
                ? "pull"
                : "legs",
            workoutData.variation,
            workoutData.cycleDay,
            workoutData.variation === 1
              ? ["push1", "pull1", "legs1"].indexOf(workoutData.cycleDay)
              : ["push2", "pull2", "legs2"].indexOf(workoutData.cycleDay),
            0, // cycleOccurrence
          );

          // Add exercises to workout
          for (let i = 0; i < workoutData.exercises.length; i++) {
            const exercise = workoutData.exercises[i];
            await databaseService.addExerciseToWorkout(workoutId, {
              name: exercise.name,
              orderIndex: i + 1,
              notes: exercise.notes || "",
              muscleGroup: "",
              equipment: "",
              difficulty: "intermediate",
            });

            // Get the exercise we just added to get its ID
            const exercises =
              await databaseService.getExercisesForWorkout(workoutId);
            const addedExercise = exercises.find(
              (e) => e.name === exercise.name,
            );

            if (addedExercise) {
              // Add sets to exercise
              for (let setNum = 0; setNum < exercise.sets.length; setNum++) {
                const setData = exercise.sets[setNum];
                const reps =
                  typeof setData.reps === "string"
                    ? parseInt(setData.reps.split("-")[0])
                    : setData.reps;

                const setId = await databaseService.addSetToExercise(
                  addedExercise.id,
                  setNum + 1,
                );

                // Update the set with reps (weight defaults to 0)
                await databaseService.updateSet(setId, reps, 0);

                // Mark this set as from seed (not deletable)
                await databaseService.markSetAsFromSeed(setId);
              }
            }
          }

          console.log(`✓ Created: ${workoutData.name}`);
        } catch (error) {
          console.error(`Error creating workout ${workoutData.name}:`, error);
        }
      }

      console.log("✓ Week 0 PPL workouts seeded successfully!");
    }

    // Now copy Week 0 to all other weeks (1-12)
    const allWorkouts = await databaseService.getWorkoutPlans();
    const currentWeek0 = allWorkouts.filter(
      (w) => (w.cycleOccurrence ?? 0) === 0,
    );

    if (currentWeek0.length > 0) {
      // Delete all workouts from weeks 1-12 to ensure clean copies
      const otherWeeks = allWorkouts.filter(
        (w) => (w.cycleOccurrence ?? 0) > 0,
      );
      for (const workout of otherWeeks) {
        await databaseService.deleteWorkoutPlan(workout.id);
      }

      // Copy Week 0 to weeks 1-12
      for (let week = 1; week <= 12; week++) {
        for (const sourceWorkout of currentWeek0) {
          const newWorkoutId = Date.now().toString() + Math.random();
          const createdAt = new Date().toISOString();

          await databaseService.createWorkoutPlan(
            sourceWorkout.name,
            sourceWorkout.type,
            sourceWorkout.variation,
            sourceWorkout.cycleDay,
            sourceWorkout.cycleOrder,
            week,
          );

          // Get the newly created workout to get its ID
          const allNewWorkouts = await databaseService.getWorkoutPlans();
          const newWorkout = allNewWorkouts.find(
            (w) =>
              w.name === sourceWorkout.name &&
              w.cycleDay === sourceWorkout.cycleDay &&
              (w.cycleOccurrence ?? 0) === week,
          );

          if (newWorkout && sourceWorkout.exercises) {
            // Copy exercises
            for (const sourceExercise of sourceWorkout.exercises) {
              await databaseService.addExerciseToWorkout(newWorkout.id, {
                name: sourceExercise.name,
                orderIndex: sourceExercise.orderIndex,
                notes: sourceExercise.notes,
                muscleGroup: sourceExercise.muscleGroup,
                equipment: sourceExercise.equipment,
                difficulty: sourceExercise.difficulty,
              });

              // Get the new exercise to copy sets
              const newExercises = await databaseService.getExercisesForWorkout(
                newWorkout.id,
              );
              const newExercise = newExercises.find(
                (e) => e.name === sourceExercise.name,
              );

              if (newExercise) {
                // Copy sets
                for (const sourceSet of sourceExercise.sets || []) {
                  const newSetId = await databaseService.addSetToExercise(
                    newExercise.id,
                    sourceSet.setNumber,
                  );

                  await databaseService.updateSet(
                    newSetId,
                    sourceSet.reps,
                    sourceSet.weight,
                  );

                  if (sourceSet.isFromSeed) {
                    await databaseService.markSetAsFromSeed(newSetId);
                  }
                }
              }
            }
          }
        }
      }

      console.log("✓ Week 0 copied to weeks 1-12!");
    }
  } catch (error) {
    console.error("Error seeding PPL workouts:", error);
  }
}

// Helper function to verify Week 0 has correct structure
function isWeek0Correct(week0Workouts: any[]): boolean {
  // Check Push Day 2 specifically for the first exercise with 5 sets
  const pushDay2 = week0Workouts.find((w) => w.cycleDay === "push2");

  if (!pushDay2 || !pushDay2.exercises) {
    return false;
  }

  // Check first exercise (Dumbbell Shoulder Press) should have 5 sets
  const firstExercise = pushDay2.exercises[0];
  if (!firstExercise || !firstExercise.sets) {
    return false;
  }

  // Should have exactly 5 sets
  return firstExercise.sets.length === 5;
}
