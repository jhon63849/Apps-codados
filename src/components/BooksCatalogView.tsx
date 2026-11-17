import { useState, useMemo } from 'react';
import { Search, Check, ChevronRight } from 'lucide-react';
import { BOOK_METADATA, TOTAL_CHAPTERS } from '../data/bibleMetadata';
import { normalizeText } from '../hooks/useBibleData';
import { makeChapterId } from '../hooks/useReaderStorage';
import { BookDivision, TestamentId } from '../types/bible';

interface BooksCatalogViewProps {
  currentBookIndex: number;
  readChapters: Record<string, boolean>;
  onSelectChapter: (bookIndex: number, chapter: number) => void;
}

const DIVISIONS: ('ALL' | BookDivision)[] = [
  'ALL',
  'Pentateuco',
  'Históricos',
  'Poéticos',
  'Profetas Maiores',
  'Profetas Menores',
  'Evangelhos',
  'Cartas Paulinas',
  'Cartas Gerais',
  'Profético',
];

export function BooksCatalogView({
  currentBookIndex,
  readChapters,
  onSelectChapter,
}: BooksCatalogViewProps) {
  const [testament, setTestament] = useState<'ALL' | TestamentId>('ALL');
  const [division, setDivision] = useState<'ALL' | BookDivision>('ALL');
  const [query, setQuery] = useState('');
  const [expandedBookIndex, setExpandedBookIndex] = useState<number | null>(currentBookIndex);

  const filteredBooks = useMemo(() => {
    const q = normalizeText(query);
    return BOOK_METADATA.filter((b) => {
      if (testament !== 'ALL' && b.testament !== testament) return false;
      if (division !== 'ALL' && b.division !== division) return false;
      if (!q) return true;
      return normalizeText(b.name).includes(q) || b.aliases.some((a) => a.includes(q));
    });
  }, [testament, division, query]);

  const totalRead = Object.keys(readChapters).length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      {/* Editorial Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-8" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Cânon das Escrituras · 66 Livros
          </p>
          <h1 className="font-display mt-2 text-4xl sm:text-5xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>
            Índice Completo dos Livros
          </h1>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Navegue pelo Antigo e Novo Testamento por gênero literário ou abra diretamente qualquer capítulo.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Capítulos concluídos
          </p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
            {totalRead} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>/ {TOTAL_CHAPTERS}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border p-1" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-hairline)' }}>
            {(
              [
                { id: 'ALL', label: 'Todos (66)' },
                { id: 'AT', label: 'Antigo (39)' },
                { id: 'NT', label: 'Novo (27)' },
              ] as const
            ).map((tab) => {
              const active = testament === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setTestament(tab.id);
                    setDivision('ALL');
                  }}
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

          <select
            value={division}
            onChange={(e) => setDivision(e.target.value as 'ALL' | BookDivision)}
            aria-label="Filtrar por divisão literária"
            className="h-9 rounded-lg border px-3 text-xs font-medium outline-none cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          >
            {DIVISIONS.map((div) => (
              <option key={div} value={div}>
                {div === 'ALL' ? 'Todas as divisões' : div}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar livro..."
            className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-hairline)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base font-medium">Nenhum livro corresponde aos filtros selecionados.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => {
            const isExpanded = expandedBookIndex === book.index;
            let readInBook = 0;
            for (let c = 1; c <= book.chaptersCount; c++) {
              if (readChapters[makeChapterId(book.index, c)]) readInBook++;
            }

            return (
              <div
                key={book.abbrev}
                className="rounded-xl border transition-colors"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: isExpanded ? 'var(--accent)' : 'var(--border-hairline)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedBookIndex(isExpanded ? null : book.index)}
                  className="flex w-full items-start justify-between gap-4 p-5 text-left cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{book.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{book.division}</span>
                    </div>
                    <h2 className="font-display mt-1 text-2xl font-semibold">{book.name}</h2>
                    <p className="mt-1.5 text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {book.chaptersCount} {book.chaptersCount === 1 ? 'capítulo' : 'capítulos'}
                      {readInBook > 0 && ` · ${readInBook} lidos`}
                    </p>
                  </div>

                  <ChevronRight
                    className={`mt-1 h-4 w-4 shrink-0 transition-transform duration-150 ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                    style={{ color: 'var(--text-muted)' }}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border-hairline)' }}>
                    <div className="grid grid-cols-6 gap-1.5">
                      {Array.from({ length: book.chaptersCount }, (_, i) => i + 1).map((ch) => {
                        const isRead = Boolean(readChapters[makeChapterId(book.index, ch)]);
                        return (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => onSelectChapter(book.index, ch)}
                            className="relative flex h-9 items-center justify-center rounded-md border text-xs font-medium tabular-nums cursor-pointer transition-colors hover:opacity-85"
                            style={{
                              backgroundColor: isRead ? 'var(--accent-soft)' : 'var(--bg-canvas)',
                              borderColor: 'var(--border-hairline)',
                              color: isRead ? 'var(--accent)' : 'var(--text-primary)',
                            }}
                          >
                            {ch}
                            {isRead && (
                              <Check className="absolute right-0.5 top-0.5 h-2.5 w-2.5" style={{ color: 'var(--accent)' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
