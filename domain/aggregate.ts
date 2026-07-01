import { ACTIVITIES } from "./activities";
import { Cumulative, Session } from "./types";

/**
 * Session 群を activityId ごとに集計して Cumulative を返す。
 * 記録が 1 件も無い種目も、total=0 の Cumulative として必ず含める
 * （Home で「まだ 0」の種目も並べて見せるため）。
 */
export function aggregate(sessions: Session[]): Record<string, Cumulative> {
  const result: Record<string, Cumulative> = {};

  for (const activity of ACTIVITIES) {
    result[activity.id] = {
      activityId: activity.id,
      metric: activity.metric,
      total: 0,
      secondaryTotal: 0,
      sessionCount: 0,
      since: null,
    };
  }

  for (const s of sessions) {
    const c = result[s.activityId];
    if (!c) continue; // 未知の種目は無視
    c.total += s.value;
    c.secondaryTotal += s.secondaryValue ?? 0;
    c.sessionCount += 1;
    if (c.since === null || s.date < c.since) c.since = s.date;
  }

  return result;
}

/** 筋トレの 1 セッション総挙上重量 = 重量 × レップ × セット。 */
export function strengthVolume(
  weight: number,
  reps: number,
  sets: number
): number {
  return weight * reps * sets;
}
