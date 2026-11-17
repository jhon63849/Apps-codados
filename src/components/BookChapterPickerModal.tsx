import { useState, useMemo, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';
import { BOOK_METADATA } from '../data/bibleMetadata';
import { normalizeText } from '../hooks/useBibleData';
import { makeChapterId } from '../hooks/useReaderStorage';
import { TestamentId } from '../types/bible';

interface BookChapterPickerModalProps {
  isOpen: boolean;
  currentBookIndex: number;
  currentChapter: number;
  readChapters: Record<string, boolean>;
  onSelect: (bookIndex: number, chapter: number) => void;
  onClose: () => void;
}

export function BookChapterPickerModal({
  isOpen,
  currentBookIndex,
  currentChapter,
  readChapters,
  onSelect,
  onClose,
}: BookChapterPickerModalProps) {
  const [selectedBookIndex, setSelectedBookIndex] = useState(currentBookIndex);
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | TestamentId>('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedBookIndex(currentBookIndex);
      setQuery('');
    }
  }, [isOpen, currentBookIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const filteredBooks = useMemo(() => {
    const q = normalizeText(query);
    return BOOK_METADATA.filter((book) => {
      if (testamentFilter !== 'ALL' && book.testament !== testamentFilter) return false;
      if (!q) return true;
      return (
        normalizeText(book.name).includes(q) ||
        book.aliases.some((alias) => alias.includes(q))
      );
    });
  }, [testamentFilter, query]);

  if (!isOpen) return null;

  const activeBook = BOOK_METADATA[selectedBookIndex] ?? BOOK_METADATA[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(18, 16, 14, 0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar livro e capítulo"
    >
      <div
        className="flex h-[min(82vh,640px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border shadow-xl"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between gap-4 border-b px-5 py-4"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Índice das Escrituras
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar seletor"
            className="flex h-10 w-10 items-center justify-center rounded-lg cursor-pointer transition-colors hover:opacity-75"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3"
          style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--bg-canvas)' }}>
            {(
              [
                { id: 'ALL', label: 'Todos (66)' },
                { id: 'AT', label: 'Antigo (39)' },
                { id: 'NT', label: 'Novo (27)' },
              ] as const
            ).map((tab) => {
              const active = testamentFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTestamentFilter(tab.id)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
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

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrar livro..."
              className="w-full rounded-lg border py-1.5 pl-8 pr-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-hairline)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Two-column Book & Chapter Body */}
        <div className="grid flex-1 min-h-0 grid-cols-1 md:grid-cols-12">
          {/* Books List */}
          <div
            className="overflow-y-auto border-b md:col-span-5 md:border-b-0 md:border-r p-3 max-h-56 md:max-h-none"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {filteredBooks.length === 0 ? (
              <p className="px-3 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
                Nenhum livro encontrado.
              </p>
            ) : (
              <ul className="space-y-0.5">
                {filteredBooks.map((book) => {
                  const isSelected = book.index === selectedBookIndex;
                  return (
                    <li key={book.abbrev}>
                      <button
                        type="button"
                        onClick={() => setSelectedBookIndex(book.index)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm cursor-pointer transition-colors"
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-soft)' : 'transparent',
                          color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                          fontWeight: isSelected ? 600 : 400,
                        }}
                      >
                        <span className="truncate">{book.name}</span>
                        <span
                          className="text-xs tabular-nums ml-2 shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {book.chaptersCount}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Chapters Matrix */}
          <div className="overflow-y-auto md:col-span-7 p-5">
            <div className="mb-4 flex items-baseline justify-between gap-4 border-b pb-3" style={{ borderColor: 'var(--border-hairline)' }}>
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {activeBook.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'} · {activeBook.division}
                </p>
                <h3 className="font-display text-2xl font-semibold mt-0.5">{activeBook.name}</h3>
              </div>
              <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {activeBook.chaptersCount} {activeBook.chaptersCount === 1 ? 'capítulo' : 'capítulos'}
              </span>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {Array.from({ length: activeBook.chaptersCount }, (_, idx) => idx + 1).map((ch) => {
                const isCurrent =
                  activeBook.index === currentBookIndex && ch === currentChapter;
                const isRead = Boolean(readChapters[makeChapterId(activeBook.index, ch)]);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      onSelect(activeBook.index, ch);
                      onClose();
                    }}
                    className="relative flex h-11 items-center justify-center rounded-lg border text-sm font-medium tabular-nums cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isCurrent
                        ? 'var(--text-primary)'
                        : isRead
                        ? 'var(--accent-soft)'
                        : 'var(--bg-canvas)',
                      borderColor: isCurrent ? 'var(--text-primary)' : 'var(--border-hairline)',
                      color: isCurrent
                        ? 'var(--bg-canvas)'
                        : isRead
                        ? 'var(--accent)'
                        : 'var(--text-primary)',
                    }}
                  >
                    {ch}
                    {isRead && !isCurrent && (
                      <Check
                        className="absolute right-1 top-1 h-2.5 w-2.5"
                        style={{ color: 'var(--accent)' }}
                        aria-label="Lido"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
