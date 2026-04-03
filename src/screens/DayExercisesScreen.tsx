// Day Exercises Screen - Shows all exercises for a selected cycle day
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../hooks/useTheme";
import { databaseService } from "../services/database";
import { WorkoutPlan } from "../types";

export default function DayExercisesScreen({ navigation, route }: any) {
  const theme = useTheme();
  const { cycleDay, displayName, week } = route.params;
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [setValues, setSetValues] = useState<
    Record<string, { reps: number; weight: number }>
  >({});
  const [previousWeights, setPreviousWeights] = useState<
    Record<string, Record<string, { reps: number; weight: number }>>
  >({});

  useEffect(() => {
    loadWorkouts();
  }, [cycleDay, week]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const allWorkouts = await databaseService.getWorkoutPlans();
      const filtered = allWorkouts.filter(
        (w) =>
          w.cycleDay === cycleDay &&
          (w.cycleOccurrence ?? 0) === week &&
          w.name.includes("Hisham"),
      );
      setWorkouts(filtered);

      // Initialize setValues from loaded workouts
      const initialValues: Record<string, { reps: number; weight: number }> =
        {};
      filtered.forEach((workout) => {
        workout.exercises?.forEach((exercise) => {
          exercise.sets?.forEach((set) => {
            initialValues[set.id] = { reps: set.reps, weight: set.weight };
          });
        });
      });
      setSetValues(initialValues);

      // Load previous week's weights if this is not week 0
      if (week > 0) {
        const prevWeekWorkouts = allWorkouts.filter(
          (w) =>
            w.cycleDay === cycleDay &&
            (w.cycleOccurrence ?? 0) === week - 1 &&
            w.name.includes("Hisham"),
        );

        const prevWeights: Record<
          string,
          Record<string, { reps: number; weight: number }>
        > = {};
        prevWeekWorkouts.forEach((workout) => {
          workout.exercises?.forEach((exercise) => {
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
        });
        setPreviousWeights(prevWeights);
      }
    } catch (error) {
      console.error("Error loading workouts:", error);
      Alert.alert("Error", "Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  const handleSetUpdate = async (
    setId: string,
    reps: number,
    weight: number,
  ) => {
    // Update local state immediately for instant UI feedback
    setSetValues((prev) => ({
      ...prev,
      [setId]: { reps, weight },
    }));
    // Save to database asynchronously
    await databaseService.updateSet(setId, reps, weight);
  };

  const renderWorkoutItem = (workout: WorkoutPlan) => {
    return (
      <TouchableOpacity
        style={[
          styles.workoutItem,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        onPress={() => navigation.navigate("WorkoutDetail", { workout })}
      >
        <Text style={[styles.workoutName, { color: theme.text }]}>
          {workout.name}
        </Text>
        <Text style={[styles.exerciseInfo, { color: theme.textSecondary }]}>
          {workout.exercises?.length || 0} exercises
        </Text>
        {workout.lastCompletedAt && (
          <Text
            style={[styles.lastCompletedInfo, { color: theme.textTertiary }]}
          >
            Last: {new Date(workout.lastCompletedAt).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: theme.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Week {week + 1}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={{ color: theme.text }}>Loading exercises...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {workouts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No workouts scheduled for {displayName}
              </Text>
            </View>
          ) : (
            workouts.map((workout) => (
              <View key={workout.id}>
                {renderWorkoutItem(workout)}

                {/* Exercises List */}
                {workout.exercises && workout.exercises.length > 0 && (
                  <View
                    style={[
                      styles.exercisesContainer,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    {workout.exercises.map((exercise, index) => (
                      <View
                        key={exercise.id}
                        style={[
                          styles.exerciseCard,
                          {
                            backgroundColor: theme.surface,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <View style={styles.exerciseHeader}>
                          <Text
                            style={[
                              styles.exerciseIndex,
                              { color: theme.primary },
                            ]}
                          >
                            {index + 1}.
                          </Text>
                          <Text
                            style={[styles.exerciseName, { color: theme.text }]}
                            numberOfLines={2}
                          >
                            {exercise.name}
                          </Text>
                        </View>

                        {exercise.notes && (
                          <Text
                            style={[
                              styles.exerciseNotes,
                              { color: theme.textSecondary },
                            ]}
                          >
                            {exercise.notes}
                          </Text>
                        )}

                        {/* Sets for this exercise */}
                        <View style={styles.setsContainer}>
                          {exercise.sets && exercise.sets.length > 0 ? (
                            exercise.sets.map((set, setIndex) => (
                              <View
                                key={set.id}
                                style={[
                                  styles.setItem,
                                  {
                                    backgroundColor: theme.background,
                                    borderColor: theme.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.setNumber,
                                    { color: theme.text },
                                  ]}
                                >
                                  Set {setIndex + 1}:
                                </Text>

                                {/* Reps Input */}
                                <TextInput
                                  style={[
                                    styles.setInput,
                                    {
                                      color: theme.text,
                                      borderColor: theme.border,
                                    },
                                  ]}
                                  keyboardType="number-pad"
                                  placeholder="Reps"
                                  placeholderTextColor={theme.textSecondary}
                                  value={
                                    setValues[set.id]?.reps > 0
                                      ? setValues[set.id].reps.toString()
                                      : ""
                                  }
                                  onChangeText={(text) => {
                                    const cleanedText = text.replace(
                                      /[^0-9]/g,
                                      "",
                                    );
                                    const reps =
                                      cleanedText === ""
                                        ? 0
                                        : parseInt(cleanedText, 10);
                                    if (!isNaN(reps)) {
                                      handleSetUpdate(
                                        set.id,
                                        reps,
                                        setValues[set.id]?.weight || 0,
                                      );
                                    }
                                  }}
                                  editable={true}
                                  selectTextOnFocus={true}
                                />

                                {/* Weight Input */}
                                <TextInput
                                  style={[
                                    styles.setInput,
                                    {
                                      color: theme.text,
                                      borderColor: theme.border,
                                    },
                                  ]}
                                  keyboardType="decimal-pad"
                                  placeholder="kg"
                                  placeholderTextColor={theme.textSecondary}
                                  value={
                                    setValues[set.id]?.weight > 0
                                      ? setValues[set.id].weight.toString()
                                      : ""
                                  }
                                  onChangeText={(text) => {
                                    const cleanedText = text.replace(
                                      /[^0-9.]/g,
                                      "",
                                    );
                                    const weight =
                                      cleanedText === "" || cleanedText === "."
                                        ? 0
                                        : parseFloat(cleanedText);
                                    if (!isNaN(weight) || cleanedText === ".") {
                                      handleSetUpdate(
                                        set.id,
                                        setValues[set.id]?.reps || 0,
                                        weight,
                                      );
                                    }
                                  }}
                                  editable={true}
                                  selectTextOnFocus={true}
                                />

                                {/* Display Previous Weight */}
                                {previousWeights[exercise.name]?.[
                                  set.setNumber.toString()
                                ] && (
                                  <Text
                                    style={[
                                      styles.previousWeight,
                                      { color: theme.textSecondary },
                                    ]}
                                  >
                                    Previous:{" "}
                                    {
                                      previousWeights[exercise.name][
                                        set.setNumber.toString()
                                      ].reps
                                    }{" "}
                                    reps x{" "}
                                    {
                                      previousWeights[exercise.name][
                                        set.setNumber.toString()
                                      ].weight
                                    }{" "}
                                    kg
                                  </Text>
                                )}
                              </View>
                            ))
                          ) : (
                            <Text
                              style={[
                                styles.noSets,
                                { color: theme.textTertiary },
                              ]}
                            >
                              No sets scheduled
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 50,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  workoutItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  exerciseInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  lastCompletedInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  exercisesContainer: {
    marginBottom: 20,
  },
  exerciseCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  exerciseIndex: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 30,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  exerciseNotes: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: "italic",
  },
  setsContainer: {
    marginTop: 8,
    gap: 6,
  },
  setItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  setNumber: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 50,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    textAlign: "center",
    minWidth: 50,
  },
  previousWeight: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },
  setReps: {
    fontSize: 12,
    fontWeight: "600",
  },
  setWeight: {
    fontSize: 11,
  },
  noSets: {
    fontSize: 12,
    fontStyle: "italic",
    paddingVertical: 8,
  },
});
