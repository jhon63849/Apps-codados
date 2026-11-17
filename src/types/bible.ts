export type TranslationId = 'aa' | 'acf';

export type ThemeMode = 'light' | 'sepia' | 'dark';

export type ScriptFontFamily = 'serif' | 'sans';

export type ReaderMeasure = 'compact' | 'editorial' | 'wide';

export type ReadingFlow = 'verse' | 'paragraph';

export type HighlightColor = 'amber' | 'sage' | 'lapis' | 'terracotta';

export type TestamentId = 'AT' | 'NT';

export type AppSection = 'leitura' | 'livros' | 'planos' | 'anotacoes';

export type BookDivision =
  | 'Pentateuco'
  | 'Históricos'
  | 'Poéticos'
  | 'Profetas Maiores'
  | 'Profetas Menores'
  | 'Evangelhos'
  | 'Histórico'
  | 'Cartas Paulinas'
  | 'Cartas Gerais'
  | 'Profético';

export interface BibleBook {
  abbrev: string;
  name: string;
  chapters: string[][];
}

export interface BookMeta {
  index: number;
  abbrev: string;
  name: string;
  testament: TestamentId;
  division: BookDivision;
  chaptersCount: number;
  aliases: string[];
}

export interface VerseKey {
  bookIndex: number;
  chapter: number; // 1-indexed
  verse: number; // 1-indexed
}

export interface VerseHighlight {
  id: string; // `${bookIndex}:${chapter}:${verse}`
  bookIndex: number;
  chapter: number;
  verse: number;
  color: HighlightColor;
  updatedAt: number;
}

export interface VerseBookmark {
  id: string; // `${bookIndex}:${chapter}:${verse}`
  bookIndex: number;
  chapter: number;
  verse: number;
  createdAt: number;
}

export interface VerseNote {
  id: string; // `${bookIndex}:${chapter}:${verse}`
  bookIndex: number;
  chapter: number;
  verse: number;
  text: string;
  updatedAt: number;
}

export interface ReaderSettings {
  theme: ThemeMode;
  fontFamily: ScriptFontFamily;
  fontSize: number; // px, 16..24
  lineHeight: number; // 1.55..2.0
  measure: ReaderMeasure;
  flow: ReadingFlow;
  showDropCap: boolean;
}

export interface PlanPassage {
  bookIndex: number;
  startChapter: number;
  endChapter: number;
  label: string;
}

export interface ReadingPlanDay {
  day: number;
  title: string;
  passages: PlanPassage[];
}

export interface ReadingPlan {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  durationLabel: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  days: ReadingPlanDay[];
}

export interface SearchMatch {
  bookIndex: number;
  bookName: string;
  abbrev: string;
  testament: TestamentId;
  chapter: number; // 1-indexed
  verse: number; // 1-indexed
  text: string;
}
