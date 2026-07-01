import { useCallback, useEffect, useMemo, useState } from "react";

import { aggregate } from "../domain/aggregate";
import { Session } from "../domain/types";
import { loadSessions, saveSessions } from "./storage";

/** 簡易 ID 生成（時刻＋乱数）。RN では Math.random で十分。 */
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** 今日の日付を YYYY-MM-DD で返す。 */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * セッションの読み込み・追加・削除とローカル永続化をまとめたフック。
 * 累積(Cumulative)は sessions から派生させて返す。
 */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadSessions().then((s) => {
      if (alive) {
        setSessions(s);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const persist = useCallback((next: Session[]) => {
    setSessions(next);
    void saveSessions(next);
  }, []);

  const addSession = useCallback(
    (input: Omit<Session, "id">) => {
      const session: Session = { ...input, id: makeId() };
      persist([session, ...sessions]);
    },
    [sessions, persist]
  );

  const removeSession = useCallback(
    (id: string) => {
      persist(sessions.filter((s) => s.id !== id));
    },
    [sessions, persist]
  );

  const cumulatives = useMemo(() => aggregate(sessions), [sessions]);

  return { sessions, cumulatives, loading, addSession, removeSession };
}
