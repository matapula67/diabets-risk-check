import { AssessmentInput, PredictionResult, RiskLevel } from '../types';

const MAX_SCORE = 40;

const RECOMMENDATIONS: Record<RiskLevel, string[]> = {
  low: [
    'Endelea na mtindo wako wa maisha wenye afya — una hatari ndogo kwa sasa.',
    'Fanya uchunguzi wa sukari ya damu angalau mara moja kwa mwaka.',
    'Dumisha uzito unaofaa na ufanye mazoezi mara kwa mara.',
  ],
  medium: [
    'Panga miadi na daktari kwa uchunguzi zaidi wa kisukari ndani ya miezi 3.',
    'Punguza matumizi ya sukari na vyakula vyenye mafuta mengi.',
    'Ongeza dakika 30 za mazoezi ya mwili kwa siku, angalau mara 4 kwa wiki.',
    'Fuatilia shinikizo la damu na sukari ya damu kila baada ya miezi 3.',
  ],
  high: [
    'Wasiliana na daktari haraka iwezekanavyo kwa vipimo kamili vya kisukari.',
    'Anza mpango wa lishe unaosimamiwa na mtaalamu wa afya.',
    'Punguza uzito kwa hatua ndogo ndogo zenye kufuatiliwa na daktari.',
    'Acha uvutaji sigara na punguza unywaji wa pombe mara moja.',
    'Pima sukari ya damu na shinikizo la damu kwa ukaribu zaidi (kila wiki 2).',
  ],
};

export function predictRisk(input: AssessmentInput): PredictionResult {
  let score = 0;
  const factors: string[] = [];
  const add = (points: number, label: string) => {
    if (points > 0) {
      score += points;
      factors.push(label);
    }
  };

  if (input.age >= 60) add(4, 'Umri (60+)');
  else if (input.age >= 45) add(2, 'Umri (45-59)');

  if (input.bmi >= 30) add(4, 'BMI — unene uliopitiliza');
  else if (input.bmi >= 25) add(2, 'BMI — uzito uliozidi');

  if (input.glucose >= 126) add(6, 'Sukari ya damu — kiwango cha kisukari');
  else if (input.glucose >= 100) add(3, 'Sukari ya damu — hatua ya awali (prediabetes)');

  if (input.bloodPressure >= 140) add(3, 'Shinikizo la damu — juu sana');
  else if (input.bloodPressure >= 130) add(2, 'Shinikizo la damu — juu kiasi');

  if (input.cholesterol >= 240) add(3, 'Cholesterol — juu sana');
  else if (input.cholesterol >= 200) add(1, 'Cholesterol — juu kiasi');

  if (input.heartDisease) add(3, 'Historia ya ugonjwa wa moyo');
  if (input.hypertension) add(3, 'Hypertension');
  if (input.smoking) add(2, 'Uvutaji sigara');
  if (input.alcohol) add(1, 'Matumizi ya pombe');

  if (input.activity === 'none') add(3, 'Hakuna shughuli za mwili');
  else if (input.activity === 'low') add(1, 'Shughuli za mwili ni chini');

  if (input.sleepHours < 6) add(2, 'Muda mfupi wa kulala (<6h)');
  else if (input.sleepHours > 9) add(1, 'Muda mrefu wa kulala (>9h)');

  if (input.gender === 'male') add(1, 'Jinsia — Mwanaume');

  const confidence = Math.min(100, Math.round((score / MAX_SCORE) * 100));
  let level: RiskLevel;
  if (score <= 13) level = 'low';
  else if (score <= 26) level = 'medium';
  else level = 'high';

  const recommendations = [...RECOMMENDATIONS[level]];
  if (input.smoking && level !== 'high') {
    recommendations.push('Fikiria kuacha uvutaji sigara ili kupunguza hatari zaidi.');
  }
  if (input.activity === 'none' && level === 'low') {
    recommendations.push('Anzisha mazoezi mepesi kama kutembea dakika 20 kila siku.');
  }

  return { score, maxScore: MAX_SCORE, confidence, level, factors, recommendations };
}
