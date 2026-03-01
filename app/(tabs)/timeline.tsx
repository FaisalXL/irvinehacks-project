import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { CalendarDays, Radio } from "lucide-react-native";
import { TimelineItem } from "../../src/components/TimelineItem";
import { mockTimeline } from "../../src/data/mockContext";
import { colors, typography, shadows } from "../../src/constants/theme";

export default function TimelineScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
          <View>
            <Text style={styles.title}>Activity</Text>
            <Text style={styles.subtitle}>{"Today's Timeline"}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.liveChip}>
              <Radio color="#27AE60" size={11} />
              <Text style={styles.liveText}>Live</Text>
            </View>
            <View style={styles.dateChip}>
              <CalendarDays color={colors.sage} size={14} />
              <Text style={styles.dateChipText}>Feb 28</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.summaryBar}
        >
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{mockTimeline.length}</Text>
            <Text style={styles.summaryLabel}>Events</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>8h 32m</Text>
            <Text style={styles.summaryLabel}>Tracked</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: "#27AE60" }]}>
              Normal
            </Text>
            <Text style={styles.summaryLabel}>Overall</Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {mockTimeline.map((entry, index) => (
            <TimelineItem
              key={entry.id}
              entry={entry}
              index={index}
              isLast={index === mockTimeline.length - 1}
            />
          ))}

          <View style={styles.timelineEnd}>
            <View style={styles.endLine} />
            <Text style={styles.endText}>
              Beginning of recorded activity
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    ...typography.greeting,
  },
  subtitle: {
    ...typography.subtitle,
    marginTop: 3,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#27AE60" + "12",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#27AE60",
    letterSpacing: 0.3,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.glass,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    ...shadows.sm,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.sage,
    letterSpacing: 0.2,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 22,
    ...shadows.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  summaryDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 4,
  },
  timelineEnd: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 10,
  },
  endLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
  },
  endText: {
    ...typography.caption,
    fontSize: 12,
  },
});
