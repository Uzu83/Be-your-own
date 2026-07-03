import { StyleSheet, Text, View } from "react-native";

import { Conversion, formatAmount } from "../../domain/conversion/convert";
import { Activity, BASE_UNIT, Cumulative } from "../../domain/types";
import { colors, spacing } from "../theme";

/**
 * SNS 共有用のカード。白基調・黒サブのミニマル1枚。
 * この View を react-native-view-shot で画像化して共有する。
 * レイアウトは固定サイズ（正方形寄り）にして、どの端末でも同じ絵になるようにする。
 */
export function ShareCard({
  activity,
  cumulative,
  conversion,
}: {
  activity: Activity;
  cumulative: Cumulative;
  conversion: Conversion | null;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.brand}>Be your own</Text>

      <View style={styles.center}>
        <Text style={styles.activity}>
          {activity.emoji}  {activity.name}
        </Text>

        <View style={styles.heroRow}>
          <Text style={styles.hero}>{formatAmount(cumulative.total)}</Text>
          <Text style={styles.unit}>{BASE_UNIT[cumulative.metric]}</Text>
        </View>

        {conversion && (
          <View style={styles.conversionBox}>
            <Text style={styles.eq}>＝</Text>
            <Text style={styles.conversion}>
              {conversion.reference.emoji} {conversion.headline}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.footer}>
        {cumulative.sessionCount} 回の積み重ね
        {cumulative.since ? `　・　${cumulative.since} から` : ""}
      </Text>
    </View>
  );
}

/** 共有画像の一辺（px 相当）。正方形。 */
export const SHARE_CARD_SIZE = 340;

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_SIZE,
    height: SHARE_CARD_SIZE,
    backgroundColor: colors.bg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 1,
  },
  center: { alignItems: "flex-start" },
  activity: { fontSize: 14, color: colors.sub, letterSpacing: 1, marginBottom: spacing.sm },
  heroRow: { flexDirection: "row", alignItems: "flex-end" },
  hero: { fontSize: 64, fontWeight: "800", color: colors.ink, lineHeight: 64 },
  unit: { fontSize: 18, color: colors.ink, marginLeft: spacing.sm, marginBottom: spacing.sm },
  conversionBox: { flexDirection: "row", alignItems: "center", marginTop: spacing.md },
  eq: { fontSize: 18, color: colors.sub, marginRight: spacing.sm },
  conversion: { fontSize: 18, color: colors.ink, fontWeight: "600", flexShrink: 1 },
  footer: { fontSize: 12, color: colors.sub },
});
