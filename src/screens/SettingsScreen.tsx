import {
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { KOFI_URL } from "../config";
import { colors, spacing, type } from "../theme";

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const openKofi = () => {
    Linking.openURL(KOFI_URL).catch(() => {
      /* リンクを開けない環境では黙って無視 */
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.cancel}>閉じる</Text>
        </Pressable>
        <Text style={styles.topTitle}>設定</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* 応援（Ko-fi）。「広告を消す」ではなく「作者を応援する」導線。 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>応援</Text>
        <Pressable style={styles.supportBtn} onPress={openKofi}>
          <Text style={styles.supportText}>☕ 作者をKo-fiで応援する</Text>
        </Pressable>
        <Text style={styles.note}>
          Be your own は基本無料です。応援は開発の力になります。
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>データ</Text>
        <Text style={styles.note}>
          記録はこの端末の中だけに保存されます。アカウントは不要です。
        </Text>
      </View>

      <Text style={styles.footer}>Be your own</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  cancel: { fontSize: type.body, color: colors.sub, width: 48 },
  topTitle: { fontSize: type.body, fontWeight: "700", color: colors.ink },

  section: { marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: type.label,
    color: colors.sub,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  supportBtn: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  supportText: { fontSize: type.body, fontWeight: "700", color: colors.ink },
  note: { fontSize: type.caption, color: colors.sub, marginTop: spacing.sm, lineHeight: 18 },

  footer: {
    marginTop: "auto",
    fontSize: type.caption,
    color: colors.sub,
    textAlign: "center",
  },
});
