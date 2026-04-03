# Workout Cycle System Usage Guide

## Overview

The Gym Checker app now uses a **6-day workout cycle** that repeats every week:

1. **Push Day 1** (Variation 1)
2. **Pull Day 1** (Variation 1)
3. **Legs Day 1** (Variation 1)
4. **Push Day 2** (Variation 2)
5. **Pull Day 2** (Variation 2)
6. **Legs Day 2** (Variation 2)

## Getting Started

### Step 1: Create Workouts for Each Cycle Day

1. Open the app - you'll see "Weekly Cycle" with all 6 days
2. "Push Day 1" will be highlighted as the **Current** day
3. Tap the **+** button next to "Push Day 1"
4. Enter your workout name (e.g., "Push A" or "Chest & Shoulders")
5. Add your exercises to this workout
6. Repeat for all remaining cycle days (Pull 1, Legs 1, Push 2, Pull 2, Legs 2)

### Step 2: Complete Workouts

1. Tap a workout from its cycle day section
2. You'll see all exercises for that specific workout
3. Log your sets, reps, and weights
4. After completing, tap "Workout Complete" button
   - This advances the system to the **next cycle day**
   - Records the completion timestamp

### Step 3: Track Weight Progression

- When you move to the **next occurrence** of a workout (e.g., next week's Push 1), previous weights are available
- The system automatically highlights exercises from the same cycle position
- Use this to aim for progressive overload:
  - More weight
  - More reps
  - Better form

## Key Features

### Color-Coded Workout Days

- **Red border**: Variation 1 (Push 1, Pull 1, Legs 1)
- **Teal border**: Variation 2 (Push 2, Pull 2, Legs 2)
- **Bright highlight**: Today's current cycle day

### Last Completed Date

Each workout card shows when it was last performed:

- Helps you see frequency
- Missing dates indicate skipped days
- Use this to monitor consistency

### Quick Navigation

- **+ Button**: Quickly add new workout to a cycle day
- **Tap Workout**: Opens detailed view with exercises
- **Cycle Info**: Shows current cycle day and week occurrence

## Exercise Set Tracking

### What Gets Tracked

- Weight used per set
- Reps completed per set
- Whether the set was completed
- Which cycle week it was performed

### Comparing to Previous Week

When viewing the same exercise in your next weekly occurrence:

1. Open the WorkoutDetailScreen (when implemented)
2. Scroll to see previous week's performance
3. Use this data to set new targets

## Example Weekly Flow

**Week 1:**

- Mon: Complete "Push A" (Push Day 1) - Sets: 3x8 @ 225 lbs
- Tue: Complete "Pull A" (Pull Day 1) - Sets: 4x6 @ 185 lbs
- Wed: Complete "Legs A" (Legs Day 1) - Sets: 4x8 @ 315 lbs
- Thu: Complete "Push B" (Push Day 2) - Different exercises
- Fri: Complete "Pull B" (Pull Day 2) - Different exercises
- Sat: Complete "Legs B" (Legs Day 2) - Different exercises

**Week 2:**

- Mon: Complete "Push A" again
  - See last week: 3x8 @ 225 lbs
  - Try to match or exceed → 3x9 @ 225 lbs or 3x8 @ 230 lbs
- Continue rotation...

## Database Tables

### workout_plans Table

New cycle-related columns:

- `variation`: 1 or 2 (which variation this workout is)
- `cycleDay`: 'push1', 'pull1', 'legs1', 'push2', 'pull2', 'legs2'
- `cycleOrder`: 0-5 (position in weekly cycle)
- `cycleOccurrence`: Week count for tracking which week this is
- `lastCompletedAt`: Timestamp of last completion

### exercise_set_history Table

Tracks all past set data:

- `setHistoryId`: Unique identifier
- `exerciseId`: Which exercise
- `weight`: Weight used
- `reps`: Reps completed
- `completed`: Was the set finished?
- `cycleOccurrence`: Which week this was
- `dateCompleted`: When it was done

## Common Scenarios

### Scenario 1: Same Exercise, Different Variations

If "Bench Press" appears in both Push 1 and Push 2:

- Track each separately (different cycle days)
- Variation 1 might be: 4x6 @ 315 lbs
- Variation 2 might be: 3x10 @ 275 lbs
- Pre-workout comparison shows last week's numbers for that specific day

### Scenario 2: Skipped a Day

- The cycle continues from where it was
- Next workout you complete advances the cycle
- No need to "catch up" - just continue the cycle

### Scenario 3: Rest Week

- Don't complete any workouts for a week
- Cycle occurrence counter pauses
- Resume when ready

## Future Features (Planned)

1. **Cycle Repeat Button**: Clone last week's exercises when creating identical workout
2. **Weight Comparison View**: Side-by-side comparison with previous week
3. **Cycle Analytics**: Charts showing progression over multiple weeks
4. **Notification**: Alert when cycle day is ready
5. **Auto-advance**: Option to auto-advance to next day at scheduled time

## Troubleshooting

### "Current" day is wrong

- Check `lastCompletedAt` field - should be recent
- Manually advance using the cycle service if needed

### Previous weights not showing

- Ensure previous workout was marked "Completed"
- Verify exercise names match exactly (normalized comparison used)
- Check `exercise_set_history` table in database

### Can't find a previous workout

- It might be on a different cycle day
- Use the color coding to identify which variation it's in
- Manually compare if auto-comparison isn't working

---

**Ready to start?** Open the app now and add your first Push Day 1 workout!
