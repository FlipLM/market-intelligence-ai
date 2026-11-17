import fs from 'fs';
import path from 'path';
import type {
  RecentCompanyLead,
  PossuiSistemaStatus,
  AbordagemStatus,
} from '@/types/recentCompanies';
import { reclassifyAllContacts } from '@/lib/connectors/contactClassifier';
import { verificado, desconhecido } from '@/types/provenance';
import { evaluateFollowupEligibility } from '@/lib/outreachMessage';

const DATA_DIR = path.join(process.cwd(), 'data');
const COMPANIES_FILE = path.join(DATA_DIR, 'recent_companies.json');

export interface RecentCompaniesStore {
  version: string;
  updatedAt: string;
  companies: RecentCompanyLead[];
  doNotContactCnpjs: string[];
  doNotContactPhones: string[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readRecentCompaniesStore(): RecentCompaniesStore {
  try {
    ensureDir();
    if (!fs.existsSync(COMPANIES_FILE)) {
      const initial: RecentCompaniesStore = {
        version: '2.0.0',
        updatedAt: new Date().toISOString(),
        companies: [],
        doNotContactCnpjs: [],
        doNotContactPhones: [],
      };
      fs.writeFileSync(COMPANIES_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    const raw = fs.readFileSync(COMPANIES_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<RecentCompaniesStore>;
    return {
      version: parsed.version || '2.0.0',
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      companies: (parsed.companies || []).filter(
        (c) => c.recordStatus !== 'descartado_sintetico'
      ),
      doNotContactCnpjs: parsed.doNotContactCnpjs || [],
      doNotContactPhones: parsed.doNotContactPhones || [],
    };
  } catch (err) {
    console.error('Erro ao ler base de empresas recentes:', err);
    return {
      version: '2.0.0',
      updatedAt: new Date().toISOString(),
      companies: [],
      doNotContactCnpjs: [],
      doNotContactPhones: [],
    };
  }
}

export function writeRecentCompaniesStore(store: RecentCompaniesStore): boolean {
  try {
    ensureDir();
    store.updatedAt = new Date().toISOString();
    fs.writeFileSync(COMPANIES_FILE, JSON.stringify(store, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao gravar base de empresas recentes:', err);
    return false;
  }
}

export function getRealRecentCompanies(): RecentCompanyLead[] {
  return readRecentCompaniesStore().companies;
}

function applyDoNotContactFlags(store: RecentCompaniesStore): void {
  const blockedCnpjs = new Set(store.doNotContactCnpjs.map((c) => c.replace(/\D/g, '')));
  const blockedPhones = new Set(store.doNotContactPhones.map((p) => p.replace(/\D/g, '')));

  store.companies = store.companies.map((c) => {
    const cleanCnpj = (c.cnpj.valor || '').replace(/\D/g, '');
    const p1 = (c.contato.telefone1.valor || '').replace(/\D/g, '');
    const p2 = (c.contato.telefone2.valor || '').replace(/\D/g, '');
    const isBlocked =
      blockedCnpjs.has(cleanCnpj) ||
      (p1 !== '' && blockedPhones.has(p1)) ||
      (p2 !== '' && blockedPhones.has(p2)) ||
      c.abordagem.statusContato === 'recusou';

    if (!isBlocked) return c;
    return {
      ...c,
      abordagem: {
        ...c.abordagem,
        naoContatar: true,
        motivoBloqueio:
          c.abordagem.motivoBloqueio ||
          'Bloqueado na lista "não contatar" (recusa ou pedido de saída).',
      },
    };
  });
}

export function upsertRecentCompany(lead: RecentCompanyLead): RecentCompanyLead {
  const store = readRecentCompaniesStore();
  const cleanCnpj = (lead.cnpj.valor || '').replace(/\D/g, '');
  const idx = store.companies.findIndex(
    (c) => (c.cnpj.valor || '').replace(/\D/g, '') === cleanCnpj || c.id === lead.id
  );

  if (idx >= 0) {
    // Preserva diagnóstico manual e histórico de abordagem já registrados
    const existing = store.companies[idx];
    store.companies[idx] = {
      ...lead,
      diagnostico:
        existing.diagnostico.possuiSistema.status === 'verificado'
          ? existing.diagnostico
          : lead.diagnostico,
      abordagem: existing.abordagem,
    };
  } else {
    store.companies.unshift(lead);
  }

  store.companies = reclassifyAllContacts(store.companies);
  applyDoNotContactFlags(store);
  writeRecentCompaniesStore(store);
  return store.companies.find((c) => c.id === lead.id) || lead;
}

export function upsertRecentCompaniesBatch(leads: RecentCompanyLead[]): number {
  if (leads.length === 0) return 0;
  const store = readRecentCompaniesStore();
  let addedOrUpdated = 0;

  for (const lead of leads) {
    const cleanCnpj = (lead.cnpj.valor || '').replace(/\D/g, '');
    const idx = store.companies.findIndex(
      (c) => (c.cnpj.valor || '').replace(/\D/g, '') === cleanCnpj || c.id === lead.id
    );
    if (idx >= 0) {
      const existing = store.companies[idx];
      store.companies[idx] = {
        ...lead,
        diagnostico:
          existing.diagnostico.possuiSistema.status === 'verificado'
            ? existing.diagnostico
            : lead.diagnostico,
        abordagem: existing.abordagem,
      };
    } else {
      store.companies.unshift(lead);
    }
    addedOrUpdated++;
  }

  store.companies = reclassifyAllContacts(store.companies);
  applyDoNotContactFlags(store);
  writeRecentCompaniesStore(store);
  return addedOrUpdated;
}

export function updateRecentCompanyManualFields(
  id: string,
  updates: {
    possuiSistema?: PossuiSistemaStatus;
    observacaoSistema?: string;
    statusContato?: AbordagemStatus;
    naoContatar?: boolean;
    motivoBloqueio?: string | null;
    registrarPrimeiroContato?: boolean;
    registrarFollowup?: boolean;
  }
): RecentCompanyLead | null {
  const store = readRecentCompaniesStore();
  const idx = store.companies.findIndex((c) => c.id === id);
  if (idx < 0) return null;

  const current = store.companies[idx];
  const now = new Date().toISOString();

  let diagnostico = current.diagnostico;
  if (updates.possuiSistema) {
    diagnostico = {
      possuiSistema:
        updates.possuiSistema === 'desconhecido'
          ? desconhecido<PossuiSistemaStatus>('Não verificado — confirmar na conversa comercial', now)
          : verificado({
              valor: updates.possuiSistema,
              fonte: 'Confirmação manual em abordagem comercial',
              consultado_em: now,
            }),
      observacaoSistema:
        updates.observacaoSistema && updates.observacaoSistema.trim() !== ''
          ? verificado({
              valor: updates.observacaoSistema.trim(),
              fonte: 'Anotação manual do operador',
              consultado_em: now,
            })
          : current.diagnostico.observacaoSistema,
    };
  }

  const abordagem = { ...current.abordagem };
  if (updates.registrarPrimeiroContato) {
    if (abordagem.naoContatar || abordagem.statusContato === 'recusou') {
      throw new Error('Contato bloqueado na lista "não contatar".');
    }
    abordagem.statusContato = 'primeiro_contato_enviado';
    abordagem.primeiroContatoEm = abordagem.primeiroContatoEm || now;
  }
  if (updates.registrarFollowup) {
    const eligibility = evaluateFollowupEligibility(current);
    if (!eligibility.allowed) {
      throw new Error(eligibility.reason);
    }
    abordagem.statusContato = 'followup_enviado';
    abordagem.followupEnviadoEm = now;
  }
  if (updates.statusContato) {
    abordagem.statusContato = updates.statusContato;
  }
  if (updates.naoContatar !== undefined) {
    abordagem.naoContatar = updates.naoContatar;
  }
  if (updates.motivoBloqueio !== undefined) {
    abordagem.motivoBloqueio = updates.motivoBloqueio;
  }

  if (abordagem.statusContato === 'recusou' || abordagem.naoContatar) {
    abordagem.naoContatar = true;
    const cleanCnpj = (current.cnpj.valor || '').replace(/\D/g, '');
    const p1 = (current.contato.telefone1.valor || '').replace(/\D/g, '');
    const p2 = (current.contato.telefone2.valor || '').replace(/\D/g, '');
    if (cleanCnpj && !store.doNotContactCnpjs.includes(cleanCnpj)) {
      store.doNotContactCnpjs.push(cleanCnpj);
    }
    if (p1 && !store.doNotContactPhones.includes(p1)) {
      store.doNotContactPhones.push(p1);
    }
    if (p2 && !store.doNotContactPhones.includes(p2)) {
      store.doNotContactPhones.push(p2);
    }
  }

  store.companies[idx] = {
    ...current,
    diagnostico,
    abordagem,
  };

  applyDoNotContactFlags(store);
  writeRecentCompaniesStore(store);
  return store.companies[idx];
}
