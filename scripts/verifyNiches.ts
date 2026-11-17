import { getNiches } from '../src/lib/db';
import { isProvenanceField } from '../src/types/provenance';

const niches = getNiches();
console.log(`Total de nichos ativos no banco: ${niches.length}`);

for (const n of niches) {
  if (!isProvenanceField(n.basicInfo.name) || !isProvenanceField(n.basicInfo.cnaes)) {
    console.error(`[ERRO] Nicho ${n.id} fora do padrão de proveniência.`);
    process.exit(1);
  }
}

console.log('Verificação de estrutura de proveniência concluída.');
