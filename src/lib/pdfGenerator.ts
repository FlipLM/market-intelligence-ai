import { jsPDF } from 'jspdf';
import { NicheReport } from '@/types/market';
import { formatProvenanceText } from '@/types/provenance';

export function generateNichePdf(niche: NicheReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const drawHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('MARKET INTELLIGENCE AI  •  DOSSIÊ COM PROVENIÊNCIA DE DADOS', margin, 10);

    doc.setFont('helvetica', 'normal');
    const dateStr = new Date(niche.updatedAt).toLocaleDateString('pt-BR');
    doc.text(`Atualizado em: ${dateStr}`, pageWidth - margin, 10, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = margin + 10;
      drawHeader();
    }
  };

  drawHeader();
  currentY = 18;

  const nicheName = formatProvenanceText(niche.basicInfo.name);
  const segment = formatProvenanceText(niche.basicInfo.segment);
  const regState = formatProvenanceText(niche.basicInfo.geographicScope.state, 'BR');
  const cnaesText =
    niche.basicInfo.cnaes.valor && niche.basicInfo.cnaes.valor.length > 0
      ? niche.basicInfo.cnaes.valor.join(', ')
      : 'Não verificado';
  const totalEmpresas = formatProvenanceText(niche.commercialViability.totalEligibleCompanies);
  const decisores = formatProvenanceText(niche.commercialViability.accessibleDecisionMakers);
  const description = formatProvenanceText(niche.basicInfo.description);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'D');

  doc.setFillColor(37, 99, 235);
  doc.roundedRect(margin + 4, currentY + 4, 42, 5, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(segment.substring(0, 26).toUpperCase(), margin + 6, currentY + 7.5);

  doc.setFillColor(245, 158, 11);
  doc.roundedRect(margin + 48, currentY + 4, 24, 5, 1, 1, 'F');
  doc.text(`REGIÃO: ${regState}`, margin + 50, currentY + 7.5);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth - margin - 34, currentY + 4, 30, 26, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('SCORE', pageWidth - margin - 19, currentY + 9, { align: 'center' });
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(
    niche.scoring.finalScore !== null ? String(niche.scoring.finalScore) : 'N/V',
    pageWidth - margin - 19,
    currentY + 19,
    { align: 'center' }
  );
  doc.setFontSize(6);
  doc.setTextColor(52, 211, 153);
  doc.text(
    `CONF: ${niche.scoring.confidenceLevel.toUpperCase()}`,
    pageWidth - margin - 19,
    currentY + 26,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(nicheName, margin + 4, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `CNAE: ${cnaesText}  |  Empresas: ${totalEmpresas}  |  Decisores: ${decisores}`,
    margin + 4,
    currentY + 22
  );
  const descLines = doc.splitTextToSize(description, contentWidth - 42);
  doc.text(descLines[0] || '', margin + 4, currentY + 28);

  currentY += 40;

  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('1. SÍNTESE BASEADA EM EVIDÊNCIAS', margin, currentY);
  currentY += 4;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const recText = formatProvenanceText(niche.decisionRecommendation);
  const recLines = doc.splitTextToSize(recText, contentWidth - 6);
  doc.text(recLines.slice(0, 4), margin + 3, currentY + 5);
  currentY += 26;

  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('2. COMPOSIÇÃO DO SCORE E PROVENIÊNCIA', margin, currentY);
  currentY += 5;

  niche.scoring.items.forEach((item) => {
    checkPageBreak(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const valStr = item.rawScore !== null ? `${item.rawScore}/100` : 'Não verificado';
    doc.text(`${item.name}: ${valStr} [${item.status.toUpperCase()}]`, margin, currentY);
    currentY += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fonte: ${item.fonte}`, margin + 2, currentY);
    currentY += 4.5;
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Market Intelligence AI • Relatório com Proveniência Auditada', margin, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  const safeName = nicheName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  doc.save(`Dossie-Mercado-${safeName || niche.id}.pdf`);
}
