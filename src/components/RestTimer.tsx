// Rest Timer Component - Displays countdown timer for rest between sets
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from "react-native";

interface RestTimerProps {
  visible: boolean;
  onSkip: () => void;
  onExtend: () => void;
  onStartNext: () => void;
  restDuration?: number; // in seconds, default 120 (2 mins)
  theme: any;
}

export const RestTimer = ({
  visible,
  onSkip,
  onExtend,
  onStartNext,
  restDuration = 120,
  theme,
}: RestTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(restDuration);
  const [isRunning, setIsRunning] = useState(visible);
  const [totalDuration, setTotalDuration] = useState(restDuration);

  // Reset and start timer when visible changes to true
  useEffect(() => {
    if (visible) {
      setTimeLeft(restDuration);
      setTotalDuration(restDuration);
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }, [visible, restDuration]);

  // Timer countdown effect - only depends on isRunning state
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setIsRunning(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // When timer reaches 0, auto-complete
  useEffect(() => {
    if (timeLeft === 0 && visible) {
      const timer = setTimeout(() => {
        onStartNext();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, visible, onStartNext]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  const handleSkip = () => {
    setIsRunning(false);
    onSkip();
  };

  const handleExtend = () => {
    setTimeLeft((prev) => prev + 60); // Add 1 minute
    setTotalDuration((prev) => prev + 60);
    setIsRunning(true);
    onExtend();
  };

  const handlePause = () => {
    setIsRunning(!isRunning);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[styles.timerContainer, { backgroundColor: theme.surface }]}
        >
          {/* Progress Bar */}
          <View
            style={[
              styles.progressBar,
              { backgroundColor: theme.border, overflow: "hidden" },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: theme.primary || "#FF6B6B",
                },
              ]}
            />
          </View>

          {/* Timer Display */}
          <View style={styles.timerDisplay}>
            <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>
              Rest Time
            </Text>
            <Text style={[styles.timerText, { color: theme.text }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          {/* Vibrant Progress Circle */}
          <View style={styles.circleContainer}>
            <View
              style={[
                styles.circle,
                {
                  borderColor: theme.primary || "#FF6B6B",
                  backgroundColor: "transparent",
                },
              ]}
            >
              <Text style={[styles.circleText, { color: theme.text }]}>
                {Math.ceil((timeLeft / restDuration) * 100)}%
              </Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>⏭ Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.extendButton,
                { borderColor: theme.primary || "#FF6B6B" },
              ]}
              onPress={handleExtend}
            >
              <Text
                style={[
                  styles.extendButtonText,
                  { color: theme.primary || "#FF6B6B" },
                ]}
              >
                ⏱ +1 Min
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.startNextButton,
                { backgroundColor: theme.primary || "#FF6B6B" },
              ]}
              onPress={onStartNext}
            >
              <Text style={styles.startNextButtonText}>▶ Next Set</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.instruction, { color: theme.textSecondary }]}>
            Prepare for your next set
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  timerContainer: {
    width: "85%",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  progressBar: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    marginBottom: 30,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  timerDisplay: {
    marginBottom: 30,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    letterSpacing: 1,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: 2,
  },
  circleContainer: {
    marginBottom: 30,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    fontSize: 24,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    borderWidth: 2,
    borderColor: "#cc0000",
    backgroundColor: "transparent",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#cc0000",
  },
  extendButton: {
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  extendButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  startNextButton: {
    flex: 1,
  },
  startNextButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  pauseButton: {
    borderWidth: 2,
    borderColor: "#666",
    backgroundColor: "transparent",
  },
  instruction: {
    fontSize: 14,
    marginTop: 10,
    fontStyle: "italic",
  },
});
