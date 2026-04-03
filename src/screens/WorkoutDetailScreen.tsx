// Workout Detail Screen - Clean table layout with set-by-set rest timer
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databaseService } from "../services";
import { RestTimer } from "../components/RestTimer";
import { Exercise, ExerciseSet } from "../types";
import { useTheme } from "../hooks/useTheme";

export default function WorkoutDetailScreen({ route, navigation }: any) {
  const theme = useTheme();
  const { workout } = route.params;
  const [exercises, setExercises] = useState<Exercise[]>(
    workout.exercises || [],
  );
  const [setValues, setSetValues] = useState<
    Record<string, { reps: number; weight: number }>
  >({});
  const [displayValues, setDisplayValues] = useState<Record<string, string>>(
    {},
  );
  const [previousWeights, setPreviousWeights] = useState<
    Record<string, Record<string, { reps: number; weight: number }>>
  >({});
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [restTimerSetId, setRestTimerSetId] = useState<string | null>(null);
  const [savedSets, setSavedSets] = useState<Set<string>>(new Set());

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (workoutStarted) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutStarted]);

  // Initialize set values and load previous weights
  useEffect(() => {
    const initialValues: Record<string, { reps: number; weight: number }> = {};
    const initialDisplay: Record<string, string> = {};
    exercises.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        initialValues[set.id] = { reps: set.reps, weight: set.weight };
        initialDisplay[set.id] = set.weight > 0 ? set.weight.toString() : "";
      });
    });
    setSetValues(initialValues);
    setDisplayValues(initialDisplay);

    // Load previous week's weights
    loadPreviousWeights();
  }, [exercises]);

  const loadPreviousWeights = async () => {
    const currentOccurrence = workout.cycleOccurrence ?? 0;
    if (currentOccurrence > 0) {
      const allWorkouts = await databaseService.getWorkoutPlans();
      const prevWorkout = allWorkouts.find(
        (w) =>
          w.type === workout.type &&
          w.variation === workout.variation &&
          (w.cycleOccurrence ?? 0) === currentOccurrence - 1,
      );

      if (prevWorkout) {
        const prevWeights: Record<
          string,
          Record<string, { reps: number; weight: number }>
        > = {};
        prevWorkout.exercises?.forEach((exercise) => {
          if (!prevWeights[exercise.name]) {
            prevWeights[exercise.name] = {};
          }
          exercise.sets?.forEach((set) => {
            prevWeights[exercise.name][set.setNumber.toString()] = {
              reps: set.reps,
              weight: set.weight,
            };
          });
        });
        setPreviousWeights(prevWeights);
      }
    }
  };

  const handleUpdateSet = async (
    setId: string,
    reps: number,
    weight: number,
  ) => {
    setSetValues((prev) => ({
      ...prev,
      [setId]: { reps, weight },
    }));
    await databaseService.updateSet(setId, reps, weight);
  };

  const handleConfirmSet = useCallback(async (setId: string) => {
    // Mark this set as saved
    setSavedSets((prev) => new Set(prev).add(setId));
    // Start rest timer for this set
    setRestTimerSetId(setId);
  }, []);

  const handleSkipRest = useCallback(() => {
    setRestTimerSetId(null);
  }, []);

  const handleExtendRest = useCallback(() => {
    // Timer will extend automatically in RestTimer component
    // Just keep the rest timer active
  }, []);

  const handleStartNextSet = useCallback(() => {
    setRestTimerSetId(null);
  }, []);

  const handleBeginWorkout = () => {
    setWorkoutStarted(true);
    setElapsedTime(0);
    setDisplayValues({}); // Clear display values to allow fresh input
  };

  const handleFinishWorkout = async () => {
    setWorkoutStarted(false);

    try {
      // Save all set values to database
      for (const exercise of exercises) {
        for (const set of exercise.sets || []) {
          const value = setValues[set.id];
          if (value) {
            await databaseService.updateSet(set.id, value.reps, value.weight);
          }
        }
      }

      // Mark workout as completed
      await databaseService.markWorkoutCompleted(workout.id);

      Alert.alert(
        "Success",
        `Workout saved! Duration: ${formatTime(elapsedTime)}`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to save workout");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!exercises.length) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            No exercises in this workout
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Header with Timer */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View style={styles.timerSection}>
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
            Duration
          </Text>
          <Text style={[styles.timerDisplay, { color: theme.primary }]}>
            {formatTime(elapsedTime)}
          </Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              !workoutStarted && { backgroundColor: theme.primary },
            ]}
            onPress={handleBeginWorkout}
            disabled={workoutStarted}
          >
            <Text
              style={[
                styles.headerBtnText,
                !workoutStarted && { color: "#fff" },
                workoutStarted && { color: theme.textSecondary },
              ]}
            >
              Begin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerBtn,
              workoutStarted && { backgroundColor: "#ff6b00" },
            ]}
            onPress={handleFinishWorkout}
            disabled={!workoutStarted}
          >
            <Text
              style={[
                styles.headerBtnText,
                workoutStarted && { color: "#fff" },
                !workoutStarted && { color: theme.textSecondary },
              ]}
            >
              Finish
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Workout Title */}
      <View
        style={[
          styles.titleSection,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Text style={[styles.workoutTitle, { color: theme.text }]}>
          {workout.name}
        </Text>
      </View>
      {/* Exercises Table */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseSection}>
            <Text
              style={[styles.exerciseName, { color: theme.primary }]}
              numberOfLines={2}
            >
              {exerciseIndex + 1}. {exercise.name}
            </Text>

            {/* Table Header */}
            <View
              style={[
                styles.tableHeader,
                {
                  backgroundColor: theme.surface,
                  borderBottomColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.headerCell, { color: theme.textSecondary }]}>
                Set
              </Text>
              <Text style={[styles.headerCell, { color: theme.textSecondary }]}>
                Weight (kg)
              </Text>
              <Text style={[styles.headerCell, { color: theme.textSecondary }]}>
                Reps
              </Text>
              <Text
                style={[styles.headerCell, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                ✓
              </Text>
              <Text
                style={[styles.headerCell, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                Previous
              </Text>
            </View>

            {/* Table Rows */}
            {(exercise.sets || []).map((set: ExerciseSet, setIndex: number) => {
              const prevWeight =
                previousWeights[exercise.name]?.[set.setNumber.toString()];
              const isSaved = savedSets.has(set.id);

              return (
                <View
                  key={set.id}
                  style={[
                    styles.tableRow,
                    {
                      borderBottomColor: theme.border,
                      backgroundColor: isSaved
                        ? theme.surface
                        : theme.background,
                    },
                  ]}
                >
                  <Text style={[styles.setNumberCell, { color: theme.text }]}>
                    {setIndex + 1}
                  </Text>

                  <TextInput
                    style={[
                      styles.inputCell,
                      {
                        color: theme.text,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    value={displayValues[set.id] || ""}
                    onChangeText={(text) => {
                      // Store raw display value
                      setDisplayValues((prev) => ({
                        ...prev,
                        [set.id]: text,
                      }));

                      // Parse for database storage
                      const normalized = text.replace(/,/g, ".");
                      const weight = parseFloat(normalized) || 0;

                      if (!isNaN(weight)) {
                        handleUpdateSet(
                          set.id,
                          setValues[set.id]?.reps || 0,
                          weight,
                        );
                      }
                    }}
                    editable={workoutStarted}
                    selectTextOnFocus
                  />

                  <TextInput
                    style={[
                      styles.inputCell,
                      {
                        color: theme.text,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                      },
                    ]}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={theme.textSecondary}
                    value={
                      setValues[set.id]?.reps > 0
                        ? setValues[set.id].reps.toString()
                        : ""
                    }
                    onChangeText={(text) => {
                      const cleaned = text.replace(/[^0-9]/g, "");
                      const reps = cleaned === "" ? 0 : parseInt(cleaned, 10);
                      if (!isNaN(reps)) {
                        handleUpdateSet(
                          set.id,
                          reps,
                          setValues[set.id]?.weight || 0,
                        );
                      }
                    }}
                    editable={workoutStarted}
                    selectTextOnFocus
                  />

                  <TouchableOpacity
                    style={[
                      styles.confirmButton,
                      {
                        backgroundColor: isSaved ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => handleConfirmSet(set.id)}
                    disabled={
                      !workoutStarted ||
                      (setValues[set.id]?.weight || 0) === 0 ||
                      (setValues[set.id]?.reps || 0) === 0
                    }
                  >
                    <Text
                      style={[
                        styles.confirmButtonText,
                        {
                          color: isSaved ? "#fff" : theme.textSecondary,
                        },
                      ]}
                    >
                      {isSaved ? "✓" : "○"}
                    </Text>
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.previousCell,
                      {
                        color: prevWeight
                          ? theme.textSecondary
                          : theme.textTertiary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {prevWeight
                      ? `${prevWeight.reps} × ${prevWeight.weight}`
                      : "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
      {/* Rest Timer Modal */}
      <RestTimer
        visible={restTimerSetId !== null}
        onSkip={handleSkipRest}
        onExtend={handleExtendRest}
        onStartNext={handleStartNextSet}
        restDuration={120}
        theme={theme}
      />{" "}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  timerSection: {
    alignItems: "center",
  },
  timerLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  timerDisplay: {
    fontSize: 20,
    fontWeight: "bold",
    minWidth: 50,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 60,
    alignItems: "center",
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exerciseSection: {
    marginBottom: 24,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  setNumberCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  inputCell: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    textAlign: "center",
    marginHorizontal: 2,
  },
  confirmButton: {
    flex: 0.7,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  previousCell: {
    flex: 1.2,
    fontSize: 11,
    textAlign: "center",
  },
});
