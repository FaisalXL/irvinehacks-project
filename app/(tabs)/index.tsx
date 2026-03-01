import React, { useContext, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { Bell, Shield, Heart, Utensils, Activity } from "lucide-react-native";
import { AmbientOrb } from "../../src/components/AmbientOrb";
import { EmergencyContext } from "../_layout";
import { mockCurrentContext, mockQuickStats } from "../../src/data/mockContext";
import {
  stateThemes,
  colors,
  typography,
  shadows,
} from "../../src/constants/theme";
import type { PatientState } from "../../src/types";

const DEMO_STATES: PatientState[] = [
  "resting",
  "active",
  "eating",
  "confused",
];

const STAT_ICONS: Record<string, React.FC<{ color: string; size: number }>> = {
  heart: Heart,
  utensils: Utensils,
  activity: Activity,
};

export default function HomeScreen() {
  const { triggerEmergency } = useContext(EmergencyContext);
  const [currentContext, setCurrentContext] = useState(mockCurrentContext);
  const theme = stateThemes[currentContext.state];
  const { width } = useWindowDimensions();

  const [demoIndex, setDemoIndex] = useState(0);

  const cycleState = () => {
    const nextIndex = (demoIndex + 1) % DEMO_STATES.length;
    setDemoIndex(nextIndex);
    const nextState = DEMO_STATES[nextIndex];
    setCurrentContext((prev) => ({
      ...prev,
      state: nextState,
      summary: getDemoSummary(nextState),
      detail: getDemoDetail(nextState),
    }));
  };

  return (
    <LinearGradient
      colors={theme.gradient}
      locations={[0, 0.5, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Minimal header */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.date}>Saturday, February 28</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={cycleState}
              style={({ pressed }) => [
                styles.headerBtn,
                pressed && styles.headerBtnPressed,
              ]}
            >
              <Shield color={colors.sage} size={18} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.headerBtn,
                pressed && styles.headerBtnPressed,
              ]}
            >
              <Bell color={colors.text} size={18} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Orb fills the visual center */}
        <View style={styles.orbSection}>
          <AmbientOrb state={currentContext.state} />
        </View>

        {/* Floating glass card */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(700).springify().damping(20)}
          style={styles.glassCard}
        >
          {/* State badge */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.colors[0] + "18" },
              ]}
            >
              <View
                style={[styles.badgeDot, { backgroundColor: theme.colors[0] }]}
              />
              <Text style={[styles.badgeLabel, { color: theme.colors[0] }]}>
                {theme.label}
              </Text>
            </View>
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          {/* State summary */}
          <Text style={styles.summary}>{currentContext.summary}</Text>
          <Text style={styles.detail}>{currentContext.detail}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Inline stats */}
          <View style={styles.statsRow}>
            {mockQuickStats.map((stat) => {
              const Icon = STAT_ICONS[stat.iconName] ?? Activity;
              return (
                <View key={stat.label} style={styles.statItem}>
                  <Icon color={stat.color} size={15} />
                  <View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Updated time */}
          <Text style={styles.updatedText}>
            {"Updated " + currentContext.lastUpdated}
          </Text>
        </Animated.View>

        {/* Emergency test */}
        <Animated.View entering={FadeIn.delay(700).duration(400)}>
          <Pressable
            onPress={() =>
              triggerEmergency("Fall detected at 10:35 AM in the bathroom")
            }
            style={({ pressed }) => [
              styles.emergencyBtn,
              pressed && styles.emergencyBtnPressed,
            ]}
          >
            <Text style={styles.emergencyBtnText}>Test Emergency Alert</Text>
          </Pressable>
        </Animated.View>

        {/* Tab bar spacer */}
        <View style={styles.tabSpacer} />
      </SafeAreaView>
    </LinearGradient>
  );
}

function getDemoSummary(state: PatientState): string {
  const summaries: Record<PatientState, string> = {
    resting: "Mom is resting in the living room",
    active: "Mom is walking in the garden",
    eating: "Mom is having a meal",
    confused: "Mom seems a bit disoriented",
    emergency: "Fall detected — immediate attention needed",
  };
  return summaries[state];
}

function getDemoDetail(state: PatientState): string {
  const details: Record<PatientState, string> = {
    resting: "Sitting on the couch, watching TV. Calm and comfortable.",
    active: "Light physical activity outdoors. Steady gait, enjoying the sun.",
    eating: "At the kitchen table. Eating well this morning.",
    confused: "Paused in the hallway, possibly searching for something.",
    emergency: "Sudden impact detected. No movement for 15 seconds.",
  };
  return details[state];
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 6,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },
  orbSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },
  glassCard: {
    marginHorizontal: 18,
    backgroundColor: colors.glass,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 18,
    ...shadows.lg,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#27AE60" + "12",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#27AE60",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#27AE60",
    letterSpacing: 0.3,
  },
  summary: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
    opacity: 0.6,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  updatedText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 14,
    letterSpacing: 0.2,
  },
  emergencyBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 14,
  },
  emergencyBtnPressed: {
    opacity: 0.5,
  },
  emergencyBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.coral,
    letterSpacing: 0.2,
  },
  tabSpacer: {
    height: 90,
  },
});
