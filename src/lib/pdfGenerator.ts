import { jsPDF } from "jspdf";
import { NicheReport } from "@/types/market";

export function generateNichePdf(niche: NicheReport): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = margin + 10;
      drawHeader();
    }
  };

  const drawHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("MARKET INTELLIGENCE AI  •  DOSSIÊ DE INTELIGÊNCIA B2B", margin, 10);

    doc.setFont("helvetica", "normal");
    const dateStr = new Date(niche.updatedAt).toLocaleDateString("pt-BR");
    doc.text(`Atualizado em: ${dateStr}`, pageWidth - margin, 10, { align: "right" });

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // Primeira página - Header Inicial
  drawHeader();
  currentY = 18;

  // Banner Principal do Dossiê
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, "F");
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, "D");

  // Tag do Segmento
  doc.setFillColor(37, 99, 235); // blue-600
  doc.roundedRect(margin + 4, currentY + 4, 36, 5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(niche.basicInfo.segment.substring(0, 24).toUpperCase(), margin + 6, currentY + 7.5);

  // Região
  const regState = niche.basicInfo.geographicScope.state || "DF";
  doc.setFillColor(245, 158, 11); // amber-500
  doc.roundedRect(margin + 42, currentY + 4, 20, 5, 1, 1, "F");
  doc.text(`REGIÃO: ${regState}`, margin + 44, currentY + 7.5);

  // Score Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(pageWidth - margin - 32, currentY + 4, 28, 26, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("SCORE GERAL", pageWidth - margin - 18, currentY + 9, { align: "center" });
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(String(niche.scoring.finalScore), pageWidth - margin - 18, currentY + 20, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.text(niche.scoring.commercialPotential.toUpperCase(), pageWidth - margin - 18, currentY + 26, { align: "center" });

  // Título do Nicho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(niche.basicInfo.name, margin + 4, currentY + 16);

  // CNAE e Escopo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const cnaeText = `CNAE: ${niche.basicInfo.cnaes.join(", ")}  |  Universo Mapeado: ${niche.commercialViability.totalEligibleCompanies.toLocaleString("pt-BR")} empresas  |  Acesso Decisor: ${niche.commercialViability.accessibleDecisionMakers.toUpperCase()}`;
  doc.text(cnaeText, margin + 4, currentY + 22);

  const descText = doc.splitTextToSize(niche.basicInfo.description, contentWidth - 40);
  doc.text(descText[0] || "", margin + 4, currentY + 28);

  currentY += 40;

  // 1. Parecer do Analista de Decisão
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("1. SÍNTESE DO ANALISTA DE MERCADO", margin, currentY);
  currentY += 3;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const recLines = doc.splitTextToSize(niche.decisionRecommendation, contentWidth - 6);
  doc.text(recLines, margin + 3, currentY + 5);
  currentY += 26;

  // 2. Por que Entrar vs Riscos
  checkPageBreak(40);
  const colWidth = (contentWidth - 6) / 2;

  // Coluna Esquerda: Por que Entrar
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(margin, currentY, colWidth, 42, 2, 2, "F");
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(margin, currentY, colWidth, 42, 2, 2, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text("POTENCIAIS & POR QUE ENTRAR", margin + 3, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  let yWhy = currentY + 9;
  niche.whyEnterArguments.slice(0, 4).forEach((arg) => {
    const lines = doc.splitTextToSize(`• ${arg}`, colWidth - 6);
    doc.text(lines, margin + 3, yWhy);
    yWhy += lines.length * 3 + 1;
  });

  // Coluna Direita: Fricções & Riscos
  const rightX = margin + colWidth + 6;
  doc.setFillColor(254, 242, 242); // rose-50
  doc.roundedRect(rightX, currentY, colWidth, 42, 2, 2, "F");
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(rightX, currentY, colWidth, 42, 2, 2, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(225, 29, 72);
  doc.text("PONTOS DE ATENÇÃO & RISCOS", rightX + 3, currentY + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  let yRisk = currentY + 9;
  niche.whyNotEnterRisks.slice(0, 3).forEach((risk) => {
    const lines = doc.splitTextToSize(`• ${risk}`, colWidth - 6);
    doc.text(lines, rightX + 3, yRisk);
    yRisk += lines.length * 3 + 1;
  });

  currentY += 48;

  // 3. Auditoria Técnica de TI (Visão CTO / Engenharia)
  if (niche.techAudit) {
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("2. AUDITORIA TÉCNICA DE TI (VISÃO CTO & DEV)", margin, currentY);
    currentY += 4;

    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(56, 189, 248); // sky-400
    doc.text(`VEREDITO: ${niche.techAudit.verdictTitle.toUpperCase()}`, margin + 4, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(226, 232, 240);
    const reasonLines = doc.splitTextToSize(niche.techAudit.verdictReason, contentWidth - 8);
    doc.text(reasonLines, margin + 4, currentY + 11);

    // Métricas CTO
    const ctoMetricsY = currentY + 23;
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(margin + 4, ctoMetricsY, contentWidth - 8, 11, 1, 1, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Esforço vs ROI: ${niche.techAudit.devEffortVsRoiScore}/100  |  MVP Alvo: ${niche.techAudit.mvpDeliveryTargetDays} dias  |  Complexidade: ${niche.techAudit.architectureComplexity.toUpperCase()}  |  Reuso de Código: ${niche.techAudit.reusabilityPercentageEstimated}%`,
      margin + 7,
      ctoMetricsY + 4
    );

    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`Stack Recomendada: ${niche.techAudit.recommendedTechStack.frontend} + ${niche.techAudit.recommendedTechStack.backendAndDb}`, margin + 7, ctoMetricsY + 8);

    currentY += 44;
  }

  // 4. Oportunidades Críticas de Software
  checkPageBreak(50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("3. OPORTUNIDADES CRÍTICAS DE SOFTWARE & AUTOMAÇÃO", margin, currentY);
  currentY += 4;

  niche.opportunities.slice(0, 2).forEach((opp, idx) => {
    checkPageBreak(25);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(`${idx + 1}. ${opp.title}`, margin + 3, currentY + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    doc.text("Dor Operacional:", margin + 3, currentY + 8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const painLines = doc.splitTextToSize(opp.operationalProblem, contentWidth - 30);
    doc.text(painLines[0] || "", margin + 25, currentY + 8.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(5, 150, 105);
    doc.text("Solução Proposta:", margin + 3, currentY + 13);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    const solLines = doc.splitTextToSize(opp.digitalSolution, contentWidth - 30);
    doc.text(solLines[0] || "", margin + 25, currentY + 13);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `Complexidade: ${opp.complexity.toUpperCase()}  •  Ciclo Dev: ${opp.typicalDevelopmentDays} dias  •  Disposição a Pagar: ${opp.willingnessToPayHypothesis.toUpperCase()}`,
      margin + 3,
      currentY + 18.5
    );

    currentY += 26;
  });

  // 5. Modelagem Financeira & Unit Economics
  checkPageBreak(30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("4. MODELAGEM FINANCEIRA & UNIT ECONOMICS SUGERIDO", margin, currentY);
  currentY += 4;

  const cardW = (contentWidth - 6) / 3;

  // Setup Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, currentY, cardW, 20, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("SETUP DE IMPLANTAÇÃO", margin + 3, currentY + 5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `R$ ${niche.commercialViability.recommendedPricing.implementationSetupMin.toLocaleString("pt-BR")} - ${niche.commercialViability.recommendedPricing.implementationSetupMax.toLocaleString("pt-BR")}`,
    margin + 3,
    currentY + 12
  );
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Caixa rápido imediato no fechamento", margin + 3, currentY + 16.5);

  // Recorrência Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardW + 3, currentY, cardW, 20, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("MENSALIDADE (SAAS)", margin + cardW + 6, currentY + 5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `R$ ${niche.commercialViability.recommendedPricing.monthlyFeeMin.toLocaleString("pt-BR")} - ${niche.commercialViability.recommendedPricing.monthlyFeeMax.toLocaleString("pt-BR")}/mês`,
    margin + cardW + 6,
    currentY + 12
  );
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text("Recorrência contínua (ARR)", margin + cardW + 6, currentY + 16.5);

  // Tráfego Google Ads Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + (cardW + 3) * 2, currentY, cardW, 20, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("GOOGLE ADS & TRÁFEGO", margin + (cardW + 3) * 2 + 3, currentY + 5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`CPC Médio: R$ ${niche.paidTraffic.estimatedAverageCpc.toFixed(2)}`, margin + (cardW + 3) * 2 + 3, currentY + 12);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.text(`Disputa: ${niche.paidTraffic.auctionCompetition.toUpperCase()}`, margin + (cardW + 3) * 2 + 3, currentY + 16.5);

  currentY += 26;

  // 6. Cadência de Abordagem WhatsApp (Copywriter B2B)
  if (niche.outreachCopy && niche.outreachCopy.whatsAppCadence) {
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("5. ROTEIRO DE ABORDAGEM & CADÊNCIA WHATSAPP (PARA O PROSPECTOR)", margin, currentY);
    currentY += 4;

    niche.outreachCopy.whatsAppCadence.slice(0, 2).forEach((cad) => {
      checkPageBreak(25);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "F");
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${cad.step} (${cad.timing})`, margin + 3, currentY + 4.5);

      doc.setFont("helvetica", "italic");
      doc.setFontSize(6.8);
      doc.setTextColor(51, 65, 85);
      const msgLines = doc.splitTextToSize(`"${cad.messageText}"`, contentWidth - 6);
      doc.text(msgLines.slice(0, 3), margin + 3, currentY + 9);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`Objetivo: ${cad.purpose}`, margin + 3, currentY + 19);

      currentY += 25;
    });
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Market Intelligence AI • Documento Gerado para Decisão Estratégica", margin, pageHeight - 7);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  // Sanitiza nome do arquivo
  const safeName = niche.basicInfo.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");

  doc.save(`Dossie-Mercado-${safeName}.pdf`);
}

