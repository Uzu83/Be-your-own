import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getActivity } from "../../domain/activities";
import {
  allConversions,
  formatAmount,
  selectBestConversion,
} from "../../domain/conversion/convert";
import { BASE_UNIT, Cumulative } from "../../domain/types";
import { colors, spacing, type } from "../theme";

/** 分を「◯時間」や「◯時間◯分」に整形。 */
function formatDuration(min: number): string {
  if (min <= 0) return "0分";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h.toLocaleString("ja-JP")}時間`;
  return `${h.toLocaleString("ja-JP")}時間${m}分`;
}

export function DetailScreen({
  cumulative,
  onClose,
  onShare,
}: {
  cumulative: Cumulative;
  onClose: () => void;
  onShare: () => void;
}) {
  const activity = getActivity(cumulative.activityId)!;
  const best = selectBestConversion(cumulative.total, cumulative.metric);
  const ladder = allConversions(cumulative.total, cumulative.metric);
  const unit = BASE_UNIT[cumulative.metric];
  const hasSecondary =
    activity.secondaryMetric === "duration" && cumulative.secondaryTotal > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.cancel}>閉じる</Text>
        </Pressable>
        <Text style={styles.topTitle}>
          {activity.emoji} {activity.name}
        </Text>
        <Pressable onPress={onShare} hitSlop={12}>
          <Text style={styles.shareLink}>シェア</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 累積のヒーロー */}
        <View style={styles.heroRow}>
          <Text style={styles.hero}>{formatAmount(cumulative.total)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        {best && (
          <Text style={styles.best}>
            {best.reference.emoji} ＝ {best.headline}
          </Text>
        )}

        {/* メタ情報 */}
        <View style={styles.metaBox}>
          <Text style={styles.meta}>{cumulative.sessionCount} 回の積み重ね</Text>
          {cumulative.since && (
            <Text style={styles.meta}>{cumulative.since} から</Text>
          )}
          {hasSecondary && (
            <Text style={styles.meta}>
              合計 {formatDuration(cumulative.secondaryTotal)} 動いた
            </Text>
          )}
        </View>

        {/* 次のマイルストーン */}
        {best?.toNext != null && (
          <View style={styles.milestone}>
            <Text style={styles.milestoneLabel}>次のマイルストーン</Text>
            <Text style={styles.milestoneText}>
              {best.reference.name} {best.nextCount} {best.reference.counter}目まで
              あと {formatAmount(best.toNext)} {unit}
            </Text>
          </View>
        )}

        {/* 換算のはしご */}
        <Text style={styles.ladderTitle}>換算のはしご</Text>
        {ladder.map((c) => {
          const passed = c.count >= 1;
          return (
            <View key={c.reference.id} style={styles.ladderRow}>
              <Text style={[styles.ladderName, !passed && styles.dim]}>
                {c.reference.emoji}  {c.reference.name}
              </Text>
              <Text style={[styles.ladderCount, !passed && styles.dim]}>
                {passed ? "✓ " : ""}
                {c.countLabel} {c.reference.counter}分
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  cancel: { fontSize: type.body, color: colors.sub, width: 48 },
  topTitle: { fontSize: type.body, fontWeight: "700", color: colors.ink },
  shareLink: {
    fontSize: type.caption,
    color: colors.ink,
    textDecorationLine: "underline",
    width: 48,
    textAlign: "right",
  },

  scroll: { paddingBottom: spacing.xl },
  heroRow: { flexDirection: "row", alignItems: "flex-end", marginTop: spacing.md },
  hero: { fontSize: 64, fontWeight: "800", color: colors.ink, lineHeight: 64 },
  unit: { fontSize: 18, color: colors.ink, marginLeft: spacing.sm, marginBottom: spacing.sm },
  best: { fontSize: type.body, color: colors.ink, marginTop: spacing.md },

  metaBox: { marginTop: spacing.lg, gap: spacing.xs },
  meta: { fontSize: type.caption, color: colors.sub },

  milestone: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 14,
    padding: spacing.md,
  },
  milestoneLabel: { fontSize: type.label, color: colors.sub, letterSpacing: 1 },
  milestoneText: { fontSize: type.body, color: colors.ink, marginTop: spacing.xs, fontWeight: "600" },

  ladderTitle: {
    fontSize: type.label,
    color: colors.sub,
    letterSpacing: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  ladderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  ladderName: { fontSize: type.body, color: colors.ink },
  ladderCount: { fontSize: type.body, color: colors.ink, fontWeight: "600" },
  dim: { color: colors.sub, fontWeight: "400" },
});
