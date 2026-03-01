import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";
import {
  Moon,
  Footprints,
  Utensils,
  CircleHelp,
  TriangleAlert,
} from "lucide-react-native";
import { stateThemes, colors, typography, shadows } from "../constants/theme";
import type { ContextEntry, PatientState } from "../types";

const STATE_ICONS: Record<
  PatientState,
  React.FC<{ color: string; size: number }>
> = {
  resting: Moon,
  active: Footprints,
  eating: Utensils,
  confused: CircleHelp,
  emergency: TriangleAlert,
};

const STATE_TINTS: Record<PatientState, string> = {
  resting: "#EDF4EC",
  active: "#FBF3EA",
  eating: "#EDF4EC",
  confused: "#F2EFF8",
  emergency: "#FDF0EF",
};

interface TimelineItemProps {
  entry: ContextEntry;
  index: number;
  isLast: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  entry,
  index,
  isLast,
}) => {
  const theme = stateThemes[entry.state];
  const dotColor = theme.colors[0];
  const IconComponent = STATE_ICONS[entry.state];
  const tint = STATE_TINTS[entry.state];

  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 60)
        .duration(450)
        .springify()
        .damping(20)}
      style={styles.container}
    >
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{entry.timestamp}</Text>
      </View>

      <View style={styles.dotColumn}>
        <View style={[styles.dot, { backgroundColor: dotColor }]}>
          <IconComponent color={colors.white} size={11} />
        </View>
        {!isLast && (
          <View style={[styles.line, { backgroundColor: dotColor + "20" }]} />
        )}
      </View>

      <View style={styles.contentColumn}>
        <View style={[styles.card, { backgroundColor: tint }]}>
          <View style={styles.cardHeader}>
            <View
              style={[styles.stateChip, { backgroundColor: dotColor + "18" }]}
            >
              <IconComponent color={dotColor} size={10} />
              <Text style={[styles.stateChipText, { color: dotColor }]}>
                {theme.label}
              </Text>
            </View>
          </View>
          <Text style={styles.summary}>{entry.summary}</Text>
          <Text style={styles.detail}>{entry.detail}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 2,
    minHeight: 90,
  },
  timeColumn: {
    width: 68,
    paddingTop: 18,
    alignItems: "flex-end",
    paddingRight: 14,
  },
  time: {
    ...typography.timelineTime,
  },
  dotColumn: {
    width: 28,
    alignItems: "center",
  },
  dot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    zIndex: 1,
    ...shadows.sm,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    borderRadius: 1,
  },
  contentColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 20,
    paddingBottom: 10,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stateChipText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summary: {
    ...typography.timelineTitle,
    marginBottom: 4,
  },
  detail: {
    ...typography.timelineDetail,
  },
});
