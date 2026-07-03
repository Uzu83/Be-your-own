import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ACTIVITIES } from "../../domain/activities";
import { formatAmount, selectBestConversion } from "../../domain/conversion/convert";
import { BASE_UNIT, Cumulative } from "../../domain/types";
import { colors, spacing, type } from "../theme";

function ActivityCard({
  cumulative,
  onShare,
  onOpen,
}: {
  cumulative: Cumulative;
  onShare: () => void;
  onOpen: () => void;
}) {
  const activity = ACTIVITIES.find((a) => a.id === cumulative.activityId)!;
  const conversion = selectBestConversion(cumulative.total, cumulative.metric);
  const empty = cumulative.total <= 0;

  return (
    <Pressable
      style={styles.card}
      onPress={onOpen}
      disabled={empty}
      accessibilityLabel={`${activity.name}の詳細`}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardLabel}>
          {activity.emoji}  {activity.name}
        </Text>
        {!empty && (
          <Pressable onPress={onShare} hitSlop={8}>
            <Text style={styles.share}>シェア</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.heroRow}>
        <Text style={styles.hero}>{formatAmount(cumulative.total)}</Text>
        <Text style={styles.unit}>{BASE_UNIT[cumulative.metric]}</Text>
      </View>

      {empty ? (
        <Text style={styles.conversionMuted}>まだ、これから。</Text>
      ) : (
        conversion && (
          <Text style={styles.conversion}>
            {conversion.reference.emoji} ＝ {conversion.headline}
          </Text>
        )
      )}

      {!empty && (
        <Text style={styles.meta}>
          {cumulative.sessionCount} 回の積み重ね
          {conversion?.toNext != null &&
            `　・　次の${conversion.nextCount}${conversion.reference.counter}目まで ${formatAmount(
              conversion.toNext
            )} ${BASE_UNIT[cumulative.metric]}`}
        </Text>
      )}
    </Pressable>
  );
}

export function HomeScreen({
  cumulatives,
  onAdd,
  onShare,
  onSettings,
  onOpen,
}: {
  cumulatives: Record<string, Cumulative>;
  onAdd: () => void;
  onShare: (activityId: string) => void;
  onSettings: () => void;
  onOpen: (activityId: string) => void;
}) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Be your own</Text>
            <Pressable onPress={onSettings} hitSlop={8}>
              <Text style={styles.settings}>設定</Text>
            </Pressable>
          </View>
          <Text style={styles.subtitle}>あなたが積み上げてきた、事実。</Text>
        </View>

        {ACTIVITIES.map((a) => (
          <ActivityCard
            key={a.id}
            cumulative={cumulatives[a.id]}
            onShare={() => onShare(a.id)}
            onOpen={() => onOpen(a.id)}
          />
        ))}

        <Text style={styles.footer}>急かさない。ただ、積み上がっていく。</Text>
      </ScrollView>

      <Pressable style={styles.fab} onPress={onAdd} accessibilityLabel="記録する">
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 96 },
  header: { marginBottom: spacing.xl, marginTop: spacing.md },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settings: { fontSize: type.caption, color: colors.sub, textDecorationLine: "underline" },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink, letterSpacing: 0.5 },
  subtitle: { fontSize: type.body, color: colors.sub, marginTop: spacing.xs },

  card: {
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardLabel: {
    fontSize: type.label,
    color: colors.sub,
    letterSpacing: 1,
  },
  share: {
    fontSize: type.caption,
    color: colors.ink,
    textDecorationLine: "underline",
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
  conversion: { fontSize: type.body, color: colors.ink, marginTop: spacing.md },
  conversionMuted: { fontSize: type.body, color: colors.sub, marginTop: spacing.md },
  meta: { fontSize: type.caption, color: colors.sub, marginTop: spacing.sm },
  footer: {
    fontSize: type.caption,
    color: colors.sub,
    textAlign: "center",
    marginTop: spacing.xl,
  },

  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: colors.bg, fontSize: 28, lineHeight: 30, fontWeight: "300" },
});
