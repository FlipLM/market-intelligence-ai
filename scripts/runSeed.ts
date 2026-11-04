import { initializeDatabaseSeed } from '../src/lib/seed';

console.log('Iniciando carga de inteligência de mercado para o Top 50 Nichos...');
initializeDatabaseSeed(true);
console.log('Carga finalizada com sucesso!');

