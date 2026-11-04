# Integração com o Prospector B2B (`G:\Prospector`)

## 1. Objetivo da Integração
O **Market Intelligence AI** descobre e qualifica o nicho antes da abordagem comercial.
Após a aprovação do nicho pelo usuário, ele transmite para o **Prospector B2B**:
1. Nome padronizado do nicho para busca no Google Maps.
2. Localização geográfica e filtros recomendados (ex: celulares 9 dígitos, empresas sem site moderno).
3. Perfil de Cliente Ideal (ICP).
4. Mensagem e roteiro pronto de abordagem para WhatsApp via link direto `wa.me`.

## 2. Ponto de Destino do Hand-off
Ao clicar no botão **"Enviar para o Prospector B2B"** na página do nicho:
- O endpoint `/api/niches/[id]/handoff` gera um arquivo estruturado em:
  `G:\Prospector\scratch\target_niche_<id>.json`
- O arquivo contém:
  ```json
  {
    "nicheId": "clinicas_odontologicas_especializadas",
    "nicheName": "Clínicas Odontológicas Especializadas",
    "googleMapsQuery": "Clínicas Odontológicas Especializadas em São Paulo, SP",
    "targetRegion": "São Paulo, SP",
    "idealCustomerProfile": {
      "description": "Empresas ativas com 3 a 30 colaboradores...",
      "companySize": "Pequena a Média Empresa",
      "hasWebsitePreferred": true,
      "mustHaveCellPhone": true
    },
    "suggestedPitchWhatsApp": "Olá! Notei a excelência do trabalho de vocês...",
    "diagnosticQuestions": [
      "Como sua equipe lida hoje com no-show de clientes?",
      "Quanto tempo por semana é gasto manualmente em conciliações?"
    ],
    "offerValueProposition": "Agendador Inteligente com Confirmação e Pagamento via Pix"
  }
  ```
- O robô Playwright do Prospector pode consumir essa consulta e iniciar a extração de contatos qualificados no Google Maps imediatamente.

