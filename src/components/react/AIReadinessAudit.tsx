import { useState } from 'react';
import { questions, calculateAuditResult, type AuditResult } from '../../lib/audit-data';
import RadarChart from './RadarChart';

const WEB3FORMS_KEY = '177c045b-3001-4911-ac1d-27cb026478e3';

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm text-text-muted mb-2">
        <span>Pytanie {current + 1} z {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuestionView({
  questionIndex,
  selectedAnswer,
  onAnswer,
  onPrev,
  isFirst,
}: {
  questionIndex: number;
  selectedAnswer: number | null;
  onAnswer: (score: number) => void;
  onPrev: () => void;
  isFirst: boolean;
}) {
  const q = questions[questionIndex];
  return (
    <div>
      <div className="text-xs text-accent font-label font-semibold uppercase tracking-wider mb-3">
        {q.category}
      </div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-6">
        {q.question}
      </h2>
      <div className="grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(opt.score)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              selectedAnswer === opt.score
                ? 'border-accent bg-accent/10'
                : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
            }`}
          >
            <span className="text-text-primary">{opt.label}</span>
          </button>
        ))}
      </div>
      {!isFirst && (
        <button
          onClick={onPrev}
          className="mt-6 text-text-muted hover:text-accent-light text-sm transition-colors"
        >
          ← Poprzednie pytanie
        </button>
      )}
    </div>
  );
}

function ResultView({ result }: { result: AuditResult }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [email, setEmail] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('sending');
    try {
      const breakdown = result.categories.map((c) => `${c.label}: ${c.score}/${c.maxScore}`).join(', ');
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Audyt AI — ${result.level} (${result.percentage}%)`,
          email,
          message: `Wynik audytu: ${result.totalScore}/${result.maxScore} (${result.percentage}%)\nPoziom: ${result.level}\nKategorie: ${breakdown}\nRekomendacje:\n${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
        }),
      });
      setFormState(res.ok ? 'sent' : 'error');
    } catch {
      setFormState('error');
    }
  }

  const levelColor =
    result.percentage <= 30
      ? 'text-red-400'
      : result.percentage <= 60
        ? 'text-amber-400'
        : result.percentage <= 85
          ? 'text-emerald-400'
          : 'text-accent-light';

  return (
    <div>
      <div className="text-center mb-8">
        <div className="text-text-muted text-sm mb-2">Twój wynik</div>
        <div className={`text-5xl font-display font-bold ${levelColor}`}>
          {result.totalScore}<span className="text-2xl text-text-dim">/{result.maxScore}</span>
        </div>
        <div className={`text-lg font-semibold mt-2 ${levelColor}`}>{result.level}</div>
        <p className="text-text-muted mt-2 max-w-lg mx-auto">{result.levelDescription}</p>
      </div>

      <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4 text-center">Profil gotowości</h3>
        <RadarChart categories={result.categories} size={300} />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6">
          {result.categories.map((cat) => (
            <div key={cat.key} className="text-center">
              <div className="text-xs text-text-dim font-label uppercase tracking-wider">{cat.label}</div>
              <div className="text-lg font-bold text-text-primary">{cat.score}<span className="text-sm text-text-dim">/{cat.maxScore}</span></div>
              <div className="h-1.5 bg-bg-surface rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Rekomendacje dla Twojej firmy</h3>
        <div className="space-y-4">
          {result.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 text-accent-light flex items-center justify-center shrink-0 text-sm font-semibold">
                {i + 1}
              </div>
              <p className="text-text-muted leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-accent/10 via-bg-card to-bg-card border border-accent/20 rounded-2xl p-6 text-center mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">Umów bezpłatną konsultację AI</h3>
        <p className="text-text-muted text-sm mb-4">
          Przeanalizujemy Twoje wyniki i zaproponujemy konkretny plan wdrożenia AI w Twojej firmie.
        </p>
        <a
          href="mailto:kontakt@voxquartzsystems.pl"
          className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
        >
          Umów konsultację
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>

      {formState === 'sent' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="text-emerald-400 font-semibold">Wyniki wysłane na Twój email!</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-xl p-4">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Twój email — wyślę Ci wyniki"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={formState === 'sending'}
              className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {formState === 'sending' ? 'Wysyłanie...' : 'Wyślij wyniki'}
            </button>
          </div>
          {formState === 'error' && (
            <p className="text-red-400 text-xs mt-2">Błąd wysyłania. Spróbuj ponownie.</p>
          )}
        </form>
      )}
    </div>
  );
}

export default function AIReadinessAudit() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);

  function handleAnswer(score: number) {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = score;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((q) => q + 1);
      } else {
        setShowResult(true);
      }
    }, 300);
  }

  function handlePrev() {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
    }
  }

  function handleRestart() {
    setAnswers(Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResult(false);
  }

  const result = showResult ? calculateAuditResult(answers) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8">
        {showResult && result ? (
          <>
            <ResultView result={result} />
            <button
              onClick={handleRestart}
              className="mt-6 text-text-muted hover:text-accent-light text-sm transition-colors block mx-auto"
            >
              ← Wypełnij ponownie
            </button>
          </>
        ) : (
          <>
            <ProgressBar current={currentQuestion} total={questions.length} />
            <QuestionView
              questionIndex={currentQuestion}
              selectedAnswer={answers[currentQuestion]}
              onAnswer={handleAnswer}
              onPrev={handlePrev}
              isFirst={currentQuestion === 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
