// Restore Service - Fix accidentally deleted sets and workouts
import { databaseService } from "./database";

export async function restoreDeletedSets(): Promise<void> {
  try {
    const workouts = await databaseService.getWorkoutPlans();

    // Find Push Day 1
    const pushDay1 = workouts.find(
      (w) => w.cycleDay === "push1" && w.name.includes("Hisham"),
    );

    if (!pushDay1) {
      console.log("Push Day 1 not found");
      return;
    }

    // Find Flat Bench Press exercise
    const benchPress = pushDay1.exercises.find(
      (e) => e.name === "Flat Bench Press",
    );

    if (!benchPress) {
      console.log("Flat Bench Press not found");
      return;
    }

    // Check if first 5 sets exist (should be 20, 20, 15, 15, 12 reps)
    const expectedFirstSetReps = [20, 20, 15, 15, 12];

    if (!benchPress.sets || benchPress.sets.length === 0) {
      // No sets at all, restore all 5
      console.log("Restoring Flat Bench Press sets...");
      for (let i = 0; i < expectedFirstSetReps.length; i++) {
        const setId = await databaseService.addSetToExercise(
          benchPress.id,
          i + 1,
        );
        await databaseService.updateSet(setId, expectedFirstSetReps[i], 0);
        await databaseService.markSetAsFromSeed(setId);
      }
      console.log("✓ Restored Flat Bench Press sets");
    } else if (benchPress.sets.length < expectedFirstSetReps.length) {
      // Some sets are missing, restore the missing ones
      console.log(
        `Restoring ${expectedFirstSetReps.length - benchPress.sets.length} missing sets...`,
      );
      for (
        let i = benchPress.sets.length;
        i < expectedFirstSetReps.length;
        i++
      ) {
        const setId = await databaseService.addSetToExercise(
          benchPress.id,
          i + 1,
        );
        await databaseService.updateSet(setId, expectedFirstSetReps[i], 0);
        await databaseService.markSetAsFromSeed(setId);
      }
      console.log("✓ Restored missing Flat Bench Press sets");
    } else {
      console.log("All Flat Bench Press sets present");
    }

    // Restore Push Day 2 if missing
    const pushDay2Exists = workouts.some(
      (w) => w.cycleDay === "push2" && w.name.includes("Hisham"),
    );

    if (!pushDay2Exists) {
      console.log("Push Day 2 not found, recreating...");
      await recreatePushDay2Workout();
    }
  } catch (error) {
    console.error("Error restoring deleted sets:", error);
  }
}

async function recreatePushDay2Workout(): Promise<void> {
  try {
    // Recreate Push Day 2 workout with all exercises
    const workoutId = await databaseService.createWorkoutPlan(
      "Push Day 2 - Hisham PPL",
      "push",
      2,
      "push2",
      3,
      0,
    );

    const exercises = [
      { name: "Dumbbell Shoulder Press", sets: [12, 10] },
      { name: "Incline Dumbbell Press", sets: [12, 10] },
      { name: "Flat Machine Chest Press", sets: [12, 10] },
      { name: "Cable Cross", sets: [12, 10] },
      { name: "Side Lateral Raises", sets: [20, 15, 12] },
      { name: "Dumbbell Front Raises Neutral Grip", sets: [12, 12] },
      { name: "Machine Chest Dips", sets: [12, 12] },
      { name: "Narrow Grip EZ Bar Cable Push Down", sets: [20, 15] },
    ];

    for (let i = 0; i < exercises.length; i++) {
      const exerciseData = exercises[i];
      const exerciseId = await databaseService.addExerciseToWorkout(workoutId, {
        name: exerciseData.name,
        orderIndex: i + 1,
        notes: i === 0 ? "3 warm-up sets (20-15-15)" : "",
        muscleGroup: "",
        equipment: "",
        difficulty: "intermediate",
      });

      // Add sets
      for (let j = 0; j < exerciseData.sets.length; j++) {
        const setId = await databaseService.addSetToExercise(exerciseId, j + 1);
        await databaseService.updateSet(setId, exerciseData.sets[j], 0);
        await databaseService.markSetAsFromSeed(setId);
      }
    }

    console.log("✓ Recreated Push Day 2 workout");
  } catch (error) {
    console.error("Error recreating Push Day 2:", error);
  }
}
