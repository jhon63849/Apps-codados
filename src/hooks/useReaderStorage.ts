import { useState, useEffect, useCallback } from 'react';
import {
  HighlightColor,
  ReaderSettings,
  TranslationId,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
} from '../types/bible';

const STORAGE_KEYS = {
  location: 'escritura_location_v1',
  translation: 'escritura_translation_v1',
  settings: 'escritura_settings_v1',
  highlights: 'escritura_highlights_v1',
  bookmarks: 'escritura_bookmarks_v1',
  notes: 'escritura_notes_v1',
  readChapters: 'escritura_read_chapters_v1',
  planProgress: 'escritura_plan_progress_v1',
};

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'light',
  fontFamily: 'serif',
  fontSize: 19,
  lineHeight: 1.8,
  measure: 'editorial',
  flow: 'verse',
  showDropCap: true,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function makeVerseId(bookIndex: number, chapter: number, verse: number): string {
  return `${bookIndex}:${chapter}:${verse}`;
}

export function makeChapterId(bookIndex: number, chapter: number): string {
  return `${bookIndex}:${chapter}`;
}

export function useReaderStorage() {
  const [location, setLocation] = useState<{ bookIndex: number; chapter: number }>(() =>
    readJson(STORAGE_KEYS.location, { bookIndex: 42, chapter: 1 }) // Starts in João 1
  );

  const [translation, setTranslation] = useState<TranslationId>(() =>
    readJson<TranslationId>(STORAGE_KEYS.translation, 'aa')
  );

  const [settings, setSettings] = useState<ReaderSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...readJson<Partial<ReaderSettings>>(STORAGE_KEYS.settings, {}),
  }));

  const [highlights, setHighlights] = useState<Record<string, VerseHighlight>>(() =>
    readJson(STORAGE_KEYS.highlights, {})
  );

  const [bookmarks, setBookmarks] = useState<Record<string, VerseBookmark>>(() =>
    readJson(STORAGE_KEYS.bookmarks, {})
  );

  const [notes, setNotes] = useState<Record<string, VerseNote>>(() =>
    readJson(STORAGE_KEYS.notes, {})
  );

  const [readChapters, setReadChapters] = useState<Record<string, boolean>>(() =>
    readJson(STORAGE_KEYS.readChapters, {})
  );

  const [planProgress, setPlanProgress] = useState<Record<string, number[]>>(() =>
    readJson(STORAGE_KEYS.planProgress, {})
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.translation, JSON.stringify(translation));
  }, [translation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    const root = document.documentElement;
    root.classList.remove('dark', 'sepia');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'sepia') {
      root.classList.add('sepia');
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.highlights, JSON.stringify(highlights));
  }, [highlights]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.readChapters, JSON.stringify(readChapters));
  }, [readChapters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.planProgress, JSON.stringify(planProgress));
  }, [planProgress]);

  const updateSettings = useCallback((patch: Partial<ReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const setVerseHighlight = useCallback(
    (bookIndex: number, chapter: number, verse: number, color: HighlightColor | null) => {
      const id = makeVerseId(bookIndex, chapter, verse);
      setHighlights((prev) => {
        const next = { ...prev };
        if (color === null) {
          delete next[id];
        } else {
          next[id] = { id, bookIndex, chapter, verse, color, updatedAt: Date.now() };
        }
        return next;
      });
    },
    []
  );

  const toggleBookmark = useCallback((bookIndex: number, chapter: number, verse: number) => {
    const id = makeVerseId(bookIndex, chapter, verse);
    setBookmarks((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = { id, bookIndex, chapter, verse, createdAt: Date.now() };
      }
      return next;
    });
  }, []);

  const saveNote = useCallback(
    (bookIndex: number, chapter: number, verse: number, text: string) => {
      const id = makeVerseId(bookIndex, chapter, verse);
      const trimmed = text.trim();
      setNotes((prev) => {
        const next = { ...prev };
        if (!trimmed) {
          delete next[id];
        } else {
          next[id] = { id, bookIndex, chapter, verse, text: trimmed, updatedAt: Date.now() };
        }
        return next;
      });
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const toggleChapterRead = useCallback((bookIndex: number, chapter: number) => {
    const id = makeChapterId(bookIndex, chapter);
    setReadChapters((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  }, []);

  const markChapterRead = useCallback((bookIndex: number, chapter: number) => {
    const id = makeChapterId(bookIndex, chapter);
    setReadChapters((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  }, []);

  const togglePlanDay = useCallback((planId: string, day: number) => {
    setPlanProgress((prev) => {
      const existing = prev[planId] ?? [];
      const exists = existing.includes(day);
      const updated = exists ? existing.filter((d) => d !== day) : [...existing, day];
      return { ...prev, [planId]: updated };
    });
  }, []);

  return {
    location,
    setLocation,
    translation,
    setTranslation,
    settings,
    updateSettings,
    highlights,
    setVerseHighlight,
    bookmarks,
    toggleBookmark,
    notes,
    saveNote,
    deleteNote,
    readChapters,
    toggleChapterRead,
    markChapterRead,
    planProgress,
    togglePlanDay,
  };
}
