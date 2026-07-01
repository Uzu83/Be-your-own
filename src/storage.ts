import AsyncStorage from "@react-native-async-storage/async-storage";

import { Session } from "../domain/types";

const KEY = "beyourown.sessions.v1";

/** 保存済みの全セッションを読み込む。壊れていれば空配列。 */
export async function loadSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    return [];
  }
}

/** 全セッションを保存する（呼び出し側で配列を組み立てて渡す）。 */
export async function saveSessions(sessions: Session[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(sessions));
}
