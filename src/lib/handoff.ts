import type { NicheReport, ProspectorHandoff } from '@/types/market';
import type { RecentCompanyLead } from '@/types/recentCompanies';
import { formatProvenanceText, inferido } from '@/types/provenance';
import fs from 'fs';
import path from 'path';

export function buildProspectorHandoff(niche: NicheReport): ProspectorHandoff {
  const state = formatProvenanceText(niche.basicInfo.geographicScope.state, '');
  const city = formatProvenanceText(niche.basicInfo.geographicScope.city, '');
  const nicheNameText = formatProvenanceText(niche.basicInfo.name, niche.id);

  const region = city
    ? `${city}${state ? `, ${state}` : ''}`
    : state
    ? `Estado de ${state}`
    : 'Brasil';

  const mapsQuery = `${nicheNameText} em ${region}`;
  const now = new Date().toISOString();

  return {
    nicheId: niche.id,
    nicheName: niche.basicInfo.name,
    googleMapsQuery: inferido({
      valor: mapsQuery,
      fonte: 'Composição determinística de nome do nicho + escopo geográfico',
      regra: 'nicheName + " em " + region',
      consultado_em: now,
    }),
    targetRegion: inferido({
      valor: region,
      fonte: 'Composição determinística de escopo geográfico',
      regra: 'city / state informados no nicho',
      consultado_em: now,
    }),
    idealCustomerProfile: {
      description: niche.basicInfo.description,
      companySize: niche.commercialViability.accessibleDecisionMakers,
      mustHaveCellPhone: true,
    },
    suggestedPitchWhatsApp: niche.outreachCopy?.templatePadrao || '',
    diagnosticQuestions: [],
    offerValueProposition: niche.decisionRecommendation,
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
    const nameStr = formatProvenanceText(handoff.nicheName, handoff.nicheId);
    const safeName = nameStr.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filePath = path.join(destDir, `target_niche_${safeName}.json`);

    fs.writeFileSync(filePath, JSON.stringify(handoff, null, 2), 'utf-8');
    return {
      success: true,
      message: `Nicho exportado com sucesso para o Prospector em: ${filePath}`,
      destinationFile: filePath,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Não foi possível gravar diretamente no caminho ${prospectorPath}: ${msg}`,
    };
  }
}

export function exportRecentCompaniesToProspector(
  companies: RecentCompanyLead[],
  prospectorPath = 'G:\\Prospector'
): { success: boolean; message: string; destinationFile?: string } {
  try {
    const eligible = companies.filter(
      (c) => !c.abordagem.naoContatar && c.abordagem.statusContato !== 'recusou'
    );

    const destDir = path.join(prospectorPath, 'scratch');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filePath = path.join(destDir, `leads_recentes_${timestamp}.json`);

    const payload = {
      exportedAt: new Date().toISOString(),
      totalLeads: eligible.length,
      excludedDoNotContact: companies.length - eligible.length,
      source: 'Market Intelligence AI — Leads com Proveniência Verificável',
      leads: eligible.map((c) => ({
        id: c.id,
        cnpj: c.cnpj,
        nomeFantasia: c.nomeFantasia,
        razaoSocial: c.razaoSocial,
        situacaoCadastral: c.situacaoCadastral,
        dataAbertura: c.dataAbertura,
        diasCriacao: c.diasCriacao,
        cnaePrincipal: c.cnaePrincipal,
        cnaeDescricao: c.cnaeDescricao,
        municipio: c.municipio,
        uf: c.uf,
        bairro: c.bairroRegiao,
        porte: c.porte,
        naturezaJuridica: c.naturezaJuridica,
        titularOuSocioPrincipal: c.titularOuSocioPrincipal,
        contato: c.contato,
        possuiSistema: c.diagnostico.possuiSistema,
      })),
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    return {
      success: true,
      message: `${eligible.length} empresas exportadas com sucesso para o Prospector em: ${filePath}`,
      destinationFile: filePath,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Erro ao exportar empresas recentes para o Prospector: ${msg}`,
    };
  }
}
