import { executeNicheResearch } from './agents/orchestrator';
import { getNiches } from './db';
import { TOP_50_NICHES_CATALOG } from './data/top50Niches';

export function initializeDatabaseSeed(forceRefresh = false) {
  const current = getNiches();
  
  // Se já tiver ao menos 50 nichos e não for refresh forçado, mantém
  if (!forceRefresh && current.length >= 50) {
    return;
  }

  console.log(`[Seed] Populando banco com ${TOP_50_NICHES_CATALOG.length} nichos qualificados...`);

  for (const item of TOP_50_NICHES_CATALOG) {
    executeNicheResearch({
      nicheQuery: item.nicheQuery,
      segment: item.segment,
      state: item.state,
      city: item.city
    });
  }

  console.log(`[Seed] Concluído! Total no banco: ${getNiches().length} nichos.`);
}
