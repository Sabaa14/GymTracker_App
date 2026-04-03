// Add Exercise Screen - Browse and add exercises from database
import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { databaseService, exerciseDatabaseService } from "../services";
import { useExerciseDatabase } from "../hooks/useState";
import { useTheme } from "../hooks/useTheme";

export default function AddExerciseScreen({ route, navigation }: any) {
  const { workoutId, onAdd } = route.params;
  const theme = useTheme();
  const {
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
  } = useExerciseDatabase();

  const handleSelectExercise = async (exercise: any) => {
    const exerciseId = await databaseService.addExerciseToWorkout(workoutId, {
      name: exercise.name,
      orderIndex: 0,
      notes: "",
      muscleGroup: exercise.muscleGroup,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
    });

    if (onAdd) onAdd();
    navigation.goBack();
  };

  const FilterChip = ({
    label,
    selected,
    onPress,
    theme,
  }: {
    label: string;
    selected: boolean;
    onPress: () => void;
    theme: any;
  }) => (
    <TouchableOpacity
      style={[
        styles.chip,
        selected
          ? { backgroundColor: theme.primary }
          : { backgroundColor: theme.border },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          selected ? { color: "#fff" } : { color: theme.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderExercise = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.exerciseItem, { backgroundColor: theme.surface }]}
      onPress={() => handleSelectExercise(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: theme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.exerciseMeta, { color: theme.textSecondary }]}>
          {item.muscleGroup} • {item.equipment}
        </Text>
      </View>
      <View
        style={[
          styles.difficultyBadge,
          {
            backgroundColor:
              item.difficulty === "beginner"
                ? theme.success
                : item.difficulty === "intermediate"
                  ? theme.warning
                  : theme.error,
          },
        ]}
      >
        <Text style={styles.difficultyText}>{item.difficulty}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: theme.surface }]}
      >
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.surfaceSecondary,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Search exercises..."
          placeholderTextColor={theme.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filtersContainer, { backgroundColor: theme.surface }]}
      >
        {/* Category Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textTertiary }]}>
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterChip
              label="All"
              selected={selectedCategory === "all"}
              onPress={() => setSelectedCategory("all")}
              theme={theme}
            />
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
                theme={theme}
              />
            ))}
          </ScrollView>
        </View>

        {/* Muscle Group Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textTertiary }]}>
            Muscle Group
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterChip
              label="All"
              selected={!selectedMuscleGroup}
              onPress={() => setSelectedMuscleGroup("")}
              theme={theme}
            />
            {muscleGroups.map((mg) => (
              <FilterChip
                key={mg}
                label={mg.charAt(0).toUpperCase() + mg.slice(1)}
                selected={selectedMuscleGroup === mg}
                onPress={() => setSelectedMuscleGroup(mg)}
                theme={theme}
              />
            ))}
          </ScrollView>
        </View>

        {/* Equipment Filter */}
        <View style={styles.filterSection}>
          <Text style={[styles.filterLabel, { color: theme.textTertiary }]}>
            Equipment
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <FilterChip
              label="All"
              selected={!selectedEquipment}
              onPress={() => setSelectedEquipment("")}
              theme={theme}
            />
            {equipmentTypes.map((eq) => (
              <FilterChip
                key={eq}
                label={eq.charAt(0).toUpperCase() + eq.slice(1)}
                selected={selectedEquipment === eq}
                onPress={() => setSelectedEquipment(eq)}
                theme={theme}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Results Count */}
      <View
        style={[
          styles.resultsHeader,
          { backgroundColor: theme.surfaceSecondary },
        ]}
      >
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
          {filteredExercises.length} exercises found
        </Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        contentContainerStyle={[
          styles.list,
          { backgroundColor: theme.background },
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  clearButton: { marginLeft: 12, padding: 8 },
  clearButtonText: { color: "#ff6b00", fontWeight: "600" },
  filtersContainer: { paddingTop: 0, paddingBottom: 8 },
  filterSection: { paddingHorizontal: 16, marginBottom: 8 },
  filterLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: { fontSize: 13 },
  resultsHeader: { padding: 12 },
  resultsCount: { fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
  exerciseItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 16, fontWeight: "600" },
  exerciseMeta: { marginTop: 4, fontSize: 13 },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
});
