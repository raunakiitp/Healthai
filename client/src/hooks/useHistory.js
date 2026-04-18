import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  fetchHistory,
  saveHistoryEntry,
  deleteHistoryEntry,
  clearHistoryApi,
} from "../utils/api";

const STORAGE_KEY = "healthai_history";
const MAX_HISTORY = 20;

export function useHistory() {
  const { user, authLoading } = useAuth();
  const isLoggedIn = !!user;

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load history when auth state resolves
  useEffect(() => {
    if (authLoading) return;

    if (isLoggedIn) {
      // Server history
      setHistoryLoading(true);
      fetchHistory()
        .then((h) => setHistory(h || []))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    } else {
      // Guest: localStorage
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setHistory(raw ? JSON.parse(raw) : []);
      } catch {
        setHistory([]);
      }
    }
  }, [isLoggedIn, authLoading]);

  const saveEntry = useCallback(
    async (entry) => {
      const newEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...entry,
      };

      if (isLoggedIn) {
        try {
          const saved = await saveHistoryEntry({ input: entry.input, result: entry.result });
          newEntry.id = saved.id;
          newEntry.timestamp = saved.timestamp;
        } catch (e) {
          console.warn("Could not save history to server:", e);
        }
        setHistory((prev) => [newEntry, ...prev].slice(0, MAX_HISTORY));
      } else {
        setHistory((prev) => {
          const newHistory = [newEntry, ...prev].slice(0, MAX_HISTORY);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
          } catch (e) {
            console.warn("Could not save to localStorage:", e);
          }
          return newHistory;
        });
      }
    },
    [isLoggedIn]
  );

  const deleteEntry = useCallback(
    async (id) => {
      if (isLoggedIn) {
        try {
          await deleteHistoryEntry(id);
        } catch (e) {
          console.warn("Could not delete from server:", e);
        }
      }
      setHistory((prev) => {
        const newHistory = prev.filter((e) => e.id !== id);
        if (!isLoggedIn) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        }
        return newHistory;
      });
    },
    [isLoggedIn]
  );

  const clearHistory = useCallback(async () => {
    if (isLoggedIn) {
      try {
        await clearHistoryApi();
      } catch (e) {
        console.warn("Could not clear server history:", e);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHistory([]);
  }, [isLoggedIn]);

  return { history, historyLoading, saveEntry, deleteEntry, clearHistory };
}
