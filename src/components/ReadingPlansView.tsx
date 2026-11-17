import { useState } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronRight } from 'lucide-react';
import { READING_PLANS } from '../data/bibleMetadata';
import { ReadingPlan } from '../types/bible';

interface ReadingPlansViewProps {
  planProgress: Record<string, number[]>;
  onTogglePlanDay: (planId: string, day: number) => void;
  onOpenPassage: (bookIndex: number, chapter: number) => void;
}

function PlanImage({ src, alt, title }: { src: string; alt: string; title: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center p-6 text-center"
        style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
      >
        <div>
          <BookOpen className="mx-auto h-6 w-6 mb-2" style={{ color: 'var(--accent)' }} />
          <span className="font-display text-lg font-medium">{title}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
}

export function ReadingPlansView({
  planProgress,
  onTogglePlanDay,
  onOpenPassage,
}: ReadingPlansViewProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const selectedPlan: ReadingPlan | undefined = READING_PLANS.find(
    (p) => p.id === selectedPlanId
  );

  if (selectedPlan) {
    const completedDays = planProgress[selectedPlan.id] ?? [];
    const percent = Math.round((completedDays.length / selectedPlan.days.length) * 100);

    return (
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
        <button
          type="button"
          onClick={() => setSelectedPlanId(null)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium cursor-pointer hover:underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Todos os planos de leitura</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch border-b pb-8" style={{ borderColor: 'var(--border-hairline)' }}>
          <div className="md:col-span-5 overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-hairline)' }}>
            <PlanImage
              src={selectedPlan.imageUrl}
              alt={selectedPlan.imageAlt}
              title={selectedPlan.title}
            />
          </div>

          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{selectedPlan.category}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{selectedPlan.durationLabel}</span>
              </div>
              <h1 className="font-display mt-2 text-3xl sm:text-4xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>
                {selectedPlan.title}
              </h1>
              <p className="mt-3 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {selectedPlan.description}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span style={{ color: 'var(--text-secondary)' }}>Progresso do plano</span>
                <span className="font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
                  {completedDays.length} / {selectedPlan.days.length} dias ({percent}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${percent}%`, backgroundColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Day-by-Day Checklist */}
        <ul className="mt-8 divide-y" style={{ borderColor: 'var(--border-hairline)' }}>
          {selectedPlan.days.map((dayItem) => {
            const isDone = completedDays.includes(dayItem.day);
            return (
              <li
                key={dayItem.day}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onTogglePlanDay(selectedPlan.id, dayItem.day)}
                    aria-label={isDone ? `Desmarcar dia ${dayItem.day}` : `Concluir dia ${dayItem.day}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isDone ? 'var(--accent)' : 'var(--bg-elevated)',
                      borderColor: isDone ? 'var(--accent)' : 'var(--border-hairline)',
                      color: isDone ? 'var(--accent-contrast)' : 'var(--text-muted)',
                    }}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-semibold tabular-nums">{dayItem.day}</span>
                    )}
                  </button>

                  <div>
                    <p
                      className="text-xs uppercase tracking-widest tabular-nums"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Dia {dayItem.day}
                    </p>
                    <h3
                      className={`font-display text-xl font-semibold ${
                        isDone ? 'line-through opacity-65' : ''
                      }`}
                    >
                      {dayItem.title}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {dayItem.passages.map((p) => (
                    <button
                      key={`${dayItem.day}-${p.label}`}
                      type="button"
                      onClick={() => onOpenPassage(p.bookIndex, p.startChapter)}
                      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-hairline)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span>Ler {p.label}</span>
                      <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="border-b pb-8" style={{ borderColor: 'var(--border-hairline)' }}>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Percursos Guiados
        </p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl font-semibold tracking-tight" style={{ textWrap: 'balance' }}>
          Planos de Leitura
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Roteiros estruturados para acompanhar os Evangelhos, livros sapienciais, cartas apostólicas e as grandes narrativas bíblicas no seu ritmo.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        {READING_PLANS.map((plan) => {
          const completed = planProgress[plan.id]?.length ?? 0;
          const total = plan.days.length;
          const percent = Math.round((completed / total) * 100);

          return (
            <article
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className="group flex flex-col overflow-hidden rounded-xl border cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-hairline)',
              }}
            >
              <div className="overflow-hidden border-b" style={{ borderColor: 'var(--border-hairline)' }}>
                <PlanImage src={plan.imageUrl} alt={plan.imageAlt} title={plan.title} />
              </div>

              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{plan.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{plan.durationLabel}</span>
                  </div>
                  <h2 className="font-display mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                    {plan.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {plan.subtitle}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border-hairline)' }}>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {completed > 0
                        ? `${completed} de ${total} dias concluídos (${percent}%)`
                        : `${total} leituras diárias`}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium" style={{ color: 'var(--accent)' }}>
                      {completed > 0 ? 'Continuar' : 'Iniciar plano'}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-surface)' }}>
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${percent}%`, backgroundColor: 'var(--accent)' }}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
