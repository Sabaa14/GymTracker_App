# Quick Implementation Checklist

## ✅ COMPLETED

- [x] Type system updated with cycle support
- [x] Database schema updated (5 new columns + new table)
- [x] workoutCycle.ts service created
- [x] Database service methods added
- [x] WorkoutsScreen redesigned with cycle display
- [x] Compiled without TypeScript errors

## 🚀 NEXT STEPS (In Priority Order)

### Step 1: Implement Cycle Advancement UI

**File**: `src/screens/WorkoutDetailScreen.tsx`

**Task**: Add button to complete workout and advance cycle

```typescript
// Add import
import { markWorkoutCompleted, moveToNextCycleDay } from '../services/workoutCycle';

// Add to component
const handleCompleteWorkout = async () => {
  try {
    // Mark this workout as completed
    await markWorkoutCompleted(workoutId, cycleOccurrence);

    // Advance to next cycle day
    const nextDay = await moveToNextCycleDay();

    Alert.alert(
      'Workout Complete!',
      `Moving to ${nextDay.displayName || nextDay.cycleDay}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Add button in render
<TouchableOpacity
  style={styles.completeButton}
  onPress={handleCompleteWorkout}
>
  <Text style={styles.buttonText}>Workout Complete ✓</Text>
</TouchableOpacity>
```

**Estimated Time**: 30 minutes

---

### Step 2: Add Previous Weight Display

**File**: `src/screens/WorkoutDetailScreen.tsx`

**Task**: Show previous week's weights alongside current exercises

```typescript
// Query previous cycle data
const { previousCycleData } = useWorkouts({
  cycleDay: currentCycleDay,
  cycleOccurrence: cycleOccurrence - 1,
  includePreviousHistory: true,
});

// Component to display comparison
<View style={styles.exerciseCard}>
  <Text>{exercise.name}</Text>

  {/* Current workout */}
  <View style={styles.setsContainer}>
    <Text style={styles.setHeader}>This Week</Text>
    {exercise.sets.map(set => (
      <Text key={set.id}>{set.reps}x {set.weight}lbs</Text>
    ))}
  </View>

  {/* Previous week comparison */}
  {previousCycleData[exercise.id] && (
    <View style={[styles.setsContainer, styles.previousWeek]}>
      <Text style={styles.setHeader}>Last Week</Text>
      {previousCycleData[exercise.id].map(set => (
        <Text key={set.setHistoryId} style={styles.previousText}>
          {set.reps}x {set.weight}lbs
        </Text>
      ))}
    </View>
  )}
</View>
```

**Estimated Time**: 45 minutes

---

### Step 3: Record Set History After Workout

**File**: `src/services/database.ts` and `src/screens/WorkoutDetailScreen.tsx`

**Task**: Save exercise performance to exercise_set_history table

```typescript
// In WorkoutDetailScreen, when saving completed sets
const saveWorkoutHistory = async (exercises: Exercise[]) => {
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (set.weight && set.reps) {
        await saveSetHistory(
          exercise.id,
          set.weight,
          set.reps,
          set.completed === true,
          cycleOccurrence,
        );
      }
    }
  }
};

// Call before markWorkoutCompleted
await saveWorkoutHistory(completedExercises);
```

**Database Integration**:

```typescript
// database.ts - new method signature
async saveSetHistory(
  exerciseId: string,
  weight: number,
  reps: number,
  completed: boolean,
  cycleOccurrence: number
): Promise<SetHistory> {
  // Insert into exercise_set_history table
  // Return the created record
}
```

**Estimated Time**: 30 minutes

---

### Step 4: Add Repeat Last Cycle Button

**File**: `src/screens/WorkoutsScreen.tsx`

**Task**: Quick clone button to duplicate last week's exercises

```typescript
// In the "+" button click handler for each day
const handleAddWorkout = async (cycleDay: CycleDay) => {
  // Show options: "Create New" or "Clone from Last Week"
  const options = ["Create New Workout", "Clone from Last Week", "Cancel"];

  Alert.alert("Add Workout", "Choose an option:", [
    { text: "Create New", onPress: () => navigateToCreate(cycleDay) },
    {
      text: "Clone Last Week",
      onPress: async () => {
        const lastWeek = await getWorkoutByType(cycleDay, cycleOccurrence - 1);
        if (lastWeek) {
          // Create new workout with same exercises
          const newWorkout = await createWorkoutPlan(
            lastWeek.name,
            JSON.parse(JSON.stringify(lastWeek.exercises)), // deep copy
            cycleDay,
            cycleOccurrence,
          );
          Alert.alert("Success", "Workout cloned!");
        } else {
          Alert.alert("No Previous", "No workout found for last week");
        }
      },
    },
    { text: "Cancel", onPress: () => {} },
  ]);
};
```

**Estimated Time**: 30 minutes

---

### Step 5: Add Cycle Analytics (Optional)

**File**: `src/services/database.ts` and new component

**Task**: Show progression graph across cycles

```typescript
// Get trend data
const getProgressionTrend = async (exerciseId: string) => {
  const result = await db.executeSql(
    `SELECT weight, reps, cycleOccurrence 
     FROM exercise_set_history 
     WHERE exerciseId = ? 
     ORDER BY cycleOccurrence`,
    [exerciseId],
  );

  // Group by cycle and calculate average weight
  return groupByCycle(result);
};
```

**Estimated Time**: 1-2 hours (depending on charting library)

---

## Implementation Order Recommendation

1. **First**: Step 1 (Cycle Advancement) - Core functionality
2. **Second**: Step 3 (Record History) - Data foundation
3. **Third**: Step 2 (Previous Weights) - User-facing feedback
4. **Fourth**: Step 4 (Clone Button) - Quality of life
5. **Fifth**: Step 5 (Analytics) - Nice to have

## Files to Modify

```
src/
├── screens/
│   ├── WorkoutDetailScreen.tsx      ← Add completion button, history display, recording
│   └── WorkoutsScreen.tsx            ← Add clone option (mostly done)
├── services/
│   ├── database.ts                   ← Add saveSetHistory, getPreviousCycleHistory
│   └── workoutCycle.ts               ✓ DONE
├── hooks/
│   └── useState.ts                   ← Possibly update useWorkouts hook
└── types/
    └── index.ts                      ✓ DONE
```

## Testing the Current Implementation

```typescript
// Quick test script
import {
  getCurrentCycleDay,
  moveToNextCycleDay,
} from "./services/workoutCycle";

// Test 1: Check current state
const current = getCurrentCycleDay();
console.log("Current cycle day:", current.cycleDay); // Should be 'push1'

// Test 2: Advance cycle
const next = await moveToNextCycleDay();
console.log("Next cycle day:", next.newCycleDay); // Should be 'pull1'

// Test 3: Create workout with cycle data
const workout = await createWorkoutPlan("My Push", [], "push1", 1);
console.log("Created workout:", {
  variation: workout.variation, // Should be 1
  cycleDay: workout.cycleDay, // Should be 'push1'
  cycleOrder: workout.cycleOrder, // Should be 0
});
```

## Common Gotchas & Solutions

### Issue: Exercises not showing previous weights

**Cause**: Exercise names don't match exactly
**Solution**: `areExercisesSame()` does normalization - verify it's being used

### Issue: Cycle doesn't advance after completion

**Cause**: `moveToNextCycleDay()` not called
**Solution**: Add to WorkoutDetailScreen completion handler

### Issue: Database schema migration fails

**Cause**: Old version of database.ts trying to query new columns
**Solution**: Ensure all components using workouts are updated together

### Issue: "Current" badge shows wrong day

**Cause**: `cycleOccurrence` not updated properly
**Solution**: Check `markWorkoutCompleted()` increments occurrence at boundary

---

**📞 Support**: Each step has comments indicating where to add code. Follow the patterns established in existing code (especially WorkoutsScreen) for consistent styling and structure.
