// AI Coach Screen - Weekly recommendations and insights
import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAICoach } from "../hooks/useState";
import { useTheme } from "../hooks/useTheme";

const screenWidth = Dimensions.get("window").width;

export default function AICoachScreen() {
  const theme = useTheme();
  const { recommendations, summary, loading, generateRecommendations } =
    useAICoach();

  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#f44336";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#666";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "frequency":
        return "📅";
      case "progression":
        return "📈";
      case "recovery":
        return "😴";
      case "balance":
        return "⚖️";
      case "achievement":
        return "🎯";
      default:
        return "💡";
    }
  };

  const renderRecommendation = (rec: any) => (
    <View
      key={rec.id}
      style={[styles.recommendationCard, { backgroundColor: theme.surface }]}
    >
      <View style={styles.recHeader}>
        <View style={styles.recIcon}>
          <Text style={styles.recIconText}>
            {getCategoryIcon(rec.category)}
          </Text>
        </View>
        <View style={styles.recMeta}>
          <Text style={[styles.recTitle, { color: theme.text }]}>
            {rec.title}
          </Text>
          <View style={styles.recBadges}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(rec.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {rec.priority.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: theme.border }]}>
              <Text style={[styles.typeText, { color: theme.textSecondary }]}>
                {rec.type}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={[styles.recDescription, { color: theme.text }]}>
        {rec.description}
      </Text>
      <Text style={[styles.recAction, { color: theme.textSecondary }]}>
        {rec.action}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={generateRecommendations}
          />
        }
      >
        {/* Weekly Summary */}
        {summary && (
          <View
            style={[styles.summaryCard, { backgroundColor: theme.surface }]}
          >
            <Text style={[styles.summaryTitle, { color: theme.text }]}>
              This Week
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryValue, { color: "#ff6b00" }]}>
                  {summary.totalWorkouts}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  Workouts
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryValue, { color: "#ff6b00" }]}>
                  {summary.newPersonalRecords}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  New Records
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryValue, { color: "#ff6b00" }]}>
                  {summary.consistencyScore > 0
                    ? `${Math.round(summary.consistencyScore * 100)}%`
                    : "0%"}
                </Text>
                <Text
                  style={[styles.summaryLabel, { color: theme.textSecondary }]}
                >
                  Consistency
                </Text>
              </View>
            </View>
            {summary.volumeChange !== 0 && (
              <Text
                style={[
                  styles.volumeChange,
                  { color: summary.volumeChange > 0 ? "#4caf50" : "#f44336" },
                ]}
              >
                {summary.volumeChange > 0 ? "+" : ""}
                {summary.volumeChange.toFixed(1)}kg volume change
              </Text>
            )}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recommendations
          </Text>
          {recommendations.length === 0 ? (
            <View
              style={[styles.emptyCard, { backgroundColor: theme.surface }]}
            >
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No recommendations yet
              </Text>
              <Text
                style={[styles.emptySubtext, { color: theme.textSecondary }]}
              >
                Complete some workouts to get personalized insights
              </Text>
            </View>
          ) : (
            recommendations.map(renderRecommendation)
          )}
        </View>

        {/* Weekly Quote */}
        <View style={[styles.quoteCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.quote, { color: theme.textSecondary }]}>
            "Progress, not perfection. Every workout counts." 💪
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32, paddingTop: 0 },

  summaryCard: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
    elevation: 2,
  },
  summaryTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  summaryStat: { alignItems: "center" },
  summaryValue: { fontSize: 24, fontWeight: "bold" },
  summaryLabel: { fontSize: 12, marginTop: 4 },
  volumeChange: { textAlign: "center", fontWeight: "600", fontSize: 14 },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 16 },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  recHeader: { flexDirection: "row", marginBottom: 12 },
  recIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ff6b00",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recIconText: { fontSize: 20 },
  recMeta: { flex: 1 },
  recTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  recBadges: { flexDirection: "row" },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  priorityText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: "bold" },
  recDescription: { marginBottom: 8, lineHeight: 20 },
  recAction: { fontStyle: "italic", fontSize: 14 },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  emptyText: { fontSize: 16, marginBottom: 8 },
  emptySubtext: { textAlign: "center" },
  quoteCard: {
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  quote: {
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
});
