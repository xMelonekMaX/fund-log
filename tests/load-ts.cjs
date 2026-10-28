const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const projectRequire = createRequire(path.join(root, 'package.json'));

// Exercise the actual TypeScript sources with Node's built-in test runner.
function loadTs(entry, mocks = {}, cache = new Map()) {
  const filename = path.resolve(root, entry);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id];
    if (id.startsWith('@/') || id.startsWith('.')) {
      const target = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(filename), id);
      const file = [target, target + '.ts', target + '.tsx'].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (file && /\.tsx?$/.test(file)) return loadTs(file, mocks, cache);
      return projectRequire(target);
    }
    return projectRequire(id);
  };
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
module.exports = { loadTs };
