import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { ACTIVITIES } from "./domain/activities";
import { BASE_UNIT, Cumulative } from "./domain/types";
import { formatAmount, selectBestConversion } from "./domain/conversion/convert";
import { colors, spacing, type } from "./src/theme";

/**
 * 仮の累積データ（永続化は次ステップ）。
 * 値は基準単位: 筋トレ=kg, 距離系=km。
 */
const SEED: Record<string, Cumulative> = {
  strength: { activityId: "strength", metric: "mass", total: 1400, secondaryTotal: 0, sessionCount: 42, since: "2025-09-01" },
  running: { activityId: "running", metric: "distance", total: 318, secondaryTotal: 1840, sessionCount: 56, since: "2025-04-12" },
  swimming: { activityId: "swimming", metric: "distance", total: 22, secondaryTotal: 610, sessionCount: 18, since: "2025-06-01" },
  cycling: { activityId: "cycling", metric: "distance", total: 540, secondaryTotal: 1320, sessionCount: 12, since: "2025-05-20" },
};

function ActivityCard({ cumulative }: { cumulative: Cumulative }) {
  const activity = ACTIVITIES.find((a) => a.id === cumulative.activityId)!;
  const conversion = selectBestConversion(cumulative.total, cumulative.metric);

  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>
        {activity.emoji}  {activity.name}
      </Text>

      <View style={styles.heroRow}>
        <Text style={styles.hero}>{formatAmount(cumulative.total)}</Text>
        <Text style={styles.unit}>{BASE_UNIT[cumulative.metric]}</Text>
      </View>

      {conversion && (
        <Text style={styles.conversion}>
          {conversion.reference.emoji} ＝ {conversion.headline}
        </Text>
      )}

      <Text style={styles.meta}>
        {cumulative.sessionCount} 回の積み重ね
        {conversion?.toNext != null &&
          `　・　次の${conversion.nextCount}${conversion.reference.counter}目まで ${formatAmount(
            conversion.toNext
          )} ${BASE_UNIT[cumulative.metric]}`}
      </Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Be your own</Text>
          <Text style={styles.subtitle}>あなたが積み上げてきた、事実。</Text>
        </View>

        {ACTIVITIES.map((a) => (
          <ActivityCard key={a.id} cumulative={SEED[a.id]} />
        ))}

        <Text style={styles.footer}>急かさない。ただ、積み上がっていく。</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.xl, marginTop: spacing.md },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink, letterSpacing: 0.5 },
  subtitle: { fontSize: type.body, color: colors.sub, marginTop: spacing.xs },

  card: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  cardLabel: {
    fontSize: type.label,
    color: colors.sub,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  heroRow: { flexDirection: "row", alignItems: "flex-end" },
  hero: {
    fontSize: type.hero,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: type.hero,
  },
  unit: {
    fontSize: type.body,
    color: colors.ink,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  conversion: {
    fontSize: type.body,
    color: colors.ink,
    marginTop: spacing.md,
  },
  meta: {
    fontSize: type.caption,
    color: colors.sub,
    marginTop: spacing.sm,
  },
  footer: {
    fontSize: type.caption,
    color: colors.sub,
    textAlign: "center",
    marginTop: spacing.xl,
  },
});
