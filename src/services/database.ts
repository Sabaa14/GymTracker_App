// Database Service - SQLite for offline storage
import * as SQLite from "expo-sqlite";
import {
  WorkoutPlan,
  Exercise,
  ExerciseSet,
  WorkoutType,
  SetPerformance,
  ExerciseDatabaseEntry,
  CycleDay,
  WorkoutVariation,
  SetHistory,
} from "../types";

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly DB_VERSION = 2; // Increment when schema changes

  async init(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync("gymtracker.db");
    await this.createTables();
    await this.migrateTables();
    await this.checkAndUpdateSchema();
  }

  private async checkAndUpdateSchema(): Promise<void> {
    if (!this.db) return;

    try {
      // Force check and add all missing columns
      const setsTableInfo = await this.db.getAllAsync(
        "PRAGMA table_info(exercise_sets)",
      );
      const setsColumns = (setsTableInfo as any[]).map((col: any) => col.name);

      if (!setsColumns.includes("isFromSeed")) {
        console.log("Adding isFromSeed column to exercise_sets...");
        try {
          await this.db.execAsync(
            "ALTER TABLE exercise_sets ADD COLUMN isFromSeed INTEGER DEFAULT 0",
          );
          console.log("✓ isFromSeed column added");
        } catch (e) {
          console.log("isFromSeed column already exists or error:", e);
        }
      } else {
        console.log("✓ isFromSeed column already exists");
      }
    } catch (error) {
      console.error("Error checking schema:", error);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;

    // Workout Plans table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        variation INTEGER DEFAULT 1,
        cycleDay TEXT DEFAULT 'push1',
        cycleOrder INTEGER DEFAULT 0,
        cycleOccurrence INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL,
        lastCompletedAt TEXT,
        notes TEXT DEFAULT ''
      );
    `);

    // Exercises table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        orderIndex INTEGER NOT NULL,
        notes TEXT DEFAULT '',
        muscleGroup TEXT DEFAULT '',
        equipment TEXT DEFAULT '',
        difficulty TEXT DEFAULT '',
        workoutPlanId TEXT,
        FOREIGN KEY (workoutPlanId) REFERENCES workout_plans(id) ON DELETE CASCADE
      );
    `);

    // Exercise Sets table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_sets (
        id TEXT PRIMARY KEY,
        setNumber INTEGER NOT NULL,
        reps INTEGER DEFAULT 0,
        weight REAL DEFAULT 0,
        isCompleted INTEGER DEFAULT 0,
        completedAt TEXT,
        wasEasy INTEGER DEFAULT 0,
        wasHard INTEGER DEFAULT 0,
        failed INTEGER DEFAULT 0,
        exerciseId TEXT,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `);

    // Exercise Set History table - tracks previous cycle performance
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercise_set_history (
        id TEXT PRIMARY KEY,
        exerciseId TEXT NOT NULL,
        weight REAL DEFAULT 0,
        reps INTEGER DEFAULT 0,
        isCompleted INTEGER DEFAULT 0,
        completedAt TEXT NOT NULL,
        cycleOccurrence INTEGER DEFAULT 0,
        FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
      );
    `);

    // Custom Exercises table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS custom_exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        muscleGroup TEXT DEFAULT '',
        equipment TEXT DEFAULT '',
        difficulty TEXT DEFAULT '',
        category TEXT DEFAULT 'custom'
      );
    `);
  }

  private async migrateTables(): Promise<void> {
    if (!this.db) return;

    try {
      // Check and add missing columns to workout_plans table
      const tableInfo = await this.db.getAllAsync(
        "PRAGMA table_info(workout_plans)",
      );
      const columns = (tableInfo as any[]).map((col: any) => col.name);

      // Add missing columns if they don't exist
      if (!columns.includes("variation")) {
        try {
          await this.db.execAsync(
            "ALTER TABLE workout_plans ADD COLUMN variation INTEGER DEFAULT 1",
          );
        } catch (e) {
          console.log("variation column might exist");
        }
      }
      if (!columns.includes("cycleDay")) {
        try {
          await this.db.execAsync(
            "ALTER TABLE workout_plans ADD COLUMN cycleDay TEXT DEFAULT 'push1'",
          );
        } catch (e) {
          console.log("cycleDay column might exist");
        }
      }
      if (!columns.includes("cycleOrder")) {
        try {
          await this.db.execAsync(
            "ALTER TABLE workout_plans ADD COLUMN cycleOrder INTEGER DEFAULT 0",
          );
        } catch (e) {
          console.log("cycleOrder column might exist");
        }
      }
      if (!columns.includes("cycleOccurrence")) {
        try {
          await this.db.execAsync(
            "ALTER TABLE workout_plans ADD COLUMN cycleOccurrence INTEGER DEFAULT 0",
          );
        } catch (e) {
          console.log("cycleOccurrence column might exist");
        }
      }
      if (!columns.includes("lastCompletedAt")) {
        try {
          await this.db.execAsync(
            "ALTER TABLE workout_plans ADD COLUMN lastCompletedAt TEXT",
          );
        } catch (e) {
          console.log("lastCompletedAt column might exist");
        }
      }

      // Check and create exercise_set_history table if needed
      const tables = await this.db.getAllAsync<any>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='exercise_set_history'",
      );
      if (tables.length === 0) {
        await this.db.execAsync(`
          CREATE TABLE IF NOT EXISTS exercise_set_history (
            id TEXT PRIMARY KEY,
            exerciseId TEXT NOT NULL,
            weight REAL DEFAULT 0,
            reps INTEGER DEFAULT 0,
            isCompleted INTEGER DEFAULT 0,
            completedAt TEXT NOT NULL,
            cycleOccurrence INTEGER DEFAULT 0,
            FOREIGN KEY (exerciseId) REFERENCES exercises(id) ON DELETE CASCADE
          );
        `);
      }
    } catch (error) {
      console.error("Migration error:", error);
      // Don't throw - migration errors shouldn't break app startup
    }
  }

  // Workout Plan CRUD
  async createWorkoutPlan(
    name: string,
    type: WorkoutType,
    variation: WorkoutVariation = 1,
    cycleDay: CycleDay = "push1",
    cycleOrder: number = 0,
    cycleOccurrence: number = 0,
  ): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO workout_plans (id, name, type, variation, cycleDay, cycleOrder, cycleOccurrence, createdAt, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        type,
        variation,
        cycleDay,
        cycleOrder,
        cycleOccurrence,
        createdAt,
        "",
      ],
    );

    return id;
  }

  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<any>(
      "SELECT * FROM workout_plans ORDER BY createdAt DESC",
    );

    const workouts: WorkoutPlan[] = [];
    for (const row of rows) {
      const exercises = await this.getExercisesForWorkout(row.id);
      workouts.push({
        id: row.id,
        name: row.name,
        type: row.type as WorkoutType,
        variation: row.variation as WorkoutVariation,
        cycleDay: row.cycleDay as CycleDay,
        cycleOrder: row.cycleOrder,
        cycleOccurrence: row.cycleOccurrence,
        createdAt: row.createdAt,
        lastCompletedAt: row.lastCompletedAt,
        notes: row.notes || "",
        exercises,
      });
    }

    return workouts;
  }

  async deleteWorkoutPlan(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync("DELETE FROM workout_plans WHERE id = ?", [id]);
  }

  async updateWorkoutNotes(id: string, notes: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync("UPDATE workout_plans SET notes = ? WHERE id = ?", [
      notes,
      id,
    ]);
  }

  // Exercise CRUD
  async addExerciseToWorkout(
    workoutPlanId: string,
    exercise: Omit<Exercise, "id" | "workoutPlanId" | "sets">,
  ): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    const id = Date.now().toString();

    await this.db.runAsync(
      `INSERT INTO exercises (id, name, orderIndex, notes, muscleGroup, equipment, difficulty, workoutPlanId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exercise.name,
        exercise.orderIndex,
        exercise.notes,
        exercise.muscleGroup,
        exercise.equipment,
        exercise.difficulty,
        workoutPlanId,
      ],
    );

    return id;
  }

  async getExercisesForWorkout(workoutPlanId: string): Promise<Exercise[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<any>(
      "SELECT * FROM exercises WHERE workoutPlanId = ? ORDER BY orderIndex",
      [workoutPlanId],
    );

    const exercises: Exercise[] = [];
    for (const row of rows) {
      const sets = await this.getSetsForExercise(row.id);
      exercises.push({
        id: row.id,
        name: row.name,
        orderIndex: row.orderIndex,
        notes: row.notes || "",
        muscleGroup: row.muscleGroup || "",
        equipment: row.equipment || "",
        difficulty: row.difficulty || "",
        workoutPlanId: row.workoutPlanId,
        sets,
      });
    }

    return exercises;
  }

  async deleteExercise(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync("DELETE FROM exercises WHERE id = ?", [id]);
  }

  // Exercise Set CRUD
  async addSetToExercise(
    exerciseId: string,
    setNumber: number,
  ): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    const id = Date.now().toString();

    await this.db.runAsync(
      `INSERT INTO exercise_sets (id, setNumber, reps, weight, isCompleted, wasEasy, wasHard, failed, exerciseId)
       VALUES (?, ?, 0, 0, 0, 0, 0, 0, ?)`,
      [id, setNumber, exerciseId],
    );

    return id;
  }

  async getSetsForExercise(exerciseId: string): Promise<ExerciseSet[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<any>(
      "SELECT * FROM exercise_sets WHERE exerciseId = ? ORDER BY setNumber",
      [exerciseId],
    );

    return rows.map((row) => ({
      id: row.id,
      setNumber: row.setNumber,
      reps: row.reps,
      weight: row.weight,
      isCompleted: row.isCompleted === 1,
      completedAt: row.completedAt,
      wasEasy: row.wasEasy === 1,
      wasHard: row.wasHard === 1,
      failed: row.failed === 1,
      exerciseId: row.exerciseId,
      isFromSeed: row.isFromSeed === 1,
    }));
  }

  async updateSet(id: string, reps: number, weight: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync(
      "UPDATE exercise_sets SET reps = ?, weight = ? WHERE id = ?",
      [reps, weight, id],
    );
  }

  async completeSet(id: string, performance: SetPerformance): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const completedAt = new Date().toISOString();
    const wasEasy = performance === "easy" ? 1 : 0;
    const wasHard = performance === "hard" ? 1 : 0;
    const failed = performance === "failed" ? 1 : 0;

    await this.db.runAsync(
      `UPDATE exercise_sets 
       SET isCompleted = 1, completedAt = ?, wasEasy = ?, wasHard = ?, failed = ?
       WHERE id = ?`,
      [completedAt, wasEasy, wasHard, failed, id],
    );
  }

  async markSetAsFromSeed(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync(
      "UPDATE exercise_sets SET isFromSeed = 1 WHERE id = ?",
      [id],
    );
  }

  async deleteSet(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");
    await this.db.runAsync("DELETE FROM exercise_sets WHERE id = ?", [id]);
  }

  // History queries for AI Coach
  async getCompletedSetsForExercise(
    exerciseName: string,
  ): Promise<ExerciseSet[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<any>(
      `
      SELECT es.* FROM exercise_sets es
      JOIN exercises e ON es.exerciseId = e.id
      WHERE e.name = ? AND es.isCompleted = 1
      ORDER BY es.completedAt DESC
    `,
      [exerciseName],
    );

    return rows.map((row) => ({
      id: row.id,
      setNumber: row.setNumber,
      reps: row.reps,
      weight: row.weight,
      isCompleted: row.isCompleted === 1,
      completedAt: row.completedAt,
      wasEasy: row.wasEasy === 1,
      wasHard: row.wasHard === 1,
      failed: row.failed === 1,
      exerciseId: row.exerciseId,
    }));
  }

  async getAllCompletedSets(): Promise<any[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<any>(`
      SELECT es.*, e.name as exerciseName, e.muscleGroup, wp.type as workoutType
      FROM exercise_sets es
      JOIN exercises e ON es.exerciseId = e.id
      JOIN workout_plans wp ON e.workoutPlanId = wp.id
      WHERE es.isCompleted = 1
      ORDER BY es.completedAt DESC
    `);

    return rows;
  }

  async getRecentWorkouts(weeks: number = 4): Promise<WorkoutPlan[]> {
    if (!this.db) throw new Error("Database not initialized");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const rows = await this.db.getAllAsync<any>(
      "SELECT * FROM workout_plans WHERE createdAt >= ? ORDER BY createdAt DESC",
      [startDate.toISOString()],
    );

    const workouts: WorkoutPlan[] = [];
    for (const row of rows) {
      const exercises = await this.getExercisesForWorkout(row.id);
      workouts.push({
        id: row.id,
        name: row.name,
        type: row.type as WorkoutType,
        variation: row.variation as WorkoutVariation,
        cycleDay: row.cycleDay as CycleDay,
        cycleOrder: row.cycleOrder,
        cycleOccurrence: row.cycleOccurrence,
        createdAt: row.createdAt,
        lastCompletedAt: row.lastCompletedAt,
        notes: row.notes || "",
        exercises,
      });
    }

    return workouts;
  }

  // Get weekly stats
  async getThisWeekWorkouts(): Promise<WorkoutPlan[]> {
    if (!this.db) throw new Error("Database not initialized");

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const rows = await this.db.getAllAsync<any>(
      "SELECT * FROM workout_plans WHERE createdAt >= ? ORDER BY createdAt DESC",
      [startOfWeek.toISOString()],
    );

    const workouts: WorkoutPlan[] = [];
    for (const row of rows) {
      const exercises = await this.getExercisesForWorkout(row.id);
      workouts.push({
        id: row.id,
        name: row.name,
        type: row.type as WorkoutType,
        variation: row.variation as WorkoutVariation,
        cycleDay: row.cycleDay as CycleDay,
        cycleOrder: row.cycleOrder,
        cycleOccurrence: row.cycleOccurrence,
        createdAt: row.createdAt,
        lastCompletedAt: row.lastCompletedAt,
        notes: row.notes || "",
        exercises,
      });
    }

    return workouts;
  }

  // Get unique exercise names
  async getUniqueExerciseNames(): Promise<string[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<{ name: string }>(
      "SELECT DISTINCT name FROM exercises",
    );

    return rows.map((r) => r.name);
  }

  // Get exercise ID by name (for finding previous sessions)
  async getExerciseIdByName(name: string): Promise<string | null> {
    if (!this.db) throw new Error("Database not initialized");

    const row = await this.db.getFirstAsync<{ id: string }>(
      "SELECT id FROM exercises WHERE name = ? LIMIT 1",
      [name],
    );

    return row?.id || null;
  }

  // Cycle-related methods
  async saveSetHistory(
    exerciseId: string,
    weight: number,
    reps: number,
    isCompleted: boolean,
    cycleOccurrence: number,
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const id = Date.now().toString();
    const completedAt = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO exercise_set_history (id, exerciseId, weight, reps, isCompleted, completedAt, cycleOccurrence)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exerciseId,
        weight,
        reps,
        isCompleted ? 1 : 0,
        completedAt,
        cycleOccurrence,
      ],
    );
  }

  async getPreviousCycleHistory(
    exerciseId: string,
    previousCycleOccurrence: number,
  ): Promise<SetHistory[]> {
    if (!this.db) throw new Error("Database not initialized");

    const rows = await this.db.getAllAsync<any>(
      `SELECT weight, reps, isCompleted, completedAt, cycleOccurrence 
       FROM exercise_set_history 
       WHERE exerciseId = ? AND cycleOccurrence = ?
       ORDER BY completedAt DESC`,
      [exerciseId, previousCycleOccurrence],
    );

    return rows.map((row) => ({
      weight: row.weight,
      reps: row.reps,
      isCompleted: row.isCompleted === 1,
      completedAt: row.completedAt,
      cycleOccurrence: row.cycleOccurrence,
    }));
  }

  async markWorkoutCompleted(workoutId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const lastCompletedAt = new Date().toISOString();
    await this.db.runAsync(
      "UPDATE workout_plans SET lastCompletedAt = ? WHERE id = ?",
      [lastCompletedAt, workoutId],
    );
  }

  async getWorkoutByType(
    type: WorkoutType,
    variation: WorkoutVariation,
    cycleOccurrence: number,
  ): Promise<WorkoutPlan | null> {
    if (!this.db) throw new Error("Database not initialized");

    const row = await this.db.getFirstAsync<any>(
      "SELECT * FROM workout_plans WHERE type = ? AND variation = ? AND cycleOccurrence = ?",
      [type, variation, cycleOccurrence],
    );

    if (!row) return null;

    const exercises = await this.getExercisesForWorkout(row.id);

    return {
      id: row.id,
      name: row.name,
      type: row.type as WorkoutType,
      variation: row.variation as WorkoutVariation,
      cycleDay: row.cycleDay as CycleDay,
      cycleOrder: row.cycleOrder,
      cycleOccurrence: row.cycleOccurrence,
      createdAt: row.createdAt,
      lastCompletedAt: row.lastCompletedAt,
      notes: row.notes || "",
      exercises,
    };
  }

  async copyWorkoutsToWeeks(
    sourceCycleOccurrence: number,
    targetCycleOccurrences: number[],
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Get all workouts from source cycle
    const sourceWorkouts = await this.db.getAllAsync<any>(
      "SELECT * FROM workout_plans WHERE cycleOccurrence = ? ORDER BY cycleOrder",
      [sourceCycleOccurrence],
    );

    for (const targetOccurrence of targetCycleOccurrences) {
      for (const sourceWorkout of sourceWorkouts) {
        // Create new workout with target cycle occurrence
        const newWorkoutId = Date.now().toString() + Math.random();
        const createdAt = new Date().toISOString();

        await this.db.runAsync(
          `INSERT INTO workout_plans (id, name, type, variation, cycleDay, cycleOrder, cycleOccurrence, createdAt, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newWorkoutId,
            sourceWorkout.name,
            sourceWorkout.type,
            sourceWorkout.variation,
            sourceWorkout.cycleDay,
            sourceWorkout.cycleOrder,
            targetOccurrence,
            createdAt,
            sourceWorkout.notes || "",
          ],
        );

        // Get exercises from source workout
        const sourceExercises = await this.getExercisesForWorkout(
          sourceWorkout.id,
        );

        for (const sourceExercise of sourceExercises) {
          // Create new exercise in target workout
          const newExerciseId = Date.now().toString() + Math.random();

          await this.db.runAsync(
            `INSERT INTO exercises (id, name, orderIndex, notes, muscleGroup, equipment, difficulty, workoutPlanId)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newExerciseId,
              sourceExercise.name,
              sourceExercise.orderIndex,
              sourceExercise.notes,
              sourceExercise.muscleGroup,
              sourceExercise.equipment,
              sourceExercise.difficulty,
              newWorkoutId,
            ],
          );

          // Get sets from source exercise
          const sourceSets = sourceExercise.sets;

          for (const sourceSet of sourceSets) {
            // Create new set in target exercise
            const newSetId = Date.now().toString() + Math.random();

            await this.db.runAsync(
              `INSERT INTO exercise_sets (id, exerciseId, setNumber, reps, weight, isCompleted, completedAt, wasEasy, wasHard, failed, isFromSeed)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                newSetId,
                newExerciseId,
                sourceSet.setNumber,
                sourceSet.reps,
                sourceSet.weight,
                0, // not completed
                null, // no completedAt yet
                0, // not easy
                0, // not hard
                0, // not failed
                sourceSet.isFromSeed ? 1 : 0,
              ],
            );
          }
        }
      }
    }
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
