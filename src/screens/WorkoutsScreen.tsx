// Workouts Screen - Main workout list with cycle structure
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWorkouts } from "../hooks/useState";
import { useTheme } from "../hooks/useTheme";
import { workoutCycleService } from "../services/workoutCycle";
import { CycleDay, WorkoutPlan } from "../types";

export default function WorkoutsScreen({ navigation }: any) {
  const theme = useTheme();
  const { workouts, loading, createWorkout, deleteWorkout } = useWorkouts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCycleDay, setSelectedCycleDay] = useState<CycleDay>("push1");
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [cycleStructure, setCycleStructure] = useState<any[]>([]);
  const [currentCycleInfo, setCurrentCycleInfo] = useState<any>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    const loadCycleInfo = async () => {
      try {
        const structure = workoutCycleService.getCycleStructure();
        const current = await workoutCycleService.getCurrentCycleDay();
        setCycleStructure(structure);
        setCurrentCycleInfo(current);
        if (current && current.cycleOccurrence !== undefined) {
          setSelectedWeek(current.cycleOccurrence);
        }
      } catch (error) {
        console.error("Error loading cycle info:", error);
      }
    };

    loadCycleInfo();
  }, []);

  const handleCreateWorkout = async () => {
    if (!newWorkoutName.trim()) {
      Alert.alert("Error", "Please enter a workout name");
      return;
    }

    const cycleInfo = cycleStructure.find(
      (c) => c.cycleDay === selectedCycleDay,
    );

    try {
      await createWorkout(
        newWorkoutName,
        cycleInfo.type,
        cycleInfo.variation,
        selectedCycleDay,
        cycleInfo.cycleOrder,
        selectedWeek,
      );
      setShowCreateModal(false);
      setNewWorkoutName("");
    } catch (error) {
      Alert.alert("Error", "Failed to create workout");
      console.error(error);
    }
  };

  const handleDeleteWorkout = (id: string, name: string) => {
    // Check if this is a seeded workout from Hisham's program
    if (name.includes("Hisham")) {
      Alert.alert(
        "Cannot Delete",
        "This is a seeded workout from Hisham's program. You can only delete custom workouts.",
        [{ text: "OK", style: "default" }],
      );
      return;
    }

    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteWorkout(id),
        },
      ],
    );
  };

  // Get workouts for a specific cycle day and week
  const getWorkoutsForCycleDayAndWeek = (
    cycleDay: CycleDay,
    week: number,
  ): WorkoutPlan[] => {
    return workouts.filter(
      (w) => w.cycleDay === cycleDay && (w.cycleOccurrence ?? 0) === week,
    );
  };

  // Reorder cycle structure for display: Push1, Push2, Pull1, Pull2, Legs1, Legs2
  const getReorderedCycleStructure = (): any[] => {
    const days = cycleStructure;
    const reordered: any[] = [];

    const dayOrder = ["push1", "push2", "pull1", "pull2", "legs1", "legs2"];

    for (const dayType of dayOrder) {
      const dayInfo = days.find((d) => d.cycleDay === dayType);
      if (dayInfo) {
        reordered.push(dayInfo);
      }
    }

    return reordered;
  };

  // Calculate week date range
  const getWeekDateRange = (weekNumber: number): string => {
    const today = new Date();
    const currentYear = today.getFullYear();

    // Calculate the date for the selected week
    const jan1 = new Date(currentYear, 0, 1);
    const weekStartDate = new Date(
      currentYear,
      0,
      1 + weekNumber * 7 - jan1.getDay(),
    );
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    const formatDate = (date: Date) => {
      const month = date.toLocaleDateString("en-US", { month: "short" });
      const day = date.getDate();
      return `${month} ${day}`;
    };

    return `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}, ${currentYear}`;
  };

  const renderCycleDayCard = (cycleInfo: any) => {
    const workoutsForDay = getWorkoutsForCycleDayAndWeek(
      cycleInfo.cycleDay,
      selectedWeek,
    );
    const isCurrentDay =
      cycleInfo.cycleDay === currentCycleInfo?.cycleDay &&
      selectedWeek === (currentCycleInfo?.cycleOccurrence ?? 0);

    const handleDayCardPress = () => {
      navigation.navigate("DayExercises", {
        cycleDay: cycleInfo.cycleDay,
        displayName: cycleInfo.displayName,
        week: selectedWeek,
      });
    };

    return (
      <View
        key={cycleInfo.cycleDay}
        style={[styles.gridCard, { backgroundColor: theme.surface }]}
      >
        <TouchableOpacity
          style={[
            styles.cardHeader,
            {
              backgroundColor: isCurrentDay ? theme.primary : theme.border,
            },
          ]}
          onPress={handleDayCardPress}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: isCurrentDay ? "#fff" : theme.text },
            ]}
          >
            {cycleInfo.displayName}
          </Text>
          {isCurrentDay && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Now</Text>
            </View>
          )}
        </TouchableOpacity>

        <ScrollView style={styles.cardContent} nestedScrollEnabled>
          {workoutsForDay.length === 0 ? (
            <View style={styles.emptyCardPlaceholder}>
              <Text
                style={[styles.emptyCardText, { color: theme.textSecondary }]}
              >
                No workouts
              </Text>
            </View>
          ) : (
            workoutsForDay.map((workout) => (
              <TouchableOpacity
                key={workout.id}
                style={[
                  styles.miniWorkoutCard,
                  {
                    backgroundColor: theme.background,
                    borderLeftColor: workoutCycleService.getVariationColor(
                      workout.variation,
                    ),
                  },
                ]}
                onPress={() =>
                  navigation.navigate("WorkoutDetail", { workout })
                }
                onLongPress={() =>
                  handleDeleteWorkout(workout.id, workout.name)
                }
              >
                <Text
                  style={[styles.miniWorkoutName, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {workout.name}
                </Text>
                <Text
                  style={[
                    styles.miniExerciseCount,
                    { color: theme.textSecondary },
                  ]}
                >
                  {workout.exercises?.length || 0} ex.
                </Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity
            style={[styles.addCardButton, { borderColor: theme.primary }]}
            onPress={() => {
              setSelectedCycleDay(cycleInfo.cycleDay);
              setShowCreateModal(true);
            }}
          >
            <Text style={[styles.addCardButtonText, { color: theme.primary }]}>
              + Add
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Weekly Cycle
        </Text>
      </View>

      {/* Week Navigation */}
      <View style={[styles.weekNav, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[styles.weekButton, { borderColor: theme.border }]}
          onPress={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
          disabled={selectedWeek === 0}
        >
          <Text style={[styles.weekButtonText, { color: theme.primary }]}>
            ←
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.weekDisplay,
            { color: theme.text, borderColor: theme.border },
          ]}
        >
          {getWeekDateRange(selectedWeek)}
        </Text>

        <TouchableOpacity
          style={[styles.weekButton, { borderColor: theme.border }]}
          onPress={() => setSelectedWeek(selectedWeek + 1)}
        >
          <Text style={[styles.weekButtonText, { color: theme.primary }]}>
            →
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <Text style={{ color: theme.text }}>Loading...</Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          <FlatList
            data={getReorderedCycleStructure()}
            renderItem={({ item }) => renderCycleDayCard(item)}
            keyExtractor={(item) => item.cycleDay}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContent}
          />
        </View>
      )}

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Add Workout for{" "}
              {cycleStructure.find((c) => c.cycleDay === selectedCycleDay)
                ?.displayName || "this day"}
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              placeholder="Workout Name"
              placeholderTextColor={theme.textTertiary}
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewWorkoutName("");
                }}
              >
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleCreateWorkout}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,200,200,0.2)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weekNav: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,200,200,0.2)",
  },
  weekButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  weekButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  weekDisplay: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 25,
  },
  columnWrapper: {
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 40,
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 0,
    flexGrow: 1,
  },
  gridCard: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  emptyCardPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyCardText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  miniWorkoutCard: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    borderLeftWidth: 3,
  },
  miniWorkoutName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  miniExerciseCount: {
    fontSize: 11,
  },
  addCardButton: {
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    marginTop: 4,
  },
  addCardButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 14,
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
});
