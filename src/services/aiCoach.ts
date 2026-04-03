// AI Coach Service - Offline Analysis
import { databaseService } from './database';
import { WeeklyRecommendation, WeeklySummary } from '../types';

class AICoachService {
  async generateWeeklyRecommendations(): Promise<WeeklyRecommendation[]> {
    const recentWorkouts = await databaseService.getRecentWorkouts(4);
    const allSets = await databaseService.getAllCompletedSets();
    
    const recommendations: WeeklyRecommendation[] = [];
    
    // Frequency analysis
    const frequencyRec = this.analyzeFrequency(recentWorkouts);
    recommendations.push(frequencyRec);
    
    // Progress analysis
    const progressRecs = this.analyzeProgress(recentWorkouts, allSets);
    recommendations.push(...progressRecs);
    
    // Balance analysis
    const balanceRecs = this.analyzeBalance(allSets);
    recommendations.push(...balanceRecs);
    
    // Recovery recommendation
    const recoveryRec = this.generateRecoveryRecommendation(recentWorkouts);
    recommendations.push(recoveryRec);
    
    return recommendations;
  }

  async getWeeklySummary(): Promise<WeeklySummary> {
    const thisWeek = await databaseService.getThisWeekWorkouts();
    const lastWeek = await databaseService.getRecentWorkouts(1);
    
    const thisWeekVolume = this.calculateVolume(thisWeek);
    const lastWeekVolume = this.calculateVolume(lastWeek);
    const volumeChange = thisWeekVolume - lastWeekVolume;
    
    const personalRecords = await this.findPersonalRecords();
    
    return {
      totalWorkouts: thisWeek.length,
      previousWeekWorkouts: lastWeek.length,
      volumeChange,
      newPersonalRecords: personalRecords.length,
      streakDays: thisWeek.length,
      consistencyScore: Math.min(1, thisWeek.length / 3)
    };
  }

  private analyzeFrequency(workouts: any[]): WeeklyRecommendation {
    const workoutCount = workouts.length;
    const targetFrequency = 3;

    if (workoutCount < targetFrequency) {
      return {
        id: 'freq-low',
        type: 'frequency',
        title: 'Increase Workout Frequency',
        description: `You're at ${workoutCount}/${targetFrequency} workouts this week.`,
        action: `Schedule ${targetFrequency - workoutCount} more workouts`,
        priority: 'high',
        category: 'frequency'
      };
    } else if (workoutCount > targetFrequency + 1) {
      return {
        id: 'freq-high',
        type: 'recovery',
        title: 'Prioritize Recovery',
        description: `High frequency (${workoutCount} workouts). Ensure adequate rest.`,
        action: 'Add rest days between intense sessions',
        priority: 'medium',
        category: 'recovery'
      };
    } else {
      return {
        id: 'freq-perfect',
        type: 'achievement',
        title: 'Perfect Frequency! 🎯',
        description: `You're hitting ${targetFrequency} workouts consistently.`,
        action: 'Keep up the great work!',
        priority: 'low',
        category: 'achievement'
      };
    }
  }

  private analyzeProgress(workouts: any[], allSets: any[]): WeeklyRecommendation[] {
    const recs: WeeklyRecommendation[] = [];
    
    // Group sets by exercise name
    const exerciseMap = new Map<string, any[]>();
    allSets.forEach(set => {
      const name = set.exerciseName;
      if (!exerciseMap.has(name)) {
        exerciseMap.set(name, []);
      }
      exerciseMap.get(name)!.push(set);
    });

    // Analyze each exercise
    for (const [exerciseName, sets] of exerciseMap) {
      if (sets.length < 3) continue;

      const trend = this.analyzeTrend(sets);
      
      if (trend === 'declining') {
        recs.push({
          id: `declining-${exerciseName}`,
          type: 'exercise',
          title: `Address Decline: ${exerciseName}`,
          description: 'Performance dropped in recent sessions.',
          action: 'Reduce weight 10%, focus on form',
          priority: 'high',
          category: 'progression'
        });
      } else if (trend === 'plateauing') {
        recs.push({
          id: `plateau-${exerciseName}`,
          type: 'exercise',
          title: `Break Plateau: ${exerciseName}`,
          description: 'No progress in recent sessions.',
          action: 'Try different rep ranges or variations',
          priority: 'medium',
          category: 'progression'
        });
      }
    }

    return recs;
  }

  private analyzeBalance(allSets: any[]): WeeklyRecommendation[] {
    const recs: WeeklyRecommendation[] = [];
    
    const muscleGroups = new Set<string>();
    const categoryCounts = new Map<string, number>();
    
    allSets.forEach(set => {
      muscleGroups.add(set.muscleGroup);
      categoryCounts.set(set.muscleGroup, (categoryCounts.get(set.muscleGroup) || 0) + 1);
    });
    
    // Check for balance issues
    if (categoryCounts.size < 3) {
      recs.push({
        id: 'balance-muscle',
        type: 'exercise',
        title: 'Focus on Muscle Balance',
        description: 'Try to include exercises for different muscle groups.',
        action: 'Add variety to your workout routine',
        priority: 'medium',
        category: 'balance'
      });
    }
    
    return recs;
  }

  private generateRecoveryRecommendation(workouts: any[]): WeeklyRecommendation {
    if (workouts.length >= 3) {
      return {
        id: 'recovery-tips',
        type: 'recovery',
        title: 'Recovery Tips',
        description: 'Adequate rest is crucial for muscle growth.',
        action: 'Sleep 7-9 hours, stay hydrated, stretch',
        priority: 'medium',
        category: 'recovery'
      };
    }
    
    return {
      id: 'rest-day',
      type: 'recovery',
      title: 'Rest Day',
      description: 'Listen to your body and recover properly.',
      action: 'Take today off if feeling fatigued',
      priority: 'low',
      category: 'recovery'
    };
  }

  private analyzeTrend(sets: any[]): 'improving' | 'declining' | 'plateauing' | 'stable' {
    if (sets.length < 3) return 'stable';

    const mid = Math.floor(sets.length / 2);
    const firstHalf = sets.slice(mid);
    const secondHalf = sets.slice(0, mid);

    const firstAvg = firstHalf.reduce((a, b) => a + b.weight, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b.weight, 0) / secondHalf.length;

    const progressRate = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (progressRate > 5) return 'improving';
    if (progressRate < -5) return 'declining';
    if (Math.abs(progressRate) < 2) return 'plateauing';
    return 'stable';
  }

  private calculateVolume(workouts: any[]): number {
    let totalVolume = 0;
    
    workouts.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        exercise.sets?.forEach((set: any) => {
          if (set.isCompleted) {
            totalVolume += set.weight * set.reps;
          }
        });
      });
    });
    
    return totalVolume;
  }

  private async findPersonalRecords(): Promise<string[]> {
    const allSets = await databaseService.getAllCompletedSets();
    const exerciseRecords = new Map<string, number>();
    
    allSets.forEach(set => {
      const name = set.exerciseName;
      const current = exerciseRecords.get(name) || 0;
      if (set.weight > current) {
        exerciseRecords.set(name, set.weight);
      }
    });
    
    return Array.from(exerciseRecords.entries())
      .filter(([_, weight]) => weight > 0)
      .map(([name, weight]) => `${name}: ${weight.toFixed(1)}kg`);
  }
}

export const aiCoachService = new AICoachService();
export default aiCoachService;