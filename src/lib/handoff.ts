import { NicheReport, ProspectorHandoff } from '@/types/market';
import fs from 'fs';
import path from 'path';

export function buildProspectorHandoff(niche: NicheReport): ProspectorHandoff {
  const topOpp = niche.opportunities[0] || {
    title: 'Automação de Processos',
    operationalProblem: 'Controles manuais e planilhas',
    expectedBenefit: 'Economia de tempo e eliminação de erros'
  };

  const region = niche.basicInfo.geographicScope.city
    ? `${niche.basicInfo.geographicScope.city}, ${niche.basicInfo.geographicScope.state || 'Brasil'}`
    : niche.basicInfo.geographicScope.state
      ? `Estado de ${niche.basicInfo.geographicScope.state}`
      : 'Brasil';

  const mapsQuery = `${niche.basicInfo.name} em ${region}`;

  const pitchWhatsApp = `Olá! Notei a excelência do trabalho de vocês no segmento de ${niche.basicInfo.name}. Desenvolvemos recentemente uma solução específica para empresas do setor resolverem ${topOpp.operationalProblem.toLowerCase()}, gerando ${topOpp.expectedBenefit.toLowerCase()}. Teria 5 minutos para ver como isso funciona na prática?`;

  const diagnosticQuestions = [
    `Como sua equipe lida hoje com ${topOpp.operationalProblem}?`,
    `Quanto tempo por semana é gasto manualmente em processos que poderiam ser automatizados?`,
    `Vocês utilizam algum software que hoje deixa a desejar em suporte ou relatórios?`
  ];

  return {
    nicheId: niche.id,
    nicheName: niche.basicInfo.name,
    googleMapsQuery: mapsQuery,
    targetRegion: region,
    idealCustomerProfile: {
      description: `Empresas ativas no setor de ${niche.basicInfo.name}, preferencialmente com 3 a 30 colaboradores.`,
      companySize: 'Pequena a Média Empresa',
      hasWebsitePreferred: true,
      mustHaveCellPhone: true,
    },
    suggestedPitchWhatsApp: pitchWhatsApp,
    diagnosticQuestions,
    offerValueProposition: `${topOpp.title} — ${topOpp.expectedBenefit}`
  };
}

export function exportHandoffToProspector(
  handoff: ProspectorHandoff,
  prospectorPath = 'G:\\Prospector'
): { success: boolean; message: string; destinationFile?: string } {
  try {
    const destDir = path.join(prospectorPath, 'scratch');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const safeName = handoff.nicheName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filePath = path.join(destDir, `target_niche_${safeName}.json`);

    fs.writeFileSync(filePath, JSON.stringify(handoff, null, 2), 'utf-8');
    return {
      success: true,
      message: `Nicho exportado com sucesso para o Prospector em: ${filePath}`,
      destinationFile: filePath
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Não foi possível gravar diretamente no caminho ${prospectorPath}: ${err.message}`
    };
  }
}

