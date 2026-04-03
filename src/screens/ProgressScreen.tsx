// Progress Screen - Charts and workout statistics
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart, BarChart } from "react-native-chart-kit";
import { databaseService } from "../services";
import { useTheme } from "../hooks/useTheme";

const screenWidth = Dimensions.get("window").width;

export default function ProgressScreen() {
  const theme = useTheme();
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [monthlyData, setMonthlyData] = useState<number[]>([0, 0, 0, 0]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    avgPerWorkout: 0,
    streakDays: 0,
  });

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      // Get last 7 days of workout counts
      const workouts = await databaseService.getRecentWorkouts(1);
      const weekly: number[] = [0, 0, 0, 0, 0, 0, 0];

      workouts.forEach((w: any) => {
        const day = new Date(w.createdAt).getDay();
        weekly[day]++;
      });

      setWeeklyData(weekly);

      // Monthly data (last 4 weeks)
      const monthly = [0, 0, 0, 0];
      workouts.forEach((w: any) => {
        const week = Math.floor(
          (new Date().getTime() - new Date(w.createdAt).getTime()) /
            (7 * 24 * 60 * 60 * 1000),
        );
        if (week < 4) monthly[3 - week]++;
      });
      setMonthlyData(monthly);

      // Calculate stats
      let totalVolume = 0;
      workouts.forEach((w: any) => {
        w.exercises?.forEach((e: any) => {
          e.sets?.forEach((s: any) => {
            if (s.isCompleted) {
              totalVolume += (s.weight || 0) * (s.reps || 0);
            }
          });
        });
      });

      setStats({
        totalWorkouts: workouts.length,
        totalVolume,
        avgPerWorkout:
          workouts.length > 0 ? Math.round(totalVolume / workouts.length) : 0,
        streakDays: Math.min(workouts.length, 7),
      });
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 0, ${opacity})`,
    labelColor: (opacity = 1) =>
      `rgba(${theme.text === "#ffffff" ? "200, 200, 200" : "102, 102, 102"}, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: "#ff6b00" },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView>
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#ff6b00" }]}>
              {stats.totalWorkouts}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Workouts
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#ff6b00" }]}>
              {(stats.totalVolume / 1000).toFixed(1)}k
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Volume (kg)
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#ff6b00" }]}>
              {stats.avgPerWorkout}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Avg Volume
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statValue, { color: "#ff6b00" }]}>
              {stats.streakDays}🔥
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Streak
            </Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            This Week
          </Text>
          <LineChart
            data={{
              labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              datasets: [{ data: weeklyData }],
            }}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Monthly Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>
            Last 4 Weeks
          </Text>
          <BarChart
            data={{
              labels: ["Week 4", "Week 3", "Week 2", "Week 1"],
              datasets: [{ data: monthlyData }],
            }}
            width={screenWidth - 48}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Tips</Text>
          <Text style={[styles.tipText, { color: theme.text }]}>
            • Log every workout to track your progress
          </Text>
          <Text style={[styles.tipText, { color: theme.text }]}>
            • Use the AI Coach for personalized recommendations
          </Text>
          <Text style={[styles.tipText, { color: theme.text }]}>
            • Aim for consistency over intensity
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  statCard: {
    width: "46%",
    borderRadius: 12,
    padding: 16,
    margin: "2%",
    alignItems: "center",
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 12, marginTop: 4 },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  chartTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  chart: { borderRadius: 12 },
  tipsCard: { borderRadius: 12, padding: 16, margin: 16, marginTop: 0 },
  tipsTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  tipText: { marginBottom: 8, lineHeight: 22 },
});
