import { Activity } from "./types";

/**
 * 対応する種目の定義。
 * 距離系（ランニング / 水泳 / ロードバイク）は距離を主役に、時間を副指標に持つ。
 */
export const ACTIVITIES: Activity[] = [
  {
    id: "strength",
    name: "筋トレ",
    metric: "mass",
    emoji: "🏋️",
  },
  {
    id: "running",
    name: "ランニング",
    metric: "distance",
    secondaryMetric: "duration",
    emoji: "🏃",
  },
  {
    id: "swimming",
    name: "水泳",
    metric: "distance",
    secondaryMetric: "duration",
    emoji: "🏊",
  },
  {
    id: "cycling",
    name: "ロードバイク",
    metric: "distance",
    secondaryMetric: "duration",
    emoji: "🚴",
  },
];

export const getActivity = (id: string): Activity | undefined =>
  ACTIVITIES.find((a) => a.id === id);
