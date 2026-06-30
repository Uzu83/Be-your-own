// ドメインの中核となる型定義。UI から独立した純粋な TypeScript。

/**
 * 累積する量の種類。
 * - mass:     重さ。基準単位 = kg（筋トレの総挙上重量）
 * - distance: 距離。基準単位 = km（ランニング / 水泳 / ロードバイク）
 * - duration: 時間。基準単位 = 分（運動した時間）
 */
export type MetricType = "mass" | "distance" | "duration";

/** 各 MetricType の基準単位（換算は常にこの単位で行う）。 */
export const BASE_UNIT: Record<MetricType, string> = {
  mass: "kg",
  distance: "km",
  duration: "分",
};

/** アクティビティ（種目）の定義。 */
export interface Activity {
  id: string;
  name: string;
  /** このアクティビティで主役に見せる指標。 */
  metric: MetricType;
  /** 距離系は時間も累積できる（任意の副指標）。 */
  secondaryMetric?: MetricType;
  emoji: string;
}

/** 1 回分の記録。 */
export interface Session {
  id: string;
  activityId: string;
  /** ISO 日付文字列（YYYY-MM-DD）。 */
  date: string;
  /** 主指標の値（基準単位）。筋トレ=総挙上重量kg、距離系=km。 */
  value: number;
  /** 副指標の値（任意、基準単位）。距離系の運動時間=分 など。 */
  secondaryValue?: number;
  note?: string;
}

/** Session 群を集計した派生データ。 */
export interface Cumulative {
  activityId: string;
  metric: MetricType;
  total: number;
  secondaryTotal: number;
  sessionCount: number;
  /** 最初の記録日（ISO）。無ければ null。 */
  since: string | null;
}
