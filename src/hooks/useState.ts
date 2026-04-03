// Custom hooks for state management
import { useState, useEffect, useCallback } from "react";
import {
  WorkoutPlan,
  WeightSuggestion,
  WeeklyRecommendation,
  WeeklySummary,
  WorkoutType,
  WorkoutVariation,
  CycleDay,
} from "../types";
import {
  databaseService,
  smartWeightSuggestionService,
  aiCoachService,
  settingsService,
  exerciseDatabaseService,
} from "../services";
import { ExerciseDatabaseEntry } from "../types";

// Hook for workout plans
export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await databaseService.getWorkoutPlans();
      setWorkouts(data);
    } catch (error) {
      console.error("Error loading workouts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWorkout = useCallback(
    async (
      name: string,
      type: WorkoutType,
      variation: WorkoutVariation = 1,
      cycleDay: CycleDay = "push1",
      cycleOrder: number = 0,
      cycleOccurrence: number = 0,
    ) => {
      await databaseService.createWorkoutPlan(
        name,
        type,
        variation,
        cycleDay,
        cycleOrder,
        cycleOccurrence,
      );
      await loadWorkouts();
    },
    [loadWorkouts],
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      await databaseService.deleteWorkoutPlan(id);
      await loadWorkouts();
    },
    [loadWorkouts],
  );

  const updateWorkoutNotes = useCallback(
    async (id: string, notes: string) => {
      await databaseService.updateWorkoutNotes(id, notes);
      await loadWorkouts();
    },
    [loadWorkouts],
  );

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return {
    workouts,
    loading,
    loadWorkouts,
    createWorkout,
    deleteWorkout,
    updateWorkoutNotes,
  };
};

// Hook for weight suggestions
export const useWeightSuggestions = () => {
  const [suggestions, setSuggestions] = useState<
    Record<string, WeightSuggestion>
  >({});

  const getSuggestion = useCallback(
    async (exerciseName: string): Promise<WeightSuggestion> => {
      if (suggestions[exerciseName]) {
        return suggestions[exerciseName];
      }

      const suggestion =
        await smartWeightSuggestionService.getSuggestedWeight(exerciseName);
      setSuggestions((prev) => ({ ...prev, [exerciseName]: suggestion }));
      return suggestion;
    },
    [suggestions],
  );

  const getProgression = useCallback(
    async (exerciseName: string): Promise<string> => {
      return await smartWeightSuggestionService.getWeightProgression(
        exerciseName,
      );
    },
    [],
  );

  return {
    getSuggestion,
    getProgression,
  };
};

// Hook for AI Coach
export const useAICoach = () => {
  const [recommendations, setRecommendations] = useState<
    WeeklyRecommendation[]
  >([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const recs = await aiCoachService.generateWeeklyRecommendations();
      const weeklySummary = await aiCoachService.getWeeklySummary();
      setRecommendations(recs);
      setSummary(weeklySummary);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommendations,
    summary,
    loading,
    generateRecommendations,
  };
};

// Hook for exercise database
export const useExerciseDatabase = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  const filteredExercises = exerciseDatabaseService.advancedSearch({
    query: searchText,
    category: selectedCategory,
    muscleGroup: selectedMuscleGroup,
    equipment: selectedEquipment,
    difficulty: selectedDifficulty,
  });

  const clearFilters = useCallback(() => {
    setSearchText("");
    setSelectedCategory("all");
    setSelectedMuscleGroup("");
    setSelectedEquipment("");
    setSelectedDifficulty("");
  }, []);

  const categories = exerciseDatabaseService.getCategories();
  const muscleGroups = exerciseDatabaseService.getMuscleGroups();
  const equipmentTypes = exerciseDatabaseService.getEquipmentTypes();
  const difficultyLevels = exerciseDatabaseService.getDifficultyLevels();

  return {
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,
    filteredExercises,
    clearFilters,
    categories,
    muscleGroups,
    equipmentTypes,
    difficultyLevels,
  };
};

// Hook for app settings
export const useSettings = () => {
  const [settings, setSettings] = useState({
    defaultRestTime: 90,
    enableVibration: true,
    enableSound: true,
    darkMode: false,
    notificationsEnabled: false,
  });

  const loadSettings = useCallback(async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  const updateSetting = useCallback(
    async (key: keyof typeof settings, value: any) => {
      await settingsService.saveSettings({ [key]: value });
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    updateSetting,
    loadSettings,
  };
};
