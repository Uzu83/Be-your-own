import { MetricType } from "../types";

/**
 * 換算の基準となる「身近で壮大なモノ」。
 * unitValue は 1 個あたりの量を、その MetricType の基準単位で表す
 * （mass=kg / distance=km / duration=分）。
 *
 * ここはデータとして外出ししており、自由に追加・調整できる。
 */
export interface Reference {
  id: string;
  metric: MetricType;
  /** 表示名。例: "GRヤリス" */
  name: string;
  /** 1 個あたりの量（基準単位）。 */
  unitValue: number;
  /** 助数詞。例: 台 / 頭 / 周 / 本 */
  counter: string;
  emoji: string;
}

export const REFERENCES: Reference[] = [
  // ── 重量 (kg) ───────────────────────────────
  { id: "watermelon", metric: "mass", name: "スイカ", unitValue: 5, counter: "玉", emoji: "🍉" },
  { id: "dumbbell20", metric: "mass", name: "20kgダンベル", unitValue: 20, counter: "個", emoji: "🏋️" },
  { id: "human", metric: "mass", name: "おとな", unitValue: 60, counter: "人", emoji: "🧍" },
  { id: "panda", metric: "mass", name: "パンダ", unitValue: 100, counter: "頭", emoji: "🐼" },
  { id: "piano", metric: "mass", name: "グランドピアノ", unitValue: 300, counter: "台", emoji: "🎹" },
  { id: "bike", metric: "mass", name: "大型バイク", unitValue: 250, counter: "台", emoji: "🏍️" },
  { id: "yaris", metric: "mass", name: "GRヤリス", unitValue: 1280, counter: "台", emoji: "🚗" },
  { id: "elephant", metric: "mass", name: "アフリカゾウ", unitValue: 6000, counter: "頭", emoji: "🐘" },
  { id: "bus", metric: "mass", name: "路線バス", unitValue: 11000, counter: "台", emoji: "🚌" },
  { id: "jet", metric: "mass", name: "ジャンボ機", unitValue: 180000, counter: "機", emoji: "✈️" },
  { id: "whale", metric: "mass", name: "シロナガスクジラ", unitValue: 150000, counter: "頭", emoji: "🐋" },

  // ── 距離 (km) ───────────────────────────────
  { id: "tokyotower", metric: "distance", name: "東京タワーの高さ", unitValue: 0.333, counter: "本", emoji: "🗼" },
  { id: "fuji", metric: "distance", name: "富士山の高さ", unitValue: 3.776, counter: "本", emoji: "🗻" },
  { id: "fullmarathon", metric: "distance", name: "フルマラソン", unitValue: 42.195, counter: "本", emoji: "🏅" },
  { id: "tokyo_osaka", metric: "distance", name: "東京〜大阪", unitValue: 400, counter: "本", emoji: "🚄" },
  { id: "japan_length", metric: "distance", name: "日本縦断", unitValue: 3000, counter: "本", emoji: "🗾" },
  { id: "earth_diameter", metric: "distance", name: "地球の直径", unitValue: 12742, counter: "本", emoji: "🌐" },
  { id: "earth_lap", metric: "distance", name: "地球1周", unitValue: 40075, counter: "周", emoji: "🌍" },
  { id: "to_moon", metric: "distance", name: "地球〜月", unitValue: 384400, counter: "回", emoji: "🌕" },

  // ── 時間 (分) ───────────────────────────────
  { id: "song", metric: "duration", name: "曲", unitValue: 4, counter: "曲", emoji: "🎵" },
  { id: "anime_ep", metric: "duration", name: "アニメ1話", unitValue: 24, counter: "話", emoji: "📺" },
  { id: "movie", metric: "duration", name: "映画", unitValue: 120, counter: "本", emoji: "🎬" },
  { id: "workday", metric: "duration", name: "仕事8時間", unitValue: 480, counter: "日分", emoji: "💼" },
  { id: "day", metric: "duration", name: "まる1日", unitValue: 1440, counter: "日", emoji: "🌗" },
  { id: "week", metric: "duration", name: "まる1週間", unitValue: 10080, counter: "週", emoji: "📅" },
];

export const referencesFor = (metric: MetricType): Reference[] =>
  REFERENCES.filter((r) => r.metric === metric).sort(
    (a, b) => a.unitValue - b.unitValue
  );
