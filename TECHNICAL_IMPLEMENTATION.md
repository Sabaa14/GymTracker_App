# Workout Cycle System - Technical Implementation Guide

## Overview

This document describes the architecture and implementation of the 6-day workout cycle system.

## System Architecture

### Data Flow

```
App Start
  ↓
getCurrentCycleDay() → Get current cycle position
  ↓
WorkoutsScreen → Display all 6 days, highlight current
  ↓
User adds Workout → Create with cycle parameters
  ↓
User completes Workout → Update lastCompletedAt
  ↓
moveToNextCycleDay() → Advance cycle position, increment cycleOccurrence if needed
  ↓
Next week: Same workout displayed → getPreviousCycleHistory() shows last week's data
```

## Type System

### WorkoutVariation

```typescript
type WorkoutVariation = 1 | 2;
```

- Variation 1: Push 1, Pull 1, Legs 1
- Variation 2: Push 2, Pull 2, Legs 2

### CycleDay

```typescript
type CycleDay = "push1" | "pull1" | "legs1" | "push2" | "pull2" | "legs2";
```

Maps to cycle order 0-5.

### SetHistory Interface

```typescript
interface SetHistory {
  setHistoryId: string;
  exerciseId: string;
  weight: number;
  reps: number;
  completed: boolean;
  cycleOccurrence: number;
  dateCompleted: string;
}
```

### Updated Workout/Exercise Types

```typescript
interface WorkoutPlan {
  // ... existing fields ...
  variation?: WorkoutVariation;
  cycleDay?: CycleDay;
  cycleOrder?: number; // 0-5
  cycleOccurrence?: number; // Week counter
  lastCompletedAt?: string; // ISO timestamp
}

interface Exercise {
  // ... existing fields ...
  previousSetHistory?: SetHistory[];
}
```

## Services

### workoutCycle.ts Service

**Purpose**: Manage the 6-day cycle rotation and progression logic.

**Key Functions**:

```typescript
// Get current cycle state
getCurrentCycleDay(): {
  cycleDay: CycleDay;
  cycleOrder: number;
  variation: WorkoutVariation;
  cycleOccurrence: number;
}

// Move to next day in cycle
moveToNextCycleDay(): Promise<{
  newCycleDay: CycleDay;
  newCycleOrder: number;
  cycleAdvanced: boolean; // true if week boundary crossed (0→1)
}>

// Get all 6 days with metadata
getCycleStructure(): Array<{
  cycleDay: CycleDay;
  cycleOrder: number;
  variation: WorkoutVariation;
  displayName: string;
  dayNumber: number;
}>

// Find previous occurrence
getPreviousCycleDay(): {
  cycleDay: CycleDay;
  cycleOrder: number;
  cycleOccurrence: number;
}

// Get display color for variation
getVariationColor(variation: WorkoutVariation): string
// Returns: '#FF4444' for variation 1, '#20C997' for variation 2

// Normalize exercise names for comparison
areExercisesSame(name1: string, name2: string): boolean
// Removes case, spaces, special chars for comparison
```

### Database Service Updates

**New Methods**:

```typescript
// Save set history record
saveSetHistory(
  exerciseId: string,
  weight: number,
  reps: number,
  completed: boolean,
  cycleOccurrence: number
): Promise<SetHistory>

// Get previous cycle's data for same exercise
getPreviousCycleHistory(
  exerciseId: string,
  previousCycleOccurrence: number
): Promise<SetHistory[]>

// Mark workout as completed
markWorkoutCompleted(
  workoutId: string,
  cycleOccurrence: number
): Promise<void>
// Updates lastCompletedAt timestamp

// Find workouts by cycle position
getWorkoutByType(
  cycleDay: CycleDay,
  cycleOccurrence: number
): Promise<WorkoutPlan | null>

// Updated existing methods to include cycle fields
getWorkoutPlan(id: string): Promise<WorkoutPlan>
// Now returns all cycle-related fields

getAllWorkoutPlans(): Promise<WorkoutPlan[]>
// Now returns with cycle data organized by day
```

**Updated Create Method**:

```typescript
createWorkoutPlan(
  name: string,
  exercises: Exercise[],
  cycleDay: CycleDay,
  cycleOccurrence: number
): Promise<WorkoutPlan>
// Automatically calculates:
// - variation from cycleDay
// - cycleOrder from cycleDay
// - Sets lastCompletedAt to null initially
```

## UI Components

### WorkoutsScreen (Complete Redesign)

**Layout Structure**:

```
┌─────────────────────────────┐
│     WEEKLY CYCLE            │
│  Cycle 1 / Week 1           │
├─────────────────────────────┤
│ 🔴 PUSH DAY 1 (Current)     │ ← variation 1, red border
│ └─ [+] New Workout          │
│    ├─ "Push A" | Completed  │
│    └─ "Push B" | 3 days ago │
├─────────────────────────────┤
│ 🔵 PULL DAY 1               │ ← variation 1, teal border
│ └─ [+] New Workout          │
│    ├─ "Pull A" | Never      │
│    └─ "Pull B" | 7 days ago │
├─────────────────────────────┤
│ LEGS DAY 1                  │
│ └─ [+] New Workout          │
│    └─ "Legs A" | 5 days ago │
└─────────────────────────────┘
(... repeat for Push 2, Pull 2, Legs 2)
```

**Current Implementation**:

- Displays all 6 cycle days
- Shows current day highlighted
- Lists workouts per day
- Shows last completion date per workout
- Color-coded by variation
- Quick add button for each day

### WorkoutDetailScreen (To Be Enhanced)

**Needed Additions**:

1. Display previous week's weightings
2. Side-by-side exercise comparison
3. "Cycle Complete" button to advance to next day
4. Visual progress indicator (e.g., "Week 3 of this cycle")

**Example Implementation Points**:

```typescript
// In WorkoutDetailScreen component
const previousCycleData = await getPreviousCycleHistory(exerciseId);

// Display in UI:
<ExerciseComparison
  current={currentExercise}
  previous={previousCycleData}
/>

// After completing:
<TouchableOpacity onPress={() => markWorkoutCompleted(workoutId)}>
  <Text>Complete Workout & Move to Next Day</Text>
</TouchableOpacity>
```

### useWorkouts Hook

**Current Implementation**:

```typescript
const { workouts, loading, error } = useWorkouts();
```

**Needed Enhancement**:

```typescript
interface UseWorkoutsOptions {
  cycleDay?: CycleDay;
  cycleOccurrence?: number;
  includePreviousHistory?: boolean;
}

const {
  workouts,
  currentDay,
  cycleOccurrence,
  previousCycleData,
  loading,
  error,
} = useWorkouts(options);
```

## Database Schema Details

### workout_plans Table - New Columns

```sql
ALTER TABLE workout_plans ADD COLUMN variation INTEGER;
-- Values: 1 or 2
-- Used to color-code and group workouts

ALTER TABLE workout_plans ADD COLUMN cycleDay TEXT;
-- Values: 'push1', 'pull1', 'legs1', 'push2', 'pull2', 'legs2'
-- Determines position in weekly cycle

ALTER TABLE workout_plans ADD COLUMN cycleOrder INTEGER;
-- Values: 0-5
-- Derived from cycleDay for sorting

ALTER TABLE workout_plans ADD COLUMN cycleOccurrence INTEGER;
-- Values: 1, 2, 3...
-- Which week/cycle this workout belongs to

ALTER TABLE workout_plans ADD COLUMN lastCompletedAt TEXT;
-- ISO 8601 timestamp or NULL
-- Used to display "3 days ago" on UI
```

### exercise_set_history Table - New Table

```sql
CREATE TABLE exercise_set_history (
  setHistoryId TEXT PRIMARY KEY,
  exerciseId TEXT NOT NULL,
  weight REAL NOT NULL,
  reps INTEGER NOT NULL,
  completed BOOLEAN NOT NULL,
  cycleOccurrence INTEGER NOT NULL,
  dateCompleted TEXT NOT NULL,
  FOREIGN KEY(exerciseId) REFERENCES exercises(exerciseId)
);
```

## Cycle Progression Logic

### Current Cycle State Storage

Currently stored at service level (workoutCycle.ts).

**Options for Persistence**:

1. **App-level state** (React Context):
   - Simple, quick access
   - Resets on app restart (acceptable for daily cycles)

2. **Database** (recommended):
   - Persists across sessions
   - Can track historical cycles
   - More complex to query

3. **Device storage** (AsyncStorage):
   - Lightweight
   - Fast access

**Recommended**: Hybrid approach

- Store current cycle in memory/context
- Sync to database on completion
- Restore from database on app start

### Cycle Advancement Rules

```
Current State: day 0, occurrence 1
User completes Push Day 1 workout
  ↓
markWorkoutCompleted() called
  ↓
cycleDay advances: push1 → pull1 (order 0 → 1)
lastCompletedAt updated to current time
  ↓
Next day: day 1, occurrence 1

Continues until...

Current State: day 5 (legs2), occurrence 1
User completes Pull Day 2 workout
  ↓
markWorkoutCompleted() called
  ↓
cycleDay resets: legs2 → push1 (order 5 → 0)
cycleOccurrence increments: 1 → 2
lastCompletedAt updated
  ↓
Next day: day 0, occurrence 2
```

## Future Enhancement Points

### 1. Cycle Repeat Feature

```typescript
// Clone exercises from last week's same workout
async cloneWorkoutFromPreviousCycle(workoutId: string) {
  const previousVersion = await getWorkoutByType(
    cycleDay,
    cycleOccurrence - 1
  );

  // Copy exercises to new workout
}
```

### 2. Weight Comparison View

```typescript
interface ExerciseComparison {
  previousWeight: number;
  previousReps: number;
  currentTarget: number;
  progression: "up" | "same" | "down";
}
```

### 3. Analytics

```typescript
// Track progression across multiple cycles
getProgressionTrend(exerciseId: string): {
  week1: {weight: number, reps: number};
  week2: {weight: number, reps: number};
  week3: {weight: number, reps: number};
  trend: 'improving' | 'stable' | 'declining';
}
```

### 4. Notifications

```typescript
// Notify when current day's workout is ready
scheduleWorkoutReminder(cycleDay: CycleDay, time: string)
```

## Testing Checklist

- [ ] Cycle advancement from day 0 to 5, then back to 0 with increment
- [ ] Workouts grouped correctly by cycle day on WorkoutsScreen
- [ ] Color coding matches variation (red/teal)
- [ ] "Current" badge appears on correct day
- [ ] Last completed date displays correctly (days ago)
- [ ] Previous cycle history retrieves correct data
- [ ] Exercise name normalization works (e.g., "Bench Press" == "bench press")
- [ ] Creating workout assigns correct cycle parameters
- [ ] Updating workout preserves cycle information
- [ ] Database schema migrations apply successfully

## Debugging Tips

1. **Check current cycle state**:

   ```typescript
   const state = getCurrentCycleDay();
   console.log("Current:", state);
   ```

2. **Verify database**:

   ```sql
   SELECT * FROM workout_plans WHERE id = ?
   -- Check cycleDay, cycleOrder, lastCompletedAt, variation
   ```

3. **Test advancement**:

   ```typescript
   const before = getCurrentCycleDay();
   await markWorkoutCompleted(workoutId);
   const after = getCurrentCycleDay();
   // before.cycleOrder should be less than after.cycleOrder
   ```

4. **Monitor previous history queries**:
   ```typescript
   const previousData = await getPreviousCycleHistory(exerciseId);
   // Should return SetHistory[] from previous week
   ```

---

**Questions?** Check the CYCLE_USAGE_GUIDE.md for user-facing documentation.
