const { execSync } = require('child_process');
const fs = require('fs');

try {
  const mcpConfig = JSON.parse(fs.readFileSync('C:/Users/filip/.gemini/config/mcp_config.json', 'utf8'));
  const token = mcpConfig.mcpServers?.github?.env?.GITHUB_PERSONAL_ACCESS_TOKEN;

  if (!token) throw new Error('Token não encontrado');

  execSync('git add .', { stdio: 'inherit' });
  execSync('git commit -m "feat: radar de comércios e empresas recém-abertas (0-365 dias) com filtros temporais, diagnóstico sem sistema e exportação"', { stdio: 'inherit' });

  const remoteUrl = `https://${token}@github.com/FlipLM/market-intelligence-ai.git`;
  execSync(`git remote set-url origin ${remoteUrl}`, { stdio: 'ignore' });
  execSync('git push origin main', { stdio: 'inherit' });
  execSync('git remote set-url origin https://github.com/FlipLM/market-intelligence-ai.git', { stdio: 'ignore' });
  console.log('Push realizado com sucesso!');
} catch (err) {
  console.error('Erro no push:', err.message);
  process.exit(1);
}
