// Workout Cycle Service - Manages the weekly Push/Pull/Legs rotation
import { CycleDay, WorkoutType, WorkoutVariation, SetHistory } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

class WorkoutCycleService {
  private readonly CYCLE_ORDER: CycleDay[] = [
    "push1",
    "pull1",
    "legs1",
    "push2",
    "pull2",
    "legs2",
  ];

  // Map cycle day to workout type and variation
  private getCycleDetails(cycleDay: CycleDay): {
    type: WorkoutType;
    variation: WorkoutVariation;
  } {
    const map: Record<
      CycleDay,
      { type: WorkoutType; variation: WorkoutVariation }
    > = {
      push1: { type: "push", variation: 1 },
      pull1: { type: "pull", variation: 1 },
      legs1: { type: "legs", variation: 1 },
      push2: { type: "push", variation: 2 },
      pull2: { type: "pull", variation: 2 },
      legs2: { type: "legs", variation: 2 },
    };
    return map[cycleDay];
  }

  /**
   * Get the current cycle day and occurrence
   * Tracks when the last workout was completed and determines current position
   */
  async getCurrentCycleDay(): Promise<{
    cycleDay: CycleDay;
    cycleOrder: number;
    cycleOccurrence: number;
  }> {
    try {
      const lastCycleData = await AsyncStorage.getItem("lastCompletedCycle");
      const lastOccurrenceData = await AsyncStorage.getItem("cycleOccurrence");

      if (!lastCycleData || !lastOccurrenceData) {
        // First time - start with Push1
        await AsyncStorage.setItem("lastCompletedCycle", "push1");
        await AsyncStorage.setItem("cycleOccurrence", "0");
        await AsyncStorage.setItem("currentCycleIndex", "0");

        return {
          cycleDay: "push1",
          cycleOrder: 0,
          cycleOccurrence: 0,
        };
      }

      const lastCycleDay = lastCycleData as CycleDay;
      const currentOccurrence = parseInt(lastOccurrenceData);
      const currentIndex = parseInt(
        (await AsyncStorage.getItem("currentCycleIndex")) || "0",
      );

      return {
        cycleDay: lastCycleDay,
        cycleOrder: currentIndex,
        cycleOccurrence: currentOccurrence,
      };
    } catch (error) {
      console.error("Error getting current cycle day:", error);
      return {
        cycleDay: "push1",
        cycleOrder: 0,
        cycleOccurrence: 0,
      };
    }
  }

  /**
   * Move to the next cycle day
   * When we complete a workout, advance to the next day in the cycle
   */
  async moveToNextCycleDay(currentCycleDay: CycleDay): Promise<{
    nextCycleDay: CycleDay;
    nextCycleOrder: number;
    cycleOccurrence: number;
  }> {
    try {
      const currentIndex = this.CYCLE_ORDER.indexOf(currentCycleDay);
      let nextIndex = (currentIndex + 1) % 6;
      let nextOccurrence = await AsyncStorage.getItem("cycleOccurrence");
      let occurrence = parseInt(nextOccurrence || "0");

      // If we've cycled back to push1, increment the cycle occurrence (week count)
      if (nextIndex === 0 && currentIndex === 5) {
        occurrence += 1;
      }

      const nextCycleDay = this.CYCLE_ORDER[nextIndex];

      await AsyncStorage.setItem("lastCompletedCycle", nextCycleDay);
      await AsyncStorage.setItem("currentCycleIndex", nextIndex.toString());
      await AsyncStorage.setItem("cycleOccurrence", occurrence.toString());

      return {
        nextCycleDay,
        nextCycleOrder: nextIndex,
        cycleOccurrence: occurrence,
      };
    } catch (error) {
      console.error("Error moving to next cycle day:", error);
      return {
        nextCycleDay: "push1",
        nextCycleOrder: 0,
        cycleOccurrence: 0,
      };
    }
  }

  /**
   * Get the cycle day name for display
   */
  getCycleDayName(cycleDay: CycleDay): string {
    const names: Record<CycleDay, string> = {
      push1: "Push Day 1",
      pull1: "Pull Day 1",
      legs1: "Leg Day 1",
      push2: "Push Day 2",
      pull2: "Pull Day 2",
      legs2: "Leg Day 2",
    };
    return names[cycleDay];
  }

  /**
   * Get all workout days in a cycle with their details
   */
  getCycleStructure(): Array<{
    cycleDay: CycleDay;
    cycleOrder: number;
    type: WorkoutType;
    variation: WorkoutVariation;
    displayName: string;
  }> {
    return this.CYCLE_ORDER.map((cycleDay, index) => {
      const { type, variation } = this.getCycleDetails(cycleDay);
      return {
        cycleDay,
        cycleOrder: index,
        type,
        variation,
        displayName: this.getCycleDayName(cycleDay),
      };
    });
  }

  /**
   * Get the previous cycle day for a given day
   * Used to find the workout from the previous week for comparison
   */
  getPreviousCycleDay(currentCycleDay: CycleDay): CycleDay {
    const currentIndex = this.CYCLE_ORDER.indexOf(currentCycleDay);
    const previousIndex = (currentIndex - 1 + 6) % 6;
    return this.CYCLE_ORDER[previousIndex];
  }

  /**
   * Get same workout from previous occurrence
   * E.g., if doing Push1 in week 2, get Push1 from week 1
   */
  getSameWorkoutFromPreviousCycle(currentCycleDay: CycleDay): CycleDay {
    return currentCycleDay; // Same day in previous cycle
  }

  /**
   * Get display color for workout variation
   */
  getVariationColor(variation: WorkoutVariation): string {
    return variation === 1 ? "#FF6B6B" : "#4ECDC4";
  }

  /**
   * Check if two exercises are variations of the same exercise
   * (same name, potentially different per-session variations)
   */
  areExercisesSame(exercise1Name: string, exercise2Name: string): boolean {
    const normalize = (name: string) => name.toLowerCase().trim();
    return normalize(exercise1Name) === normalize(exercise2Name);
  }
}

export const workoutCycleService = new WorkoutCycleService();
