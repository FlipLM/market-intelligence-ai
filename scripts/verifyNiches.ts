import { getNiches } from '../src/lib/db';

const niches = getNiches();
console.log(`Total de nichos no banco: ${niches.length}`);

let contaminationCount = 0;

for (const n of niches) {
  const isHealth = n.basicInfo.segment.toLowerCase().includes('saúde') || 
                   n.basicInfo.segment.toLowerCase().includes('estética') || 
                   n.basicInfo.name.toLowerCase().includes('clínica') ||
                   n.basicInfo.name.toLowerCase().includes('odontol') ||
                   n.basicInfo.name.toLowerCase().includes('médic') ||
                   n.basicInfo.name.toLowerCase().includes('pet') ||
                   n.basicInfo.name.toLowerCase().includes('laborat') ||
                   n.basicInfo.name.toLowerCase().includes('hospital');

  const fullText = JSON.stringify({
    techAudit: n.techAudit,
    opportunities: n.opportunities,
  }).toLowerCase();

  const mentionsClinica = fullText.includes('clínica') || fullText.includes('prontuário') || fullText.includes('paciente');

  if (!isHealth && mentionsClinica) {
    console.warn(`[ALERTA DE CONTAMINAÇÃO] Nicho não-saúde com termos médicos: "${n.basicInfo.name}" (${n.basicInfo.segment})`);
    contaminationCount++;
  }
}

if (contaminationCount === 0) {
  console.log('✅ SUCESSO! 0 contaminações encontradas. Todos os nichos não-saúde estão 100% livres de menções a clínicas/prontuários/pacientes.');
} else {
  console.error(`❌ Total de nichos contaminados: ${contaminationCount}`);
}

