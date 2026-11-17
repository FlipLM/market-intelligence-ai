import fs from 'fs';
import path from 'path';
import {
  NicheReport,
  CommercialFeedbackHistory,
  ScoringWeights,
  DiscardedSyntheticNicheRecord,
} from '@/types/market';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'market_intelligence.json');

export const DEFAULT_WEIGHTS: ScoringWeights = {
  demandaComprovada: 0.20,
  problemasOperacionais: 0.15,
  capacidadeInvestimento: 0.15,
  facilidadeProspeccao: 0.15,
  potencialRecorrencia: 0.10,
  oportunidadeCompetitiva: 0.10,
  viabilidadeTecnica: 0.10,
  qualidadeEvidencias: 0.05,
};

export interface DatabaseSchema {
  version: string;
  updatedAt: string;
  scoringWeights: ScoringWeights;
  niches: NicheReport[];
  discardedSynthetic: DiscardedSyntheticNicheRecord[];
  commercialHistory: CommercialFeedbackHistory[];
}

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

export function readDatabase(): DatabaseSchema {
  try {
    ensureDirectoryExistence(DB_FILE);
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: DatabaseSchema = {
        version: '2.0.0',
        updatedAt: new Date().toISOString(),
        scoringWeights: DEFAULT_WEIGHTS,
        niches: [],
        discardedSynthetic: [],
        commercialHistory: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }

    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data) as Partial<DatabaseSchema>;
    return {
      version: parsed.version || '2.0.0',
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      scoringWeights: parsed.scoringWeights || DEFAULT_WEIGHTS,
      niches: (parsed.niches || []).filter((n) => n.recordStatus !== 'descartado_sintetico'),
      discardedSynthetic: parsed.discardedSynthetic || [],
      commercialHistory: parsed.commercialHistory || [],
    };
  } catch (err) {
    console.error('Erro ao ler banco de dados de inteligência de mercado:', err);
    return {
      version: '2.0.0',
      updatedAt: new Date().toISOString(),
      scoringWeights: DEFAULT_WEIGHTS,
      niches: [],
      discardedSynthetic: [],
      commercialHistory: [],
    };
  }
}

export function writeDatabase(db: DatabaseSchema): boolean {
  try {
    ensureDirectoryExistence(DB_FILE);
    db.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao salvar banco de dados de inteligência de mercado:', err);
    return false;
  }
}

export function getNiches(): NicheReport[] {
  const db = readDatabase();
  return (db.niches || []).filter((n) => n.recordStatus === 'ativo');
}

export function getDiscardedSyntheticNiches(): DiscardedSyntheticNicheRecord[] {
  const db = readDatabase();
  return db.discardedSynthetic || [];
}

export function getNicheById(id: string): NicheReport | undefined {
  const niches = getNiches();
  return niches.find((n) => n.id === id);
}

export function saveNiche(niche: NicheReport): NicheReport {
  const db = readDatabase();
  const existingIdx = db.niches.findIndex((n) => n.id === niche.id);

  if (existingIdx >= 0) {
    db.niches[existingIdx] = {
      ...niche,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.niches.unshift(niche);
  }

  writeDatabase(db);
  return niche;
}

export function getCommercialHistory(): CommercialFeedbackHistory[] {
  const db = readDatabase();
  return db.commercialHistory || [];
}

export function saveCommercialFeedback(
  feedback: CommercialFeedbackHistory
): CommercialFeedbackHistory {
  const db = readDatabase();
  db.commercialHistory.unshift(feedback);
  writeDatabase(db);
  return feedback;
}

export function getScoringWeights(): ScoringWeights {
  const db = readDatabase();
  return db.scoringWeights || DEFAULT_WEIGHTS;
}

export function updateScoringWeights(weights: ScoringWeights): ScoringWeights {
  const db = readDatabase();
  db.scoringWeights = weights;
  writeDatabase(db);
  return weights;
}
