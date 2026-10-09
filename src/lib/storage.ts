const PREFIX = "tt_";

/** localStorage wrapper that is safe during SSR and when storage is blocked. */
export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota or private mode — state stays in memory for this session */
    }
  },
  remove(key: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(PREFIX + key);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  account: "account",
  saved: "saved",
  compare: "compare",
  trips: "trips",
  reviews: "reviews",
  questions: "questions",
  enquiries: "enquiries",
  theme: "theme",
} as const;
