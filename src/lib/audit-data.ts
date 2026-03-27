export interface AuditOption {
  label: string;
  score: number;
}

export interface AuditQuestion {
  id: number;
  category: string;
  categoryKey: AuditCategory;
  question: string;
  options: AuditOption[];
}

export type AuditCategory = 'dane' | 'procesy' | 'zespol' | 'budzet' | 'kultura';

export const categoryLabels: Record<AuditCategory, string> = {
  dane: 'Dane',
  procesy: 'Procesy',
  zespol: 'Zespół',
  budzet: 'Budżet',
  kultura: 'Kultura',
};

export const categoryOrder: AuditCategory[] = ['dane', 'procesy', 'zespol', 'budzet', 'kultura'];

export const questions: AuditQuestion[] = [
  {
    id: 1, category: 'Dane', categoryKey: 'dane',
    question: 'Jak przechowujesz dane firmowe?',
    options: [
      { label: 'Excel / papier', score: 0 },
      { label: 'Różne, niepowiązane systemy', score: 3 },
      { label: 'Centralna baza danych (częściowo)', score: 7 },
      { label: 'Ustrukturyzowana baza z API', score: 10 },
    ],
  },
  {
    id: 2, category: 'Dane', categoryKey: 'dane',
    question: 'Ile danych historycznych posiadasz?',
    options: [
      { label: 'Mniej niż 1 rok', score: 0 },
      { label: '1-2 lata, niekompletne', score: 3 },
      { label: '2-5 lat', score: 7 },
      { label: '5+ lat, pełne i ustrukturyzowane', score: 10 },
    ],
  },
  {
    id: 3, category: 'Procesy', categoryKey: 'procesy',
    question: 'Ile powtarzalnych manualnych procesów wykonujesz tygodniowo?',
    options: [
      { label: 'Mniej niż 5', score: 0 },
      { label: '5-15', score: 3 },
      { label: '15-30', score: 7 },
      { label: '30+', score: 10 },
    ],
  },
  {
    id: 4, category: 'Procesy', categoryKey: 'procesy',
    question: 'Czy macie udokumentowane procedury?',
    options: [
      { label: 'Nie mamy', score: 0 },
      { label: 'W głowach pracowników', score: 3 },
      { label: 'W dokumentach / wiki', score: 7 },
      { label: 'W systemach workflow', score: 10 },
    ],
  },
  {
    id: 5, category: 'Zespół', categoryKey: 'zespol',
    question: 'Czy macie osobę techniczną w firmie?',
    options: [
      { label: 'Nie', score: 0 },
      { label: 'Zewnętrzny konsultant', score: 3 },
      { label: 'Wewnętrzny IT', score: 7 },
      { label: 'Zespół IT / CTO', score: 10 },
    ],
  },
  {
    id: 6, category: 'Zespół', categoryKey: 'zespol',
    question: 'Jak zespół reaguje na nowe narzędzia?',
    options: [
      { label: 'Opór i niechęć', score: 0 },
      { label: 'Sceptycyzm, ale próbują', score: 3 },
      { label: 'Otwartość na zmiany', score: 7 },
      { label: 'Entuzjazm i proaktywność', score: 10 },
    ],
  },
  {
    id: 7, category: 'Budżet', categoryKey: 'budzet',
    question: 'Jaki jest roczny budżet na IT?',
    options: [
      { label: 'Poniżej 5 000 zł', score: 0 },
      { label: '5 000 - 20 000 zł', score: 3 },
      { label: '20 000 - 100 000 zł', score: 7 },
      { label: 'Powyżej 100 000 zł', score: 10 },
    ],
  },
  {
    id: 8, category: 'Budżet', categoryKey: 'budzet',
    question: 'Czy masz budżet na pilotaż AI (3-6 miesięcy)?',
    options: [
      { label: 'Nie mamy budżetu', score: 0 },
      { label: 'Muszę przekonać zarząd', score: 3 },
      { label: 'Do 15 000 zł', score: 7 },
      { label: 'Bez ograniczeń', score: 10 },
    ],
  },
  {
    id: 9, category: 'Kultura', categoryKey: 'kultura',
    question: 'Jakie jest podejście firmy do innowacji?',
    options: [
      { label: 'Unikamy zmian', score: 0 },
      { label: 'Reagujemy na rynek', score: 3 },
      { label: 'Aktywnie testujemy nowości', score: 7 },
      { label: 'Innowacja jest w DNA firmy', score: 10 },
    ],
  },
  {
    id: 10, category: 'Kultura', categoryKey: 'kultura',
    question: 'Czy firma korzysta już z AI?',
    options: [
      { label: 'Nie, w ogóle', score: 0 },
      { label: 'ChatGPT do prostych zadań', score: 3 },
      { label: 'Kilka narzędzi AI w użyciu', score: 7 },
      { label: 'Własne wdrożenia AI', score: 10 },
    ],
  },
];

export interface CategoryScore {
  key: AuditCategory;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AuditResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  level: string;
  levelDescription: string;
  categories: CategoryScore[];
  recommendations: string[];
}

export function calculateAuditResult(answers: (number | null)[]): AuditResult {
  const categoryScores: Record<AuditCategory, number> = {
    dane: 0, procesy: 0, zespol: 0, budzet: 0, kultura: 0,
  };

  let totalScore = 0;
  for (let i = 0; i < questions.length; i++) {
    const score = answers[i] ?? 0;
    categoryScores[questions[i].categoryKey] += score;
    totalScore += score;
  }

  const maxScore = 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const categories: CategoryScore[] = categoryOrder.map((key) => ({
    key,
    label: categoryLabels[key],
    score: categoryScores[key],
    maxScore: 20,
    percentage: Math.round((categoryScores[key] / 20) * 100),
  }));

  let level: string;
  let levelDescription: string;
  if (percentage <= 30) {
    level = 'Początkujący';
    levelDescription = 'Twoja firma jest na wczesnym etapie cyfryzacji. Zacznij od uporządkowania danych i procesów, zanim wdrożysz AI.';
  } else if (percentage <= 60) {
    level = 'Rozwijający się';
    levelDescription = 'Masz solidne podstawy. Możesz zacząć od pilotażowych wdrożeń AI w obszarach, gdzie już masz dane i procesy.';
  } else if (percentage <= 85) {
    level = 'Gotowy na AI';
    levelDescription = 'Twoja firma jest dobrze przygotowana na wdrożenie AI. Możesz przejść do zaawansowanych implementacji.';
  } else {
    level = 'Lider AI';
    levelDescription = 'Jesteś w czołówce firm pod względem gotowości na AI. Czas na skalowanie i optymalizację istniejących wdrożeń.';
  }

  const weakest = [...categories].sort((a, b) => a.percentage - b.percentage);
  const recommendations: string[] = [];

  const recommendationMap: Record<AuditCategory, string[]> = {
    dane: [
      'Przeprowadź audyt danych — zidentyfikuj, gdzie są rozproszone i jak je skonsolidować w jednym systemie.',
      'Wdróż centralną bazę danych z API, aby AI miało dostęp do ustrukturyzowanych danych.',
    ],
    procesy: [
      'Zmapuj i udokumentuj kluczowe procesy biznesowe — to fundament automatyzacji AI.',
      'Zacznij od automatyzacji najbardziej powtarzalnych zadań przy użyciu prostych reguł, zanim wdrożysz AI.',
    ],
    zespol: [
      'Zainwestuj w szkolenia techniczne dla zespołu — nawet podstawowa znajomość narzędzi AI znacząco zwiększa efektywność wdrożenia.',
      'Rozważ zatrudnienie lub zlecenie konsultantowi IT roli championów AI wewnątrz firmy.',
    ],
    budzet: [
      'Zaplanuj budżet na 3-6 miesięcy pilotażu AI — nawet niewielka inwestycja (5-15 tys. zł) pozwoli przetestować wartość.',
      'Przygotuj business case z konkretnymi oszczędnościami, aby uzyskać akceptację zarządu na inwestycję w AI.',
    ],
    kultura: [
      'Zacznij od małych, widocznych sukcesów AI (np. ChatGPT w obsłudze klienta) — buduj entuzjazm stopniowo.',
      'Zorganizuj warsztaty AI dla zarządu i zespołu, aby zbudować świadomość możliwości i zmniejszyć opór.',
    ],
  };

  for (const cat of weakest) {
    if (recommendations.length >= 3) break;
    const recs = recommendationMap[cat.key];
    for (const rec of recs) {
      if (recommendations.length >= 3) break;
      recommendations.push(rec);
    }
  }

  return { totalScore, maxScore, percentage, level, levelDescription, categories, recommendations };
}
