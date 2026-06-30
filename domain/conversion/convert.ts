import { MetricType } from "../types";
import { Reference, referencesFor } from "./references";

/** 換算結果。「あなたの累積 = 〇〇 N個分」と、次のマイルストーン。 */
export interface Conversion {
  reference: Reference;
  /** 何個分か（小数）。例: 1.09 */
  count: number;
  /** 表示用に整えた個数文字列。例: "1.1" / "12" */
  countLabel: string;
  /** 「= GRヤリス 1.1 台分」のような完成文。 */
  headline: string;
  /** 次の整数個までに必要な残量（基準単位）。ちょうど超えたばかりなら null。 */
  toNext: number | null;
  /** 次に到達する個数。例: 2 */
  nextCount: number | null;
}

/** 小数を読みやすい桁で文字列化（1未満は小数2桁、10未満は1桁、以上は整数）。 */
export function formatCount(count: number): string {
  if (count < 1) return count.toFixed(2);
  if (count < 10) return count.toFixed(1);
  return Math.round(count).toLocaleString("ja-JP");
}

/** 数値を読みやすい桁に丸めて文字列化（千区切り）。 */
export function formatAmount(value: number): string {
  const rounded = value >= 100 ? Math.round(value) : Math.round(value * 10) / 10;
  return rounded.toLocaleString("ja-JP");
}

/**
 * 最も「実感しやすい」基準を選ぶ。
 *
 * 方針: 累積量がすでに超えている（count >= 1）モノのうち、最も大きいモノを選ぶ。
 * = 「あなたはもう、ここまで大きいモノに匹敵する量を積んだ」と提示できる。
 * どのモノにも届いていない場合は、最小のモノに対する小数で示す。
 */
export function selectBestConversion(
  total: number,
  metric: MetricType
): Conversion | null {
  const refs = referencesFor(metric); // unitValue 昇順
  if (refs.length === 0 || total <= 0) return null;

  // count >= 1 を満たす最大の基準を探す。
  let chosen: Reference | null = null;
  for (const ref of refs) {
    if (total / ref.unitValue >= 1) chosen = ref;
  }
  // どれにも届かなければ最小の基準で小数表示。
  if (!chosen) chosen = refs[0];

  return buildConversion(total, chosen);
}

/** 指定した基準に対する換算を組み立てる。 */
export function buildConversion(total: number, reference: Reference): Conversion {
  const count = total / reference.unitValue;
  const countLabel = formatCount(count);
  const headline = `${reference.name} ${countLabel} ${reference.counter}分`;

  let toNext: number | null = null;
  let nextCount: number | null = null;
  if (count >= 1) {
    const next = Math.floor(count) + 1;
    nextCount = next;
    toNext = next * reference.unitValue - total;
  }

  return { reference, count, countLabel, headline, toNext, nextCount };
}

/**
 * 詳細表示用: その metric の全基準に対する換算を、超えたモノ→これからのモノ順で返す。
 */
export function allConversions(total: number, metric: MetricType): Conversion[] {
  return referencesFor(metric).map((ref) => buildConversion(total, ref));
}
