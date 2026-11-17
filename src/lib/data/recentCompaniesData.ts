import fs from 'fs';
import path from 'path';
import { RecentCompanyLead } from '@/types/recentCompanies';

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

export function upsertRecentCompany(lead: RecentCompanyLead): RecentCompanyLead {
  const store = readRecentCompaniesStore();
  const cleanCnpj = (lead.cnpj.valor || '').replace(/\D/g, '');
  const idx = store.companies.findIndex(
    (c) => (c.cnpj.valor || '').replace(/\D/g, '') === cleanCnpj || c.id === lead.id
  );

  if (idx >= 0) {
    store.companies[idx] = lead;
  } else {
    store.companies.unshift(lead);
  }

  writeRecentCompaniesStore(store);
  return lead;
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
      store.companies[idx] = lead;
    } else {
      store.companies.unshift(lead);
    }
    addedOrUpdated++;
  }

  writeRecentCompaniesStore(store);
  return addedOrUpdated;
}
