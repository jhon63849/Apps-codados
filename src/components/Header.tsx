import { Search } from 'lucide-react';
import { AppSection } from '../types/bible';

interface HeaderProps {
  activeSection: AppSection;
  onSelectSection: (section: AppSection) => void;
  onOpenSearch: () => void;
  hidden?: boolean;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'leitura', label: 'Leitura' },
  { id: 'livros', label: 'Livros' },
  { id: 'planos', label: 'Planos' },
  { id: 'anotacoes', label: 'Anotações' },
];

export function Header({ activeSection, onSelectSection, onOpenSearch, hidden }: HeaderProps) {
  if (hidden) return null;

  return (
    <header
      className="sticky top-0 z-30 border-b transition-colors duration-150"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        borderColor: 'var(--border-hairline)',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:gap-8 sm:px-8">
        {/* Zone 1: Single wordmark */}
        <button
          type="button"
          onClick={() => onSelectSection('leitura')}
          className="font-display text-2xl font-semibold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Escritura
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav aria-label="Navegação principal" className="flex items-center gap-4 sm:gap-7 overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className="relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    className="absolute inset-x-0 -bottom-[1px] h-[2px]"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Buscar nas Escrituras"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-opacity duration-150 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-canvas)',
            }}
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Buscar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
