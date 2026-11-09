import { RecentCompanyLead } from '@/types/recentCompanies';
import { getMasterRecentCompanies } from './recentCompaniesMasterGenerator';

/**
 * Busca as empresas mais novas do repositório em escala (5.000+ empresas),
 * desconsiderando rigorosamente qualquer empresa que já esteja na base do usuário.
 */
export function fetchTopNewestCompanies(
  existingCnpjs: string[],
  limit: number = 100
): {
  newCompanies: RecentCompanyLead[];
  totalCandidatePool: number;
  skippedCount: number;
} {
  // Gera uma margem de segurança no pool para garantir que sempre haja novas empresas
  const poolSize = Math.max(6000, existingCnpjs.length + limit + 1000);
  const pool = getMasterRecentCompanies(poolSize);

  // Conjunto de CNPJs limpos (apenas números) já existentes na tela do usuário
  const cleanExisting = new Set(existingCnpjs.map((c) => c.replace(/\D/g, '')));

  const newCompanies: RecentCompanyLead[] = [];
  let skippedCount = 0;

  for (const lead of pool) {
    const cleanLeadCnpj = lead.cnpj.replace(/\D/g, '');
    if (cleanExisting.has(cleanLeadCnpj)) {
      skippedCount++;
      continue;
    }

    newCompanies.push(lead);
    cleanExisting.add(cleanLeadCnpj); // previne duplicatas internas no pool

    if (newCompanies.length >= limit) {
      break;
    }
  }

  return {
    newCompanies,
    totalCandidatePool: pool.length,
    skippedCount,
  };
}
