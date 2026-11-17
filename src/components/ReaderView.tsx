import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bookmark,
  MessageSquare,
  Copy,
  Check,
  Volume2,
  Square,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  GitCompare,
  X,
  Eraser,
} from 'lucide-react';
import {
  BOOK_METADATA,
  HIGHLIGHT_SWATCHES,
  TOTAL_CHAPTERS,
  TRANSLATIONS,
  getDailyVerseRef,
} from '../data/bibleMetadata';
import { loadBibleTranslation } from '../hooks/useBibleData';
import { makeChapterId, makeVerseId } from '../hooks/useReaderStorage';
import {
  BibleBook,
  HighlightColor,
  ReaderSettings,
  TranslationId,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
} from '../types/bible';

interface ReaderViewProps {
  bookIndex: number;
  chapter: number;
  targetVerse: number | null;
  translation: TranslationId;
  books: BibleBook[] | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  settings: ReaderSettings;
  onUpdateSettings: (patch: Partial<ReaderSettings>) => void;
  onChangeTranslation: (t: TranslationId) => void;
  onNavigate: (bookIndex: number, chapter: number, verse?: number | null) => void;
  onOpenPicker: () => void;
  highlights: Record<string, VerseHighlight>;
  onSetHighlight: (bookIndex: number, chapter: number, verse: number, color: HighlightColor | null) => void;
  bookmarks: Record<string, VerseBookmark>;
  onToggleBookmark: (bookIndex: number, chapter: number, verse: number) => void;
  notes: Record<string, VerseNote>;
  onSaveNote: (bookIndex: number, chapter: number, verse: number, text: string) => void;
  readChapters: Record<string, boolean>;
  onToggleChapterRead: (bookIndex: number, chapter: number) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

export function ReaderView({
  bookIndex,
  chapter,
  targetVerse,
  translation,
  books,
  loading,
  error,
  onRetry,
  settings,
  onUpdateSettings,
  onChangeTranslation,
  onNavigate,
  onOpenPicker,
  highlights,
  onSetHighlight,
  bookmarks,
  onToggleBookmark,
  notes,
  onSaveNote,
  readChapters,
  onToggleChapterRead,
  focusMode,
  onToggleFocusMode,
}: ReaderViewProps) {
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [showAppearance, setShowAppearance] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [editingNoteVerse, setEditingNoteVerse] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [compareVerse, setCompareVerse] = useState<number | null>(null);
  const [compareTexts, setCompareTexts] = useState<{ aa: string; acf: string } | null>(null);
  const [speakingVerse, setSpeakingVerse] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const appearanceRef = useRef<HTMLDivElement>(null);
  const speechActiveRef = useRef(false);

  const bookMeta = BOOK_METADATA[bookIndex] ?? BOOK_METADATA[0];
  const verses = useMemo(() => {
    if (!books || !books[bookIndex]) return [];
    return books[bookIndex].chapters[chapter - 1] ?? [];
  }, [books, bookIndex, chapter]);

  const dailyRef = useMemo(() => getDailyVerseRef(), []);
  const dailyText = useMemo(() => {
    if (!books || !books[dailyRef.bookIndex]) return null;
    return books[dailyRef.bookIndex].chapters[dailyRef.chapter - 1]?.[dailyRef.verse - 1] ?? null;
  }, [books, dailyRef]);

  // Clear selection & stop audio when chapter changes
  useEffect(() => {
    setSelectedVerses([]);
    setEditingNoteVerse(null);
    setCompareVerse(null);
    stopSpeech();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [bookIndex, chapter, translation]);

  // Scroll to target verse if navigated from search or annotations
  useEffect(() => {
    if (!targetVerse || loading || verses.length === 0) return;
    const el = document.getElementById(`verse-${targetVerse}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedVerses([targetVerse]);
      }, 80);
    }
  }, [targetVerse, loading, verses.length]);

  // Reading scroll progress indicator
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [bookIndex, chapter]);

  // Close appearance popover on outside click
  useEffect(() => {
    if (!showAppearance) return;
    const handleClick = (e: MouseEvent) => {
      if (appearanceRef.current && !appearanceRef.current.contains(e.target as Node)) {
        setShowAppearance(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showAppearance]);

  // Escape exits focus mode or clears selection
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (compareVerse !== null) {
          setCompareVerse(null);
        } else if (editingNoteVerse !== null) {
          setEditingNoteVerse(null);
        } else if (selectedVerses.length > 0) {
          setSelectedVerses([]);
        } else if (focusMode) {
          onToggleFocusMode();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [compareVerse, editingNoteVerse, selectedVerses.length, focusMode, onToggleFocusMode]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  function stopSpeech() {
    speechActiveRef.current = false;
    setSpeakingVerse(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function startSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || verses.length === 0) {
      return;
    }
    window.speechSynthesis.cancel();
    speechActiveRef.current = true;

    const startIndex = selectedVerses.length > 0 ? Math.min(...selectedVerses) - 1 : 0;

    const speakNext = (idx: number) => {
      if (!speechActiveRef.current || idx >= verses.length) {
        speechActiveRef.current = false;
        setSpeakingVerse(null);
        return;
      }
      setSpeakingVerse(idx + 1);
      const utterance = new SpeechSynthesisUtterance(verses[idx]);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.96;
      utterance.onend = () => {
        if (speechActiveRef.current) {
          speakNext(idx + 1);
        }
      };
      utterance.onerror = () => {
        speechActiveRef.current = false;
        setSpeakingVerse(null);
      };
      window.speechSynthesis.speak(utterance);
    };

    speakNext(startIndex);
  }

  // Navigation helpers
  const hasPrev = bookIndex > 0 || chapter > 1;
  const hasNext = bookIndex < BOOK_METADATA.length - 1 || chapter < bookMeta.chaptersCount;

  const goPrev = () => {
    if (chapter > 1) {
      onNavigate(bookIndex, chapter - 1, null);
    } else if (bookIndex > 0) {
      const prevBook = BOOK_METADATA[bookIndex - 1];
      onNavigate(prevBook.index, prevBook.chaptersCount, null);
    }
  };

  const goNext = () => {
    if (chapter < bookMeta.chaptersCount) {
      onNavigate(bookIndex, chapter + 1, null);
    } else if (bookIndex < BOOK_METADATA.length - 1) {
      onNavigate(bookIndex + 1, 1, null);
    }
  };

  const toggleVerseSelect = (verseNum: number) => {
    setSelectedVerses((prev) =>
      prev.includes(verseNum) ? prev.filter((v) => v !== verseNum) : [...prev, verseNum].sort((a, b) => a - b)
    );
  };

  const handleApplyHighlight = (color: HighlightColor | null) => {
    selectedVerses.forEach((v) => onSetHighlight(bookIndex, chapter, v, color));
  };

  const handleBookmarkSelected = () => {
    selectedVerses.forEach((v) => onToggleBookmark(bookIndex, chapter, v));
  };

  const handleCopySelected = async () => {
    if (selectedVerses.length === 0) return;
    const sorted = [...selectedVerses].sort((a, b) => a - b);
    const lines = sorted.map((v) => `${v}. ${verses[v - 1] ?? ''}`).join(' ');
    const refLabel =
      sorted.length === 1
        ? `${bookMeta.name} ${chapter}:${sorted[0]}`
        : `${bookMeta.name} ${chapter}:${sorted[0]}–${sorted[sorted.length - 1]}`;
    const formatted = `"${lines}" — ${refLabel} (${TRANSLATIONS[translation].shortName})`;

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 1800);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  const openNoteEditor = () => {
    if (selectedVerses.length === 0) return;
    const target = selectedVerses[0];
    const existing = notes[makeVerseId(bookIndex, chapter, target)];
    setNoteDraft(existing?.text ?? '');
    setEditingNoteVerse(target);
  };

  const openCompareModal = async () => {
    if (selectedVerses.length === 0) return;
    const target = selectedVerses[0];
    setCompareVerse(target);
    setCompareTexts(null);
    const [aaBooks, acfBooks] = await Promise.all([
      loadBibleTranslation('aa'),
      loadBibleTranslation('acf'),
    ]);
    const aaText = aaBooks[bookIndex]?.chapters[chapter - 1]?.[target - 1] ?? '';
    const acfText = acfBooks[bookIndex]?.chapters[chapter - 1]?.[target - 1] ?? '';
    setCompareTexts({ aa: aaText, acf: acfText });
  };

  const isChapterRead = Boolean(readChapters[makeChapterId(bookIndex, chapter)]);
  const totalReadCount = Object.keys(readChapters).length;

  const measureClass =
    settings.measure === 'compact'
      ? 'max-w-xl'
      : settings.measure === 'wide'
      ? 'max-w-3xl'
      : 'max-w-2xl';

  const fontClass =
    settings.fontFamily === 'sans' ? 'font-scripture-sans' : 'font-scripture-serif';

  const speechAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;

  return (
    <div className="relative min-h-[calc(100vh-64px)]">
      {/* Subtle Top Scroll Progress Hairline */}
      <div
        className="fixed left-0 right-0 top-0 z-40 h-[2px] pointer-events-none"
        style={{ backgroundColor: 'transparent' }}
      >
        <div
          className="h-full transition-[width] duration-100"
          style={{ width: `${scrollProgress}%`, backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* Reader Workspace Toolbar */}
      {!focusMode ? (
        <div
          className="border-b transition-colors duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-8">
            {/* Book & Chapter Navigation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={goPrev}
                disabled={!hasPrev}
                aria-label="Capítulo anterior"
                className="flex h-10 w-10 items-center justify-center rounded-lg border cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onOpenPicker}
                className="inline-flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                <span>{bookMeta.name}</span>
                <span className="tabular-nums" style={{ color: 'var(--accent)' }}>
                  {chapter}
                </span>
                <ChevronDown className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>

              <button
                type="button"
                onClick={goNext}
                disabled={!hasNext}
                aria-label="Próximo capítulo"
                className="flex h-10 w-10 items-center justify-center rounded-lg border cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Right Controls: Translation, Audio, Typography, Focus */}
            <div className="flex items-center gap-2">
              {/* Translation Segmented Switch */}
              <div
                className="flex items-center rounded-lg border p-0.5"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                }}
                role="group"
                aria-label="Tradução da Bíblia"
              >
                {(['aa', 'acf'] as TranslationId[]).map((tId) => {
                  const active = translation === tId;
                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => onChangeTranslation(tId)}
                      title={TRANSLATIONS[tId].fullName}
                      className="rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                      style={{
                        backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                        color: active ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                      }}
                    >
                      {TRANSLATIONS[tId].shortName}
                    </button>
                  );
                })}
              </div>

              {/* Audio Read-Aloud */}
              {speechAvailable && (
                <button
                  type="button"
                  onClick={speakingVerse !== null ? stopSpeech : startSpeech}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: speakingVerse !== null ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                    borderColor: 'var(--border-hairline)',
                    color: speakingVerse !== null ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  {speakingVerse !== null ? (
                    <>
                      <Square className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Parar</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="hidden sm:inline">Ouvir</span>
                    </>
                  )}
                </button>
              )}

              {/* Typography & Theme Settings */}
              <div className="relative" ref={appearanceRef}>
                <button
                  type="button"
                  onClick={() => setShowAppearance((prev) => !prev)}
                  aria-expanded={showAppearance}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: showAppearance ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                    borderColor: 'var(--border-hairline)',
                    color: showAppearance ? 'var(--accent)' : 'var(--text-primary)',
                  }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Aparência</span>
                </button>

                {showAppearance && (
                  <div
                    className="absolute right-0 top-12 z-40 w-80 rounded-xl border p-4 shadow-xl"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="space-y-4">
                      {/* Theme Mode */}
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Superfície de leitura
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {(
                            [
                              { id: 'light', label: 'Papel', bg: '#FBF9F5', fg: '#1C1917' },
                              { id: 'sepia', label: 'Pergaminho', bg: '#F3EBD8', fg: '#2B2118' },
                              { id: 'dark', label: 'Noturno', bg: '#131210', fg: '#ECE7DF' },
                            ] as const
                          ).map((t) => {
                            const active = settings.theme === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => onUpdateSettings({ theme: t.id })}
                                className="rounded-lg border py-2 text-xs font-medium cursor-pointer transition-all"
                                style={{
                                  backgroundColor: t.bg,
                                  color: t.fg,
                                  borderColor: active ? 'var(--accent)' : 'var(--border-hairline)',
                                  boxShadow: active ? '0 0 0 1px var(--accent)' : 'none',
                                }}
                              >
                                {t.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Font Family & Size */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: 'var(--border-hairline)' }}>
                          <button
                            type="button"
                            onClick={() => onUpdateSettings({ fontFamily: 'serif' })}
                            className="rounded-md px-3 py-1.5 font-scripture-serif text-xs cursor-pointer"
                            style={{
                              backgroundColor: settings.fontFamily === 'serif' ? 'var(--bg-surface)' : 'transparent',
                              fontWeight: settings.fontFamily === 'serif' ? 600 : 400,
                            }}
                          >
                            Serifada
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateSettings({ fontFamily: 'sans' })}
                            className="rounded-md px-3 py-1.5 text-xs cursor-pointer"
                            style={{
                              backgroundColor: settings.fontFamily === 'sans' ? 'var(--bg-surface)' : 'transparent',
                              fontWeight: settings.fontFamily === 'sans' ? 600 : 400,
                            }}
                          >
                            Sem serifa
                          </button>
                        </div>

                        <div className="flex items-center gap-1 rounded-lg border p-0.5" style={{ borderColor: 'var(--border-hairline)' }}>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSettings({ fontSize: Math.max(15, settings.fontSize - 1) })
                            }
                            aria-label="Diminuir fonte"
                            className="px-2.5 py-1 text-xs font-medium cursor-pointer"
                          >
                            A-
                          </button>
                          <span className="text-xs tabular-nums px-1" style={{ color: 'var(--text-muted)' }}>
                            {settings.fontSize}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateSettings({ fontSize: Math.min(24, settings.fontSize + 1) })
                            }
                            aria-label="Aumentar fonte"
                            className="px-2.5 py-1 text-sm font-medium cursor-pointer"
                          >
                            A+
                          </button>
                        </div>
                      </div>

                      {/* Measure / Width */}
                      <div>
                        <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                          Largura da coluna
                        </p>
                        <div className="grid grid-cols-3 gap-1 rounded-lg border p-0.5" style={{ borderColor: 'var(--border-hairline)' }}>
                          {(
                            [
                              { id: 'compact', label: 'Compacta' },
                              { id: 'editorial', label: 'Editorial' },
                              { id: 'wide', label: 'Ampla' },
                            ] as const
                          ).map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => onUpdateSettings({ measure: m.id })}
                              className="rounded-md py-1.5 text-xs font-medium cursor-pointer"
                              style={{
                                backgroundColor: settings.measure === m.id ? 'var(--bg-surface)' : 'transparent',
                                color: settings.measure === m.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                              }}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Verse vs Continuous Flow & Drop Cap */}
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Fluxo contínuo
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSettings({
                              flow: settings.flow === 'verse' ? 'paragraph' : 'verse',
                            })
                          }
                          className="rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer"
                          style={{
                            backgroundColor: settings.flow === 'paragraph' ? 'var(--accent-soft)' : 'transparent',
                            borderColor: 'var(--border-hairline)',
                            color: settings.flow === 'paragraph' ? 'var(--accent)' : 'var(--text-secondary)',
                          }}
                        >
                          {settings.flow === 'paragraph' ? 'Ativado' : 'Por versículo'}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Letra capitular
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateSettings({ showDropCap: !settings.showDropCap })}
                          className="rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer"
                          style={{
                            backgroundColor: settings.showDropCap ? 'var(--accent-soft)' : 'transparent',
                            borderColor: 'var(--border-hairline)',
                            color: settings.showDropCap ? 'var(--accent)' : 'var(--text-secondary)',
                          }}
                        >
                          {settings.showDropCap ? 'Visível' : 'Oculta'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Focus Mode */}
              <button
                type="button"
                onClick={onToggleFocusMode}
                title="Modo foco (sem distrações)"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-hairline)',
                  color: 'var(--text-primary)',
                }}
              >
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">Foco</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="fixed right-5 top-5 z-40">
          <button
            type="button"
            onClick={onToggleFocusMode}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium shadow-sm cursor-pointer transition-opacity hover:opacity-85"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Sair do modo foco</span>
          </button>
        </div>
      )}

      {/* Main Reading Layout */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 xl:gap-12">
          {/* Desktop Left Marginalia Rail */}
          {!focusMode && (
            <aside className="hidden xl:block xl:col-span-3">
              <div className="sticky top-24 space-y-8">
                {/* Chapter Quick Grid for Current Book */}
                <div>
                  <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                    Capítulos de {bookMeta.name}
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: Math.min(bookMeta.chaptersCount, 40) }, (_, i) => i + 1).map((ch) => {
                      const active = ch === chapter;
                      const read = Boolean(readChapters[makeChapterId(bookIndex, ch)]);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => onNavigate(bookIndex, ch, null)}
                          className="flex h-8 items-center justify-center rounded border text-xs tabular-nums cursor-pointer transition-colors"
                          style={{
                            backgroundColor: active
                              ? 'var(--text-primary)'
                              : read
                              ? 'var(--accent-soft)'
                              : 'transparent',
                            borderColor: active ? 'var(--text-primary)' : 'var(--border-hairline)',
                            color: active
                              ? 'var(--bg-canvas)'
                              : read
                              ? 'var(--accent)'
                              : 'var(--text-secondary)',
                          }}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                  {bookMeta.chaptersCount > 40 && (
                    <button
                      type="button"
                      onClick={onOpenPicker}
                      className="mt-2 text-xs font-medium cursor-pointer hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Ver todos os {bookMeta.chaptersCount} capítulos
                    </button>
                  )}
                </div>

                {/* Daily Verse Quiet Editorial Note */}
                {dailyText && (
                  <div className="border-t pt-6" style={{ borderColor: 'var(--border-hairline)' }}>
                    <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                      Palavra do Dia
                    </p>
                    <p
                      className="font-scripture-serif text-sm italic leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      “{dailyText}”
                    </p>
                    <button
                      type="button"
                      onClick={() => onNavigate(dailyRef.bookIndex, dailyRef.chapter, dailyRef.verse)}
                      className="mt-2.5 text-xs font-medium cursor-pointer hover:underline tabular-nums"
                      style={{ color: 'var(--accent)' }}
                    >
                      {BOOK_METADATA[dailyRef.bookIndex].name} {dailyRef.chapter}:{dailyRef.verse}
                    </button>
                  </div>
                )}

                {/* Overall Progress */}
                <div className="border-t pt-6" style={{ borderColor: 'var(--border-hairline)' }}>
                  <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
                    Progresso de Leitura
                  </p>
                  <p className="text-sm font-medium tabular-nums">
                    {totalReadCount} <span style={{ color: 'var(--text-muted)' }}>/ {TOTAL_CHAPTERS} capítulos</span>
                  </p>
                </div>
              </div>
            </aside>
          )}

          {/* Central Editorial Reading Column */}
          <main className={focusMode ? 'xl:col-span-12' : 'xl:col-span-9'}>
            <article className={`mx-auto ${measureClass}`}>
              {/* Chapter Header */}
              <header className="mb-8 border-b pb-6" style={{ borderColor: 'var(--border-hairline)' }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {bookMeta.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'} · {bookMeta.division}
                  </p>
                  <p className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {TRANSLATIONS[translation].fullName}
                  </p>
                </div>

                <h1
                  className="font-display mt-2 text-4xl sm:text-5xl font-semibold tracking-tight"
                  style={{ textWrap: 'balance' }}
                >
                  {bookMeta.name} <span className="tabular-nums">{chapter}</span>
                </h1>
              </header>

              {/* Loading / Error / Scripture Text */}
              {loading ? (
                <div className="space-y-4 py-6">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="h-5 rounded animate-pulse"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        width: idx % 3 === 0 ? '92%' : idx % 2 === 0 ? '85%' : '98%',
                      }}
                    />
                  ))}
                </div>
              ) : error ? (
                <div
                  className="rounded-xl border p-8 text-center"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-hairline)',
                  }}
                >
                  <p className="text-base font-medium">{error}</p>
                  <button
                    type="button"
                    onClick={onRetry}
                    className="mt-4 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer"
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-canvas)',
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <div
                  className={`${fontClass} transition-all duration-150`}
                  style={{
                    fontSize: `${settings.fontSize}px`,
                    lineHeight: settings.lineHeight,
                  }}
                >
                  {settings.flow === 'paragraph' ? (
                    <div className="space-y-4">
                      <p className={settings.showDropCap ? 'editorial-dropcap' : ''}>
                        {verses.map((verseText, idx) => {
                          const vNum = idx + 1;
                          const vId = makeVerseId(bookIndex, chapter, vNum);
                          const hl = highlights[vId];
                          const isSelected = selectedVerses.includes(vNum);
                          const isSpeaking = speakingVerse === vNum;
                          const hasNote = Boolean(notes[vId]);
                          const isBookmarked = Boolean(bookmarks[vId]);

                          const swatch = hl
                            ? HIGHLIGHT_SWATCHES.find((s) => s.id === hl.color)
                            : undefined;

                          return (
                            <span
                              key={vNum}
                              id={`verse-${vNum}`}
                              onClick={() => toggleVerseSelect(vNum)}
                              className="cursor-pointer rounded px-0.5 transition-colors"
                              style={{
                                backgroundColor: isSpeaking
                                  ? 'var(--accent-soft)'
                                  : isSelected
                                  ? 'var(--accent-soft)'
                                  : swatch?.bgVar ?? 'transparent',
                                textDecoration: isSelected ? 'underline' : 'none',
                                textDecorationColor: 'var(--accent)',
                                textUnderlineOffset: '4px',
                              }}
                            >
                              <sup
                                className="mr-1 font-sans text-[0.68em] font-semibold tabular-nums select-none"
                                style={{ color: 'var(--accent)' }}
                              >
                                {vNum}
                              </sup>
                              {verseText}
                              {(isBookmarked || hasNote) && (
                                <span
                                  className="ml-1 inline-flex items-center gap-0.5 align-baseline text-[0.7em]"
                                  style={{ color: 'var(--accent)' }}
                                >
                                  {isBookmarked && '★'}
                                  {hasNote && '✎'}
                                </span>
                              )}{' '}
                            </span>
                          );
                        })}
                      </p>
                    </div>
                  ) : (
                    <ol className="space-y-3.5">
                      {verses.map((verseText, idx) => {
                        const vNum = idx + 1;
                        const vId = makeVerseId(bookIndex, chapter, vNum);
                        const hl = highlights[vId];
                        const isSelected = selectedVerses.includes(vNum);
                        const isSpeaking = speakingVerse === vNum;
                        const note = notes[vId];
                        const isBookmarked = Boolean(bookmarks[vId]);
                        const swatch = hl
                          ? HIGHLIGHT_SWATCHES.find((s) => s.id === hl.color)
                          : undefined;

                        return (
                          <li
                            key={vNum}
                            id={`verse-${vNum}`}
                            onClick={() => toggleVerseSelect(vNum)}
                            className={`group relative rounded-lg px-3 py-1.5 -mx-3 cursor-pointer transition-colors duration-150 ${
                              vNum === 1 && settings.showDropCap ? 'editorial-dropcap' : ''
                            }`}
                            style={{
                              backgroundColor: isSpeaking
                                ? 'var(--accent-soft)'
                                : isSelected
                                ? 'var(--accent-soft)'
                                : swatch?.bgVar ?? 'transparent',
                              boxShadow: isSelected ? 'inset 0 0 0 1px var(--accent)' : 'none',
                            }}
                          >
                            {!(vNum === 1 && settings.showDropCap) && (
                              <sup
                                className="mr-2 font-sans text-[0.68em] font-semibold tabular-nums select-none"
                                style={{ color: 'var(--accent)' }}
                              >
                                {vNum}
                              </sup>
                            )}
                            <span>{verseText}</span>

                            {(isBookmarked || note) && (
                              <span className="ml-2 inline-flex items-center gap-1.5 align-middle font-sans text-xs">
                                {isBookmarked && (
                                  <Bookmark
                                    className="h-3.5 w-3.5 fill-current"
                                    style={{ color: 'var(--accent)' }}
                                    aria-label="Versículo favoritado"
                                  />
                                )}
                                {note && (
                                  <MessageSquare
                                    className="h-3.5 w-3.5"
                                    style={{ color: 'var(--accent)' }}
                                    aria-label="Versículo com anotação"
                                  />
                                )}
                              </span>
                            )}

                            {note && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedVerses([vNum]);
                                  setNoteDraft(note.text);
                                  setEditingNoteVerse(vNum);
                                }}
                                className="mt-2 rounded-lg border px-3 py-2 font-sans text-xs leading-relaxed"
                                style={{
                                  backgroundColor: 'var(--bg-elevated)',
                                  borderColor: 'var(--border-hairline)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                <span className="font-semibold" style={{ color: 'var(--accent)' }}>
                                  Nota ({bookMeta.name} {chapter}:{vNum}):{' '}
                                </span>
                                {note.text}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              )}

              {/* Chapter Bottom Navigation & Completion */}
              {!loading && !error && (
                <footer
                  className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t pt-8 pb-20"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!hasPrev}
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleChapterRead(bookIndex, chapter)}
                    className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isChapterRead ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: isChapterRead ? 'var(--accent)' : 'var(--border-hairline)',
                      color: isChapterRead ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    <Check className="h-4 w-4" />
                    <span>{isChapterRead ? 'Capítulo lido' : 'Marcar como lido'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!hasNext}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-canvas)',
                    }}
                  >
                    <span>Próximo</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </footer>
              )}
            </article>
          </main>
        </div>
      </div>

      {/* Contextual Verse Action Bar */}
      {selectedVerses.length > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-[min(94vw,640px)] -translate-x-1/2">
          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-xl"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
                {bookMeta.abbrev.toUpperCase()} {chapter}:
                {selectedVerses.length === 1
                  ? selectedVerses[0]
                  : `${Math.min(...selectedVerses)}–${Math.max(...selectedVerses)}`}
              </span>

              {/* Highlight Swatches */}
              <div className="flex items-center gap-1.5 pl-2 border-l" style={{ borderColor: 'var(--border-hairline)' }}>
                {HIGHLIGHT_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => handleApplyHighlight(swatch.id)}
                    title={`Destacar em ${swatch.label}`}
                    aria-label={`Destacar em ${swatch.label}`}
                    className="h-6 w-6 rounded-full border cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: swatch.dotColor,
                      borderColor: 'rgba(0,0,0,0.15)',
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => handleApplyHighlight(null)}
                  title="Remover destaque"
                  aria-label="Remover destaque"
                  className="flex h-6 w-6 items-center justify-center rounded-full border cursor-pointer hover:opacity-75"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Eraser className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleBookmarkSelected}
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>Favoritar</span>
              </button>

              <button
                type="button"
                onClick={openNoteEditor}
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Anotar</span>
              </button>

              <button
                type="button"
                onClick={openCompareModal}
                className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Comparar</span>
              </button>

              <button
                type="button"
                onClick={handleCopySelected}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-canvas)',
                }}
              >
                {copiedFeedback ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedFeedback ? 'Copiado' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVerses([])}
                aria-label="Limpar seleção"
                className="flex h-7 w-7 items-center justify-center rounded-lg cursor-pointer hover:opacity-75"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Editor Modal */}
      {editingNoteVerse !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(18, 16, 14, 0.55)' }}
          onClick={() => setEditingNoteVerse(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Anotação pessoal"
        >
          <div
            className="w-full max-w-lg rounded-xl border p-5 shadow-xl"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Anotação de Estudo
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  {bookMeta.name} {chapter}:{editingNoteVerse}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteVerse(null)}
                aria-label="Fechar anotação"
                className="flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p
              className="mb-4 rounded-lg p-3 font-scripture-serif text-sm italic"
              style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
            >
              “{verses[editingNoteVerse - 1]}”
            </p>

            <textarea
              rows={4}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder="Escreva sua reflexão, referência cruzada ou observação..."
              className="w-full rounded-lg border p-3 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
              autoFocus
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingNoteVerse(null)}
                className="rounded-lg border px-4 py-2 text-xs font-medium cursor-pointer"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onSaveNote(bookIndex, chapter, editingNoteVerse, noteDraft);
                  setEditingNoteVerse(null);
                }}
                className="rounded-lg px-4 py-2 text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-canvas)',
                }}
              >
                Salvar anotação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Translation Compare Modal */}
      {compareVerse !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(18, 16, 14, 0.55)' }}
          onClick={() => setCompareVerse(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Comparar traduções"
        >
          <div
            className="w-full max-w-2xl rounded-xl border p-6 shadow-xl"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-4 mb-5" style={{ borderColor: 'var(--border-hairline)' }}>
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Comparação Paralela
                </p>
                <h3 className="font-display text-2xl font-semibold">
                  {bookMeta.name} {chapter}:{compareVerse}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCompareVerse(null)}
                aria-label="Fechar comparação"
                className="flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!compareTexts ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Carregando traduções...
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                    AA · Almeida Atualizada
                  </p>
                  <p className="font-scripture-serif text-base leading-relaxed">
                    {compareTexts.aa}
                  </p>
                </div>
                <div className="rounded-lg border p-4" style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-canvas)' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
                    ACF · Almeida Corrigida Fiel
                  </p>
                  <p className="font-scripture-serif text-base leading-relaxed">
                    {compareTexts.acf}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
