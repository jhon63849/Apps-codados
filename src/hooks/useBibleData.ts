import { useEffect, useState, useCallback } from 'react';
import { BOOK_METADATA } from '../data/bibleMetadata';
import { BibleBook, SearchMatch, TestamentId, TranslationId } from '../types/bible';

const bibleCache: Partial<Record<TranslationId, BibleBook[]>> = {};
const inflightRequests: Partial<Record<TranslationId, Promise<BibleBook[]>>> = {};

export function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export async function loadBibleTranslation(translation: TranslationId): Promise<BibleBook[]> {
  if (bibleCache[translation]) {
    return bibleCache[translation]!;
  }
  if (inflightRequests[translation]) {
    return inflightRequests[translation]!;
  }

  const req = fetch(`/data/${translation}.json`)
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Falha ao carregar tradução (${res.status})`);
      }
      const data = (await res.json()) as BibleBook[];
      bibleCache[translation] = data;
      return data;
    })
    .finally(() => {
      delete inflightRequests[translation];
    });

  inflightRequests[translation] = req;
  return req;
}

export interface ParsedReference {
  bookIndex: number;
  chapter: number;
  verse?: number;
}

export function parseBibleReference(rawQuery: string): ParsedReference | null {
  const cleaned = normalizeText(rawQuery).replace(/\./g, ':');
  if (!cleaned) return null;

  const match = cleaned.match(/^(\d?\s*[a-z]+(?:\s+[a-z]+)*?)\s+(\d+)(?::(\d+))?$/);
  if (!match) {
    // Check if user typed just a book name
    const bookOnly = BOOK_METADATA.find(
      (b) => normalizeText(b.name) === cleaned || b.aliases.includes(cleaned)
    );
    if (bookOnly) {
      return { bookIndex: bookOnly.index, chapter: 1 };
    }
    return null;
  }

  const bookPart = match[1].replace(/\s+/g, ' ').trim();
  const chapterNum = parseInt(match[2], 10);
  const verseNum = match[3] ? parseInt(match[3], 10) : undefined;

  const book = BOOK_METADATA.find(
    (b) =>
      normalizeText(b.name) === bookPart ||
      b.aliases.includes(bookPart) ||
      normalizeText(b.name).startsWith(bookPart)
  );

  if (!book) return null;
  if (chapterNum < 1 || chapterNum > book.chaptersCount) return null;

  return {
    bookIndex: book.index,
    chapter: chapterNum,
    verse: verseNum,
  };
}

export function useBibleData(translation: TranslationId) {
  const [books, setBooks] = useState<BibleBook[] | null>(() => bibleCache[translation] ?? null);
  const [loading, setLoading] = useState<boolean>(!bibleCache[translation]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (bibleCache[translation]) {
      setBooks(bibleCache[translation]!);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    loadBibleTranslation(translation)
      .then((data) => {
        if (!active) return;
        setBooks(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar o texto bíblico.');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [translation]);

  const getChapterVerses = useCallback(
    (bookIndex: number, chapter: number): string[] => {
      if (!books || !books[bookIndex]) return [];
      return books[bookIndex].chapters[chapter - 1] ?? [];
    },
    [books]
  );

  const searchVerses = useCallback(
    (query: string, testamentFilter: 'ALL' | TestamentId = 'ALL', limit = 80): SearchMatch[] => {
      if (!books) return [];
      const normQuery = normalizeText(query);
      if (normQuery.length < 2) return [];

      const results: SearchMatch[] = [];
      for (let bIdx = 0; bIdx < books.length; bIdx++) {
        const meta = BOOK_METADATA[bIdx];
        if (!meta) continue;
        if (testamentFilter !== 'ALL' && meta.testament !== testamentFilter) continue;

        const book = books[bIdx];
        for (let cIdx = 0; cIdx < book.chapters.length; cIdx++) {
          const verses = book.chapters[cIdx];
          for (let vIdx = 0; vIdx < verses.length; vIdx++) {
            const text = verses[vIdx];
            if (normalizeText(text).includes(normQuery)) {
              results.push({
                bookIndex: bIdx,
                bookName: meta.name,
                abbrev: meta.abbrev,
                testament: meta.testament,
                chapter: cIdx + 1,
                verse: vIdx + 1,
                text,
              });
              if (results.length >= limit) return results;
            }
          }
        }
      }
      return results;
    },
    [books]
  );

  return {
    books,
    loading,
    error,
    getChapterVerses,
    searchVerses,
    retry: () => loadBibleTranslation(translation).then(setBooks),
  };
}
