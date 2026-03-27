import { useState } from 'react';
import {
  projectTypes,
  features,
  scaleOptions,
  complexityOptions,
  calculateCost,
  type ProjectType,
  type Feature,
  type CalculationResult,
} from '../../lib/calculator-data';

const WEB3FORMS_KEY = '177c045b-3001-4911-ac1d-27cb026478e3';

function formatPLN(amount: number): string {
  return amount.toLocaleString('pl-PL') + ' zł';
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-label font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/30'
                  : isDone
                    ? 'bg-accent/20 text-accent-light'
                    : 'bg-bg-surface text-text-dim border border-border'
              }`}
            >
              {isDone ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            {i < total - 1 && (
              <div className={`w-8 h-0.5 ${isDone ? 'bg-accent/40' : 'bg-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepProjectType({
  selected,
  onSelect,
}: {
  selected: ProjectType | null;
  onSelect: (pt: ProjectType) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">Wybierz typ projektu</h2>
      <p className="text-text-muted mb-6">Jaki typ aplikacji chcesz zbudować?</p>
      <div className="grid gap-3">
        {projectTypes.map((pt) => (
          <button
            key={pt.id}
            onClick={() => onSelect(pt)}
            className={`text-left p-4 rounded-xl border transition-all duration-200 ${
              selected?.id === pt.id
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-text-primary">{pt.label}</span>
              <span className="text-sm text-text-muted">od {formatPLN(pt.baseCost)}</span>
            </div>
            <div className="text-xs text-text-dim mt-1">ok. {pt.baseDays} dni roboczych</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepFeatures({
  selected,
  sliderValues,
  onToggle,
  onSliderChange,
}: {
  selected: Set<string>;
  sliderValues: Record<string, number>;
  onToggle: (f: Feature) => void;
  onSliderChange: (id: string, value: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">Wybierz funkcjonalności</h2>
      <p className="text-text-muted mb-6">Zaznacz wszystko, czego potrzebujesz.</p>
      <div className="grid gap-3">
        {features.map((f) => {
          const isSelected = selected.has(f.id);
          return (
            <div key={f.id}>
              <button
                onClick={() => onToggle(f)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-bg-card hover:border-border-hover hover:bg-bg-card-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-accent border-accent' : 'border-text-dim'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium text-text-primary">{f.label}</span>
                  </div>
                  <span className="text-sm text-text-muted">
                    {f.hasSlider ? `${formatPLN(f.sliderMin!)} - ${formatPLN(f.sliderMax!)}` : `+${formatPLN(f.cost)}`}
                  </span>
                </div>
              </button>
              {isSelected && f.hasSlider && (
                <div className="px-4 py-3 bg-bg-surface rounded-b-xl border-x border-b border-border -mt-1">
                  <div className="flex items-center justify-between text-sm text-text-muted mb-2">
                    <span>{formatPLN(f.sliderMin!)}</span>
                    <span className="font-semibold text-accent-light">{formatPLN(sliderValues[f.id] ?? f.sliderMin!)}</span>
                    <span>{formatPLN(f.sliderMax!)}</span>
                  </div>
                  <input
                    type="range"
                    min={f.sliderMin!}
                    max={f.sliderMax!}
                    step={500}
                    value={sliderValues[f.id] ?? f.sliderMin!}
                    onChange={(e) => onSliderChange(f.id, Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepScale({
  scaleIndex,
  complexityIndex,
  onScaleChange,
  onComplexityChange,
}: {
  scaleIndex: number;
  complexityIndex: number;
  onScaleChange: (i: number) => void;
  onComplexityChange: (i: number) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-2">Skala projektu</h2>
      <p className="text-text-muted mb-8">Określ wielkość i złożoność.</p>

      <div className="mb-8">
        <label className="block text-text-primary font-medium mb-3">Oczekiwana liczba użytkowników</label>
        <div className="flex items-center justify-between text-sm text-text-muted mb-2">
          <span>10</span>
          <span className="font-semibold text-accent-light text-base">{scaleOptions[scaleIndex].label}</span>
          <span>100 000+</span>
        </div>
        <input
          type="range"
          min={0}
          max={scaleOptions.length - 1}
          value={scaleIndex}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="w-full accent-accent"
        />
        <div className="text-xs text-text-dim mt-1">
          Mnożnik kosztów: x{scaleOptions[scaleIndex].multiplier.toFixed(1)}
        </div>
      </div>

      <div>
        <label className="block text-text-primary font-medium mb-3">Złożoność interfejsu</label>
        <div className="grid grid-cols-3 gap-3">
          {complexityOptions.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => onComplexityChange(i)}
              className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                i === complexityIndex
                  ? 'border-accent bg-accent/10 text-accent-light'
                  : 'border-border bg-bg-card hover:border-border-hover text-text-muted'
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="text-xs mt-1">x{opt.multiplier.toFixed(1)}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepResult({ result, onBack }: { result: CalculationResult; onBack: () => void }) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Kalkulator SaaS — wycena ${formatPLN(result.costMin)}-${formatPLN(result.costMax)}`,
          name,
          email,
          message: `Szacunkowy koszt: ${formatPLN(result.costMin)} - ${formatPLN(result.costMax)}\nCzas realizacji: ok. ${result.totalDays} dni\nStack: ${result.recommendedStack}\n\nOpis projektu:\n${description}`,
        }),
      });
      if (res.ok) {
        setFormState('sent');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-text-primary mb-6">Szacunkowa wycena</h2>

      <div className="bg-gradient-to-br from-accent/10 via-bg-card to-bg-card border border-accent/20 rounded-2xl p-6 mb-6 text-center">
        <div className="text-text-muted text-sm mb-1">Szacowany koszt</div>
        <div className="text-3xl md:text-4xl font-display font-bold text-text-primary">
          {formatPLN(result.costMin)} – {formatPLN(result.costMax)}
        </div>
        <div className="text-text-muted text-sm mt-2">
          Czas realizacji: ok. <span className="text-accent-light font-semibold">{result.totalDays} dni roboczych</span>
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl p-4 mb-6">
        <div className="text-xs text-text-dim uppercase font-label tracking-wider mb-2">Rekomendowany stack</div>
        <div className="text-text-primary font-medium">{result.recommendedStack}</div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-text-dim font-label font-medium">Dostawca</th>
              <th className="text-right p-4 text-text-dim font-label font-medium">Koszt</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-accent/5">
              <td className="p-4 text-accent-light font-semibold">VoxquartzSystems</td>
              <td className="p-4 text-right text-accent-light font-semibold">
                {formatPLN(result.costMin)} – {formatPLN(result.costMax)}
              </td>
            </tr>
            <tr className="border-b border-border">
              <td className="p-4 text-text-muted">Agencja (x2.5)</td>
              <td className="p-4 text-right text-text-muted">
                {formatPLN(result.agencyCost.min)} – {formatPLN(result.agencyCost.max)}
              </td>
            </tr>
            <tr>
              <td className="p-4 text-text-muted">Software house (x4)</td>
              <td className="p-4 text-right text-text-muted">
                {formatPLN(result.softwareHouseCost.min)} – {formatPLN(result.softwareHouseCost.max)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {formState === 'sent' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
          <div className="text-emerald-400 font-semibold text-lg mb-2">Wiadomość wysłana!</div>
          <p className="text-text-muted">Odezwę się w ciągu 24 godzin z indywidualną wyceną.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Otrzymaj dokładną wycenę</h3>
          <div className="grid gap-4">
            <input
              type="text"
              placeholder="Imię"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors"
            />
            <textarea
              placeholder="Krótki opis projektu (opcjonalnie)"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-bg-surface border border-border rounded-xl text-text-primary placeholder-text-dim focus:border-accent focus:outline-none transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={formState === 'sending'}
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 hover:shadow-lg hover:shadow-accent/25"
            >
              {formState === 'sending' ? 'Wysyłanie...' : 'Wyślij i otrzymaj wycenę'}
            </button>
            {formState === 'error' && (
              <p className="text-red-400 text-sm text-center">Błąd wysyłania. Spróbuj ponownie lub napisz na kontakt@voxquartzsystems.pl</p>
            )}
          </div>
        </form>
      )}

      <button
        onClick={onBack}
        className="mt-6 text-text-muted hover:text-accent-light text-sm transition-colors"
      >
        ← Wróć i zmień parametry
      </button>
    </div>
  );
}

export default function SaaSCalculator() {
  const [step, setStep] = useState(1);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(new Set());
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [scaleIndex, setScaleIndex] = useState(1);
  const [complexityIndex, setComplexityIndex] = useState(1);

  function toggleFeature(f: Feature) {
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev);
      if (next.has(f.id)) {
        next.delete(f.id);
      } else {
        next.add(f.id);
        if (f.hasSlider && !sliderValues[f.id]) {
          setSliderValues((sv) => ({ ...sv, [f.id]: f.sliderMin! }));
        }
      }
      return next;
    });
  }

  function handleSliderChange(id: string, value: number) {
    setSliderValues((sv) => ({ ...sv, [id]: value }));
  }

  const selectedFeatures = features.filter((f) => selectedFeatureIds.has(f.id));

  const result: CalculationResult | null =
    selectedProject
      ? calculateCost(
          selectedProject,
          selectedFeatures,
          sliderValues,
          scaleOptions[scaleIndex].multiplier,
          complexityOptions[complexityIndex].multiplier
        )
      : null;

  const canProceed = step === 1 ? selectedProject !== null : true;

  return (
    <div className="max-w-2xl mx-auto">
      <StepIndicator current={step} total={4} />

      <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8">
        {step === 1 && (
          <StepProjectType selected={selectedProject} onSelect={(pt) => setSelectedProject(pt)} />
        )}
        {step === 2 && (
          <StepFeatures
            selected={selectedFeatureIds}
            sliderValues={sliderValues}
            onToggle={toggleFeature}
            onSliderChange={handleSliderChange}
          />
        )}
        {step === 3 && (
          <StepScale
            scaleIndex={scaleIndex}
            complexityIndex={complexityIndex}
            onScaleChange={setScaleIndex}
            onComplexityChange={setComplexityIndex}
          />
        )}
        {step === 4 && result && (
          <StepResult result={result} onBack={() => setStep(1)} />
        )}

        {step < 4 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-6 py-2.5 text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Wstecz
            </button>
            <button
              onClick={() => setStep((s) => Math.min(4, s + 1))}
              disabled={!canProceed}
              className="px-6 py-2.5 bg-accent hover:bg-accent-light text-white font-label font-semibold rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-accent/25"
            >
              {step === 3 ? 'Zobacz wycenę' : 'Dalej'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
