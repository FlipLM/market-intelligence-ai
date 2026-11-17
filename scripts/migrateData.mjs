import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MARKET_FILE = path.join(DATA_DIR, 'market_intelligence.json');
const COMPANIES_FILE = path.join(DATA_DIR, 'recent_companies.json');

const now = new Date().toISOString();

if (fs.existsSync(MARKET_FILE)) {
  const raw = JSON.parse(fs.readFileSync(MARKET_FILE, 'utf-8'));
  const existingNiches = Array.isArray(raw.niches) ? raw.niches : [];
  const existingDiscarded = Array.isArray(raw.discardedSynthetic) ? raw.discardedSynthetic : [];

  const newlyDiscarded = existingNiches.map((n) => ({
    id: n.id,
    name: typeof n.basicInfo?.name === 'string' ? n.basicInfo.name : n.basicInfo?.name?.valor || n.id,
    originalCreatedAt: n.createdAt || now,
    recordStatus: 'descartado_sintetico',
    discardedAt: now,
    reason: 'Registro gerado por conectores/seed sintéticos sem origem verificável (auditoria Fase 1/Fase 2).',
  }));

  const migrated = {
    version: '2.0.0',
    updatedAt: now,
    scoringWeights: raw.scoringWeights || {
      demandaComprovada: 0.20,
      problemasOperacionais: 0.15,
      capacidadeInvestimento: 0.15,
      facilidadeProspeccao: 0.15,
      potencialRecorrencia: 0.10,
      oportunidadeCompetitiva: 0.10,
      viabilidadeTecnica: 0.10,
      qualidadeEvidencias: 0.05,
    },
    niches: [],
    discardedSynthetic: [...existingDiscarded, ...newlyDiscarded],
    commercialHistory: Array.isArray(raw.commercialHistory) ? raw.commercialHistory : [],
  };

  fs.writeFileSync(MARKET_FILE, JSON.stringify(migrated, null, 2), 'utf-8');
  console.log(`Migrado market_intelligence.json: ${newlyDiscarded.length} registros marcados como descartado_sintetico; 0 nichos ativos.`);
}

if (!fs.existsSync(COMPANIES_FILE)) {
  const initialCompanies = {
    version: '2.0.0',
    updatedAt: now,
    companies: [],
    doNotContactCnpjs: [],
    doNotContactPhones: [],
  };
  fs.writeFileSync(COMPANIES_FILE, JSON.stringify(initialCompanies, null, 2), 'utf-8');
  console.log('Criado data/recent_companies.json vazio (sem leads sintéticos).');
}
