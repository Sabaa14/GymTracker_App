// Smart Weight Suggestion Service - Offline AI Logic
import { databaseService } from "./database";
import {
  WeightSuggestion,
  WeightTrend,
  ConfidenceLevel,
  SetPerformance,
} from "../types";

class SmartWeightSuggestionService {
  // Get suggested weight based on history
  async getSuggestedWeight(exerciseName: string): Promise<WeightSuggestion> {
    const recentSets =
      await databaseService.getCompletedSetsForExercise(exerciseName);

    if (recentSets.length === 0) {
      return {
        suggestedWeight: 0,
        confidence: "low",
        trend: "stable",
        reasoning: "No workout history found",
        changeAmount: 0,
        recommendation: "Start with bodyweight or light weight",
      };
    }

    const completedSets = recentSets.filter((s) => s.isCompleted);
    if (completedSets.length === 0) {
      return {
        suggestedWeight: 0,
        confidence: "low",
        trend: "stable",
        reasoning: "No completed sets found",
        changeAmount: 0,
        recommendation: "Complete some sets first",
      };
    }

    // Get recent 3 sessions
    const recent3 = completedSets.slice(0, Math.min(3, completedSets.length));
    const lastWeight = completedSets[0]?.weight || 0;

    // Count performance
    const easyCount = recent3.filter((s) => s.wasEasy).length;
    const hardCount = recent3.filter((s) => s.wasHard).length;
    const failedCount = recent3.filter((s) => s.failed).length;

    // Calculate suggestion based on offline logic
    let suggestedWeight = lastWeight;
    let changeAmount = 0;

    if (easyCount >= 2 && failedCount === 0) {
      // Easy - increase weight
      const increase = lastWeight >= 100 ? 5 : 2.5;
      suggestedWeight = lastWeight + increase;
      changeAmount = increase;
    } else if (failedCount >= 1 && hardCount === 0) {
      // Failed - decrease weight
      const decrease = lastWeight >= 100 ? 5 : 2.5;
      suggestedWeight = Math.max(lastWeight - decrease, 0);
      changeAmount = -decrease;
    } else {
      // Hard or mixed - keep same
      suggestedWeight = lastWeight;
      changeAmount = 0;
    }

    // Calculate trend
    const trend = this.calculateTrend(recentSets);

    // Calculate confidence
    const confidence = this.calculateConfidence(recentSets.length);

    // Generate reasoning
    const reasoning = this.generateReasoning(
      easyCount,
      hardCount,
      failedCount,
      trend,
    );
    const recommendation = this.generateRecommendation(trend, suggestedWeight);

    return {
      suggestedWeight,
      confidence,
      trend,
      reasoning,
      changeAmount,
      recommendation,
    };
  }

  private calculateTrend(sets: any[]): WeightTrend {
    if (sets.length < 3) return "stable";

    const mid = Math.floor(sets.length / 2);
    const firstHalf = sets.slice(mid);
    const secondHalf = sets.slice(0, mid);

    const firstAvg =
      firstHalf.reduce((a, b) => a + b.weight, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((a, b) => a + b.weight, 0) / secondHalf.length;

    const diff = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (diff > 5) return "increasing";
    if (diff < -5) return "decreasing";
    return "stable";
  }

  private calculateConfidence(count: number): ConfidenceLevel {
    if (count >= 10) return "high";
    if (count >= 5) return "medium";
    return "low";
  }

  private generateReasoning(
    easyCount: number,
    hardCount: number,
    failedCount: number,
    trend: WeightTrend,
  ): string {
    const reasons: string[] = [];

    if (easyCount >= 2) reasons.push("recently easy");
    else if (failedCount >= 1) reasons.push("recently struggled");
    else if (hardCount >= 2) reasons.push("recently challenging");

    switch (trend) {
      case "increasing":
        reasons.push("steady progress");
        break;
      case "decreasing":
        reasons.push("weight declining");
        break;
      default:
        reasons.push("stable performance");
    }

    return reasons.join(", ");
  }

  private generateRecommendation(trend: WeightTrend, weight: number): string {
    if (weight === 0) {
      return "Start with bodyweight or light weight";
    }

    switch (trend) {
      case "increasing":
        return "Ready to progress - you've been improving!";
      case "decreasing":
        return "Consider reducing to build confidence";
      default:
        return "Maintain current weight for consistency";
    }
  }

  // Get weight progression display
  async getWeightProgression(exerciseName: string): Promise<string> {
    const sets =
      await databaseService.getCompletedSetsForExercise(exerciseName);

    if (sets.length < 2) return "No history";

    const first = sets[sets.length - 1].weight;
    const last = sets[0].weight;
    const change = last - first;

    if (change > 1) return `+${change.toFixed(1)}kg ↑`;
    if (change < -1) return `-${Math.abs(change).toFixed(1)}kg ↓`;
    return "Maintaining →";
  }
}

export const smartWeightSuggestionService = new SmartWeightSuggestionService();
export default smartWeightSuggestionService;
