import { registerHooks } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function resolveTsTarget(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      const rel = specifier.slice(2);
      const target = resolveTsTarget(path.resolve(process.cwd(), 'src', rel));
      if (target) {
        return { url: target, shortCircuit: true };
      }
    }

    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      context.parentURL &&
      !specifier.endsWith('.json')
    ) {
      const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
      const target = resolveTsTarget(path.resolve(parentDir, specifier));
      if (target) {
        return { url: target, shortCircuit: true };
      }
    }

    return nextResolve(specifier, context);
  },
});
