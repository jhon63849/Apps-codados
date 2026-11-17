import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { BOOK_METADATA, TRANSLATIONS } from '../data/bibleMetadata';
import { normalizeText, parseBibleReference } from '../hooks/useBibleData';
import { SearchMatch, TestamentId, TranslationId } from '../types/bible';

interface SearchModalProps {
  isOpen: boolean;
  translation: TranslationId;
  searchVerses: (query: string, testamentFilter: 'ALL' | TestamentId, limit?: number) => SearchMatch[];
  onNavigateToVerse: (bookIndex: number, chapter: number, verse?: number) => void;
  onClose: () => void;
}

function highlightMatch(text: string, query: string) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return text;
  const normText = normalizeText(text);
  const normQuery = normalizeText(cleanQuery);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + cleanQuery.length);
  const after = text.slice(idx + cleanQuery.length);

  return (
    <>
      {before}
      <mark
        className="rounded px-0.5 font-medium"
        style={{ backgroundColor: 'var(--hl-amber)', color: 'var(--text-primary)' }}
      >
        {match}
      </mark>
      {after}
    </>
  );
}

const SUGGESTED_TERMS = ['pastor', 'esperança', 'amor', 'sabedoria', 'Salmos 23', 'João 3:16'];

export function SearchModal({
  isOpen,
  translation,
  searchVerses,
  onNavigateToVerse,
  onClose,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | TestamentId>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const parsedRef = useMemo(() => parseBibleReference(query), [query]);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    return searchVerses(query, testamentFilter, 60);
  }, [query, testamentFilter, searchVerses]);

  if (!isOpen) return null;

  const refBook = parsedRef ? BOOK_METADATA[parsedRef.bookIndex] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20"
      style={{ backgroundColor: 'rgba(18, 16, 14, 0.55)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar nas Escrituras"
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border shadow-xl"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          borderColor: 'var(--border-hairline)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Row */}
        <div
          className="flex items-center gap-3 border-b px-4 py-3.5"
          style={{ borderColor: 'var(--border-hairline)' }}
        >
          <Search className="h-5 w-5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar palavra, tema ou referência (ex: João 3:16, Salmos 23)..."
            className="w-full bg-transparent text-base outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded px-2 py-1 text-xs cursor-pointer hover:opacity-75"
              style={{ color: 'var(--text-muted)' }}
            >
              Limpar
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca"
            className="flex h-9 w-9 items-center justify-center rounded-lg cursor-pointer hover:opacity-75"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Testament Filter & Count */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2.5"
          style={{ borderColor: 'var(--border-hairline)', backgroundColor: 'var(--bg-surface)' }}
        >
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ backgroundColor: 'var(--bg-canvas)' }}>
            {(
              [
                { id: 'ALL', label: 'Toda a Bíblia' },
                { id: 'AT', label: 'Antigo Testamento' },
                { id: 'NT', label: 'Novo Testamento' },
              ] as const
            ).map((tab) => {
              const active = testamentFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTestamentFilter(tab.id)}
                  className="rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors"
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

          <span className="text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {TRANSLATIONS[translation].shortName}
            {query.trim().length >= 2 && ` · ${results.length}${results.length === 60 ? '+' : ''} resultados`}
          </span>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Direct reference jump card */}
          {parsedRef && refBook && (
            <button
              type="button"
              onClick={() => {
                onNavigateToVerse(parsedRef.bookIndex, parsedRef.chapter, parsedRef.verse);
                onClose();
              }}
              className="mb-4 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--accent-soft)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
                    Ir diretamente para a referência
                  </p>
                  <p className="font-display text-xl font-semibold">
                    {refBook.name} {parsedRef.chapter}
                    {parsedRef.verse ? `:${parsedRef.verse}` : ''}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
            </button>
          )}

          {query.trim().length < 2 ? (
            <div className="py-6">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                Sugestões de pesquisa
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TERMS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-lg border px-3 py-1.5 text-sm cursor-pointer transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      borderColor: 'var(--border-hairline)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 && !parsedRef ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Nenhum versículo encontrado para "{query}"
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Tente buscar outra palavra-chave ou digite uma referência como "Salmos 23".
              </p>
            </div>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
              {results.map((item) => (
                <li key={`${item.bookIndex}:${item.chapter}:${item.verse}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToVerse(item.bookIndex, item.chapter, item.verse);
                      onClose();
                    }}
                    className="block w-full py-3.5 text-left cursor-pointer transition-opacity hover:opacity-80"
                  >
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                      <span className="tabular-nums">
                        {item.bookName} {item.chapter}:{item.verse}
                      </span>
                      <span aria-hidden="true" style={{ color: 'var(--text-muted)' }}>·</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {item.testament === 'AT' ? 'Antigo Testamento' : 'Novo Testamento'}
                      </span>
                    </div>
                    <p
                      className="mt-1 font-scripture-serif text-base leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {highlightMatch(item.text, query)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
