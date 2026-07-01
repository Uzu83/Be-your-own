import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ACTIVITIES, getActivity } from "../../domain/activities";
import { strengthVolume } from "../../domain/aggregate";
import { Session } from "../../domain/types";
import { colors, spacing, type } from "../theme";
import { today } from "../useSessions";

/** 数値入力欄。空文字は 0 扱い。 */
function NumberField({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.sub}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const num = (s: string) => {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
};

export function RecordScreen({
  onSave,
  onCancel,
}: {
  onSave: (input: Omit<Session, "id">) => void;
  onCancel: () => void;
}) {
  const [activityId, setActivityId] = useState(ACTIVITIES[0].id);
  const activity = getActivity(activityId)!;
  const isStrength = activity.metric === "mass";

  // 筋トレ用
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState("");
  // 距離系用
  const [distance, setDistance] = useState("");
  const [minutes, setMinutes] = useState("");

  const volume = isStrength ? strengthVolume(num(weight), num(reps), num(sets)) : 0;
  const value = isStrength ? volume : num(distance);
  const secondaryValue = isStrength ? undefined : num(minutes) || undefined;
  const canSave = value > 0;

  const save = () => {
    if (!canSave) return;
    onSave({ activityId, date: today(), value, secondaryValue });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={onCancel} hitSlop={12}>
            <Text style={styles.cancel}>キャンセル</Text>
          </Pressable>
          <Text style={styles.topTitle}>記録する</Text>
          <View style={{ width: 64 }} />
        </View>

        {/* 種目の選択 */}
        <View style={styles.pills}>
          {ACTIVITIES.map((a) => {
            const active = a.id === activityId;
            return (
              <Pressable
                key={a.id}
                onPress={() => setActivityId(a.id)}
                style={[styles.pill, active && styles.pillActive]}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {a.emoji} {a.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 入力欄（種目に応じて切替） */}
        {isStrength ? (
          <>
            <NumberField label="重量" suffix="kg" value={weight} onChange={setWeight} />
            <NumberField label="レップ" suffix="回" value={reps} onChange={setReps} />
            <NumberField label="セット" suffix="セット" value={sets} onChange={setSets} />
            <Text style={styles.previewLabel}>このセッションの総挙上重量</Text>
            <Text style={styles.preview}>
              {volume.toLocaleString("ja-JP")} <Text style={styles.previewUnit}>kg</Text>
            </Text>
          </>
        ) : (
          <>
            <NumberField label="距離" suffix="km" value={distance} onChange={setDistance} />
            <NumberField
              label="時間（任意）"
              suffix="分"
              value={minutes}
              onChange={setMinutes}
            />
          </>
        )}

        <Pressable
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          onPress={save}
          disabled={!canSave}
        >
          <Text style={styles.saveText}>積み上げる</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xl,
  },
  cancel: { fontSize: type.body, color: colors.sub, width: 64 },
  topTitle: { fontSize: type.body, fontWeight: "700", color: colors.ink },

  pills: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xl },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pillActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  pillText: { fontSize: type.caption, color: colors.ink },
  pillTextActive: { color: colors.bg },

  field: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: type.label, color: colors.sub, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: "row",
    alignItems: "baseline",
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingBottom: spacing.sm,
  },
  input: { flex: 1, fontSize: 28, fontWeight: "700", color: colors.ink, padding: 0 },
  suffix: { fontSize: type.body, color: colors.sub, marginLeft: spacing.sm },

  previewLabel: { fontSize: type.label, color: colors.sub, marginTop: spacing.md },
  preview: { fontSize: 40, fontWeight: "800", color: colors.ink, marginTop: spacing.xs },
  previewUnit: { fontSize: type.body, fontWeight: "400", color: colors.sub },

  saveBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  saveBtnDisabled: { backgroundColor: colors.sub },
  saveText: { color: colors.bg, fontSize: type.body, fontWeight: "700" },
});
