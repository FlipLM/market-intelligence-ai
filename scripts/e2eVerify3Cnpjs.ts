import assert from 'node:assert/strict';
import { fetchCnpjFromOpenApi, formatCnae, formatCnpj } from '../src/lib/connectors/openCnpjApi';
import {
  buildStandardWhatsAppMessage,
  findForbiddenOutreachContent,
} from '../src/lib/outreachMessage';
import { isProvenanceField } from '../src/types/provenance';

const TARGET_DF_CNPJS = [
  '67535568000188', // MEI aberto em 2026-06-17 (Brasília/DF, sem QSA)
  '66768550000163', // LTDA Arquitetura aberta em 2026-05-13 (Brasília/DF, com QSA e telefone)
  '67695381000141', // LTDA Construções aberta em 2026-06-26 (Brasília/DF, com QSA e telefone)
];

function checkEveryFieldProvenance(obj: unknown, pathLabel: string) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => checkEveryFieldProvenance(item, `${pathLabel}[${idx}]`));
    return;
  }
  const rec = obj as Record<string, unknown>;
  if ('valor' in rec && 'status' in rec && 'fonte' in rec && 'consultado_em' in rec) {
    assert.equal(isProvenanceField(rec), true, `Proveniência inválida em ${pathLabel}`);
    return;
  }
  for (const [k, v] of Object.entries(rec)) {
    checkEveryFieldProvenance(v, `${pathLabel}.${k}`);
  }
}

async function run() {
  console.log('=== TESTE E2E: 3 CNPJs REAIS RECENTES DO DF ===\n');

  for (const cnpj of TARGET_DF_CNPJS) {
    const lead = await fetchCnpjFromOpenApi(cnpj);
    assert.ok(lead, `Falha ao consultar CNPJ real ${cnpj}`);

    checkEveryFieldProvenance(lead, `lead(${cnpj})`);

    // Consulta direta da fonte para conferência campo a campo
    const sourceUrl = lead.cnpj.url_ou_api!;
    const rawRes = await fetch(sourceUrl);
    assert.equal(rawRes.ok, true, `Falha HTTP na fonte ${sourceUrl}`);
    const raw = (await rawRes.json()) as Record<string, unknown>;

    assert.equal(lead.cnpj.valor, formatCnpj(String(raw.cnpj)));
    assert.equal(lead.cnpj.status, 'verificado');
    assert.equal(lead.razaoSocial.valor, String(raw.razao_social).trim());
    assert.equal(lead.situacaoCadastral.valor, String(raw.descricao_situacao_cadastral).trim());
    assert.equal(lead.dataAbertura.valor, String(raw.data_inicio_atividade).trim());
    assert.equal(lead.dataAbertura.status, 'verificado');
    assert.equal(lead.cnaePrincipal.valor, formatCnae(raw.cnae_fiscal as string | number));
    assert.equal(lead.uf.valor, 'DF');
    assert.equal(lead.diagnostico.possuiSistema.status, 'desconhecido');
    assert.equal(lead.diagnostico.possuiSistema.valor, null);

    // Verifica que nomeFantasia ausente vira inferido da razaoSocial (nunca string inventada)
    if (!raw.nome_fantasia || String(raw.nome_fantasia).trim() === '') {
      assert.equal(lead.nomeFantasia.status, 'inferido');
      assert.equal(lead.nomeFantasia.valor, String(raw.razao_social).trim());
    } else {
      assert.equal(lead.nomeFantasia.status, 'verificado');
      assert.equal(lead.nomeFantasia.valor, String(raw.nome_fantasia).trim());
    }

    // Verifica telefone ausente -> desconhecido (nunca fallback inventado)
    if (!raw.ddd_telefone_1 || String(raw.ddd_telefone_1).replace(/\D/g, '').length < 10) {
      assert.equal(lead.contato.telefone1.status, 'desconhecido');
      assert.equal(lead.contato.telefone1.valor, null);
    } else {
      assert.equal(lead.contato.telefone1.status, 'verificado');
      assert.equal(lead.contato.telefone1.valor, String(raw.ddd_telefone_1).replace(/\D/g, ''));
    }

    // Verifica e-mail ausente -> desconhecido
    if (!raw.email) {
      assert.equal(lead.contato.email.status, 'desconhecido');
      assert.equal(lead.contato.email.valor, null);
    }

    // Verifica mensagem padrão gerada
    const msg = buildStandardWhatsAppMessage(lead, {
      remetente: 'Filipe',
      includeOpeningCongrats: true,
    });
    assert.equal(
      findForbiddenOutreachContent(msg).length,
      0,
      `Frase proibida na mensagem para ${cnpj}: ${msg}`
    );

    console.log(`CNPJ: ${lead.cnpj.valor}`);
    console.log(`  Fonte primária : ${lead.cnpj.fonte} (${lead.cnpj.url_ou_api})`);
    console.log(`  Razão Social   : ${lead.razaoSocial.valor} [${lead.razaoSocial.status}]`);
    console.log(`  Nome Fantasia  : ${lead.nomeFantasia.valor} [${lead.nomeFantasia.status}]`);
    console.log(`  Situação       : ${lead.situacaoCadastral.valor} [${lead.situacaoCadastral.status}]`);
    console.log(`  Abertura       : ${lead.dataAbertura.valor} (${lead.rotuloEstagio.valor}) [${lead.dataAbertura.status}]`);
    console.log(`  CNAE / IBGE    : ${lead.cnaePrincipal.valor} - ${lead.cnaeDescricao.valor} [${lead.cnaeDescricao.status}]`);
    console.log(`  Município/IBGE : ${lead.municipio.valor} - ${lead.uf.valor} (Cód. IBGE ${lead.codigoIbgeMunicipio?.valor}) [${lead.codigoIbgeMunicipio?.status}]`);
    console.log(`  Porte/Nat.Jur. : ${lead.porte.valor} / ${lead.naturezaJuridica.valor}`);
    console.log(`  Titular/Sócio  : ${lead.titularOuSocioPrincipal.valor?.nome || 'Não verificado'} [${lead.titularOuSocioPrincipal.status}]`);
    console.log(`  Telefone/Email : ${lead.contato.telefoneFormatado.valor || 'Não verificado'} [${lead.contato.telefone1.status}] | ${lead.contato.email.valor || 'Não verificado'} [${lead.contato.email.status}]`);
    console.log(`  Tipo Contato   : ${lead.contato.tipoContato.valor || 'desconhecido'} [${lead.contato.tipoContato.status}]`);
    console.log(`  Possui Sistema : ${lead.diagnostico.possuiSistema.valor || 'Não verificado'} [${lead.diagnostico.possuiSistema.status}]`);
    console.log(`  Msg WhatsApp   : ${msg}\n`);
  }

  console.log('✅ E2E com 3 CNPJs reais recentes do DF concluído com 100% de conformidade!');
}

run().catch((err) => {
  console.error('❌ Falha no E2E:', err);
  process.exit(1);
});
