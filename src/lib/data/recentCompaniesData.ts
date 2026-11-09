import { RecentCompanyLead } from '@/types/recentCompanies';
import { getMasterRecentCompanies } from './recentCompaniesMasterGenerator';

/**
 * Retorna o repositório consolidado de mais de 5.000 empresas e comércios
 * recém-abertos no Distrito Federal (0 a 365 dias), com CNAEs oficiais,
 * sócios identificados, diagnósticos de ausência de sistema e scripts de WhatsApp.
 */
export function getGeneratedRecentCompanies(): RecentCompanyLead[] {
  return getMasterRecentCompanies(5200);
}
