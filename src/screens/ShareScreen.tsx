import { useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getActivity } from "../../domain/activities";
import { selectBestConversion } from "../../domain/conversion/convert";
import { Cumulative } from "../../domain/types";
import { ShareCard } from "../share/ShareCard";
import { shareCardImage } from "../share/shareImage";
import { colors, spacing, type } from "../theme";

export function ShareScreen({
  cumulative,
  onClose,
}: {
  cumulative: Cumulative;
  onClose: () => void;
}) {
  const activity = getActivity(cumulative.activityId)!;
  const conversion = selectBestConversion(cumulative.total, cumulative.metric);
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  const onShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await shareCardImage(cardRef);
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topRow}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.cancel}>閉じる</Text>
        </Pressable>
        <Text style={styles.topTitle}>シェア</Text>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.preview}>
        {/* collapsable=false を付けないと Android で captureRef が空になることがある */}
        <View ref={cardRef} collapsable={false} style={styles.cardShadow}>
          <ShareCard
            activity={activity}
            cumulative={cumulative}
            conversion={conversion}
          />
        </View>
      </View>

      <Pressable
        style={[styles.shareBtn, sharing && styles.shareBtnDisabled]}
        onPress={onShare}
        disabled={sharing}
      >
        <Text style={styles.shareText}>{sharing ? "準備中…" : "画像で共有"}</Text>
      </Pressable>
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

  preview: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardShadow: {
    // プレビューでカードの縁を見せる控えめな枠。共有画像自体には影響しない。
    borderWidth: 1,
    borderColor: colors.hairline,
  },

  shareBtn: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  shareBtnDisabled: { backgroundColor: colors.sub },
  shareText: { color: colors.bg, fontSize: type.body, fontWeight: "700" },
});
