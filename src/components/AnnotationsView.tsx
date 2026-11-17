import { useState, useMemo } from 'react';
import { Bookmark, MessageSquare, Highlighter, Trash2, ArrowUpRight, Copy, Check } from 'lucide-react';
import { BOOK_METADATA, HIGHLIGHT_SWATCHES, TRANSLATIONS } from '../data/bibleMetadata';
import {
  BibleBook,
  HighlightColor,
  TranslationId,
  VerseBookmark,
  VerseHighlight,
  VerseNote,
} from '../types/bible';

interface AnnotationsViewProps {
  books: BibleBook[] | null;
  translation: TranslationId;
  highlights: Record<string, VerseHighlight>;
  bookmarks: Record<string, VerseBookmark>;
  notes: Record<string, VerseNote>;
  onRemoveHighlight: (bookIndex: number, chapter: number, verse: number) => void;
  onRemoveBookmark: (bookIndex: number, chapter: number, verse: number) => void;
  onSaveNote: (bookIndex: number, chapter: number, verse: number, text: string) => void;
  onDeleteNote: (id: string) => void;
  onOpenVerse: (bookIndex: number, chapter: number, verse: number) => void;
}

type AnnotationFilter = 'all' | 'notes' | 'highlights' | 'bookmarks';

interface UnifiedEntry {
  id: string;
  bookIndex: number;
  chapter: number;
  verse: number;
  timestamp: number;
  highlight?: VerseHighlight;
  bookmark?: VerseBookmark;
  note?: VerseNote;
}

export function AnnotationsView({
  books,
  translation,
  highlights,
  bookmarks,
  notes,
  onRemoveHighlight,
  onRemoveBookmark,
  onSaveNote,
  onDeleteNote,
  onOpenVerse,
}: AnnotationsViewProps) {
  const [filter, setFilter] = useState<AnnotationFilter>('all');
  const [colorFilter, setColorFilter] = useState<'all' | HighlightColor>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const entries = useMemo(() => {
    const map = new Map<string, UnifiedEntry>();

    Object.values(highlights).forEach((hl) => {
      const existing = map.get(hl.id) ?? {
        id: hl.id,
        bookIndex: hl.bookIndex,
        chapter: hl.chapter,
        verse: hl.verse,
        timestamp: hl.updatedAt,
      };
      existing.highlight = hl;
      existing.timestamp = Math.max(existing.timestamp, hl.updatedAt);
      map.set(hl.id, existing);
    });

    Object.values(bookmarks).forEach((bm) => {
      const existing = map.get(bm.id) ?? {
        id: bm.id,
        bookIndex: bm.bookIndex,
        chapter: bm.chapter,
        verse: bm.verse,
        timestamp: bm.createdAt,
      };
      existing.bookmark = bm;
      existing.timestamp = Math.max(existing.timestamp, bm.createdAt);
      map.set(bm.id, existing);
    });

    Object.values(notes).forEach((nt) => {
      const existing = map.get(nt.id) ?? {
        id: nt.id,
        bookIndex: nt.bookIndex,
        chapter: nt.chapter,
        verse: nt.verse,
        timestamp: nt.updatedAt,
      };
      existing.note = nt;
      existing.timestamp = Math.max(existing.timestamp, nt.updatedAt);
      map.set(nt.id, existing);
    });

    return Array.from(map.values())
      .filter((entry) => {
        if (filter === 'notes' && !entry.note) return false;
        if (filter === 'highlights' && !entry.highlight) return false;
        if (filter === 'bookmarks' && !entry.bookmark) return false;
        if (colorFilter !== 'all' && entry.highlight?.color !== colorFilter) return false;
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [highlights, bookmarks, notes, filter, colorFilter]);

  const counts = {
    all: new Set([
      ...Object.keys(highlights),
      ...Object.keys(bookmarks),
      ...Object.keys(notes),
    ]).size,
    notes: Object.keys(notes).length,
    highlights: Object.keys(highlights).length,
    bookmarks: Object.keys(bookmarks).length,
  };

  const handleCopy = async (entry: UnifiedEntry, text: string) => {
    const book = BOOK_METADATA[entry.bookIndex];
    if (!book) return;
    const formatted = `"${text}" — ${book.name} ${entry.chapter}:${entry.verse} (${TRANSLATIONS[translation].shortName})`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedId(entry.id);
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      // Ignore if clipboard unavailable
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="border-b pb-8" style={{ borderColor: 'var(--border-hairline)' }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Caderno Pessoal
        </p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>
          Anotações, Destaques e Favoritos
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Todos os versículos marcados durante suas leituras ficam salvos neste dispositivo para consulta e estudo contínuo.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div
          className="flex flex-wrap items-center gap-1 rounded-lg border p-1"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}
        >
          {(
            [
              { id: 'all', label: `Tudo (${counts.all})` },
              { id: 'notes', label: `Anotações (${counts.notes})` },
              { id: 'highlights', label: `Destaques (${counts.highlights})` },
              { id: 'bookmarks', label: `Favoritos (${counts.bookmarks})` },
            ] as const
          ).map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className="rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer tabular-nums transition-colors"
                style={{
                  backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Highlight Color Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Cor:
          </span>
          <button
            type="button"
            onClick={() => setColorFilter('all')}
            className="rounded-md border px-2.5 py-1 text-xs cursor-pointer"
            style={{
              backgroundColor: colorFilter === 'all' ? 'var(--text-primary)' : 'transparent',
              borderColor: 'var(--border-hairline)',
              color: colorFilter === 'all' ? 'var(--bg-canvas)' : 'var(--text-secondary)',
            }}
          >
            Todas
          </button>
          {HIGHLIGHT_SWATCHES.map((swatch) => {
            const active = colorFilter === swatch.id;
            return (
              <button
                key={swatch.id}
                type="button"
                onClick={() => setColorFilter(active ? 'all' : swatch.id)}
                title={swatch.label}
                aria-label={`Filtrar por ${swatch.label}`}
                className="h-6 w-6 rounded-full border cursor-pointer transition-transform hover:scale-110"
                style={{
                  backgroundColor: swatch.dotColor,
                  borderColor: active ? 'var(--text-primary)' : 'rgba(0,0,0,0.15)',
                  boxShadow: active ? '0 0 0 2px var(--bg-canvas), 0 0 0 3.5px var(--text-primary)' : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {entries.length === 0 ? (
        <div
          className="mt-10 rounded-xl border p-12 text-center"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-hairline)',
          }}
        >
          <p className="font-display text-2xl font-semibold">
            Nenhum registro encontrado
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Durante a leitura de qualquer capítulo, clique em um versículo para destacar com cores, favoritar ou escrever uma anotação pessoal.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {entries.map((entry) => {
            const book = BOOK_METADATA[entry.bookIndex];
            if (!book) return null;
            const verseText =
              books?.[entry.bookIndex]?.chapters[entry.chapter - 1]?.[entry.verse - 1] ?? '';
            const swatch = entry.highlight
              ? HIGHLIGHT_SWATCHES.find((s) => s.id === entry.highlight!.color)
              : undefined;
            const isEditing = editingId === entry.id;

            return (
              <article
                key={entry.id}
                className="rounded-xl border p-6"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-hairline)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenVerse(entry.bookIndex, entry.chapter, entry.verse)}
                      className="inline-flex items-center gap-1.5 font-display text-2xl font-semibold cursor-pointer hover:underline tabular-nums"
                      style={{ color: 'var(--accent)' }}
                    >
                      <span>
                        {book.name} {entry.chapter}:{entry.verse}
                      </span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {entry.highlight && (
                        <span className="inline-flex items-center gap-1">
                          <Highlighter className="h-3.5 w-3.5" />
                          <span>{swatch?.label}</span>
                        </span>
                      )}
                      {entry.bookmark && (
                        <span className="inline-flex items-center gap-1">
                          <Bookmark className="h-3.5 w-3.5 fill-current" style={{ color: 'var(--accent)' }} />
                          <span>Favorito</span>
                        </span>
                      )}
                      {entry.note && (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Anotação</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {verseText && (
                      <button
                        type="button"
                        onClick={() => handleCopy(entry, verseText)}
                        className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer"
                        style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
                      >
                        {copiedId === entry.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    )}

                    {entry.highlight && (
                      <button
                        type="button"
                        onClick={() => onRemoveHighlight(entry.bookIndex, entry.chapter, entry.verse)}
                        title="Remover destaque"
                        className="rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer"
                        style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
                      >
                        Tirar cor
                      </button>
                    )}

                    {entry.bookmark && (
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(entry.bookIndex, entry.chapter, entry.verse)}
                        title="Remover favorito"
                        className="rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer"
                        style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
                      >
                        Desfavoritar
                      </button>
                    )}
                  </div>
                </div>

                {verseText && (
                  <p
                    className="rounded-lg px-3.5 py-2.5 font-scripture-serif text-base leading-relaxed"
                    style={{
                      backgroundColor: swatch?.bgVar ?? 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    “{verseText}”
                  </p>
                )}

                {entry.note && !isEditing && (
                  <div className="mt-4 flex items-start justify-between gap-4 border-t pt-4" style={{ borderColor: 'var(--border-hairline)' }}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {entry.note.text}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(entry.id);
                          setEditDraft(entry.note!.text);
                        }}
                        className="rounded-lg border px-2.5 py-1 text-xs cursor-pointer"
                        style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-secondary)' }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(entry.id)}
                        aria-label="Excluir anotação"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border cursor-pointer"
                        style={{ borderColor: 'var(--border-hairline)', color: 'var(--text-muted)' }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border-hairline)' }}>
                    <textarea
                      rows={3}
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="w-full rounded-lg border p-3 text-sm outline-none"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border px-3 py-1.5 text-xs cursor-pointer"
                        style={{ borderColor: 'var(--border-hairline)' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSaveNote(entry.bookIndex, entry.chapter, entry.verse, editDraft);
                          setEditingId(null);
                        }}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer"
                        style={{
                          backgroundColor: 'var(--text-primary)',
                          color: 'var(--bg-canvas)',
                        }}
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
