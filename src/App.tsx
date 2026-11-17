import { useState, useEffect, useCallback } from 'react';
import { AnnotationsView } from './components/AnnotationsView';
import { BookChapterPickerModal } from './components/BookChapterPickerModal';
import { BooksCatalogView } from './components/BooksCatalogView';
import { Header } from './components/Header';
import { ReaderView } from './components/ReaderView';
import { ReadingPlansView } from './components/ReadingPlansView';
import { SearchModal } from './components/SearchModal';
import { useBibleData } from './hooks/useBibleData';
import { useReaderStorage } from './hooks/useReaderStorage';
import { AppSection } from './types/bible';

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('leitura');
  const [targetVerse, setTargetVerse] = useState<number | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  const {
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
    planProgress,
    togglePlanDay,
  } = useReaderStorage();

  const { books, loading, error, searchVerses, retry } = useBibleData(translation);

  const navigateTo = useCallback(
    (bookIndex: number, chapter: number, verse: number | null = null) => {
      setLocation({ bookIndex, chapter });
      setTargetVerse(verse);
      setActiveSection('leitura');
    },
    [setLocation]
  );

  // Global Cmd+K / Ctrl+K shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="min-h-screen transition-colors duration-150"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      <Header
        activeSection={activeSection}
        onSelectSection={(section) => {
          setFocusMode(false);
          setActiveSection(section);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        hidden={focusMode && activeSection === 'leitura'}
      />

      {activeSection === 'leitura' && (
        <ReaderView
          bookIndex={location.bookIndex}
          chapter={location.chapter}
          targetVerse={targetVerse}
          translation={translation}
          books={books}
          loading={loading}
          error={error}
          onRetry={retry}
          settings={settings}
          onUpdateSettings={updateSettings}
          onChangeTranslation={setTranslation}
          onNavigate={navigateTo}
          onOpenPicker={() => setIsPickerOpen(true)}
          highlights={highlights}
          onSetHighlight={setVerseHighlight}
          bookmarks={bookmarks}
          onToggleBookmark={toggleBookmark}
          notes={notes}
          onSaveNote={saveNote}
          readChapters={readChapters}
          onToggleChapterRead={toggleChapterRead}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode((prev) => !prev)}
        />
      )}

      {activeSection === 'livros' && (
        <BooksCatalogView
          currentBookIndex={location.bookIndex}
          readChapters={readChapters}
          onSelectChapter={(bIdx, ch) => navigateTo(bIdx, ch, null)}
        />
      )}

      {activeSection === 'planos' && (
        <ReadingPlansView
          planProgress={planProgress}
          onTogglePlanDay={togglePlanDay}
          onOpenPassage={(bIdx, ch) => navigateTo(bIdx, ch, null)}
        />
      )}

      {activeSection === 'anotacoes' && (
        <AnnotationsView
          books={books}
          translation={translation}
          highlights={highlights}
          bookmarks={bookmarks}
          notes={notes}
          onRemoveHighlight={(b, c, v) => setVerseHighlight(b, c, v, null)}
          onRemoveBookmark={toggleBookmark}
          onSaveNote={saveNote}
          onDeleteNote={deleteNote}
          onOpenVerse={(b, c, v) => navigateTo(b, c, v)}
        />
      )}

      <BookChapterPickerModal
        isOpen={isPickerOpen}
        currentBookIndex={location.bookIndex}
        currentChapter={location.chapter}
        readChapters={readChapters}
        onSelect={(bIdx, ch) => navigateTo(bIdx, ch, null)}
        onClose={() => setIsPickerOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        translation={translation}
        searchVerses={searchVerses}
        onNavigateToVerse={(bIdx, ch, v) => navigateTo(bIdx, ch, v ?? null)}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
