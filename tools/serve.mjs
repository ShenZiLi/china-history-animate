// 本地静态服务：node tools/serve.mjs [port]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = parseInt(process.argv[2] || '8931', 10);
await startServer(ROOT, port);
console.log(`预览： http://127.0.0.1:${port}/`);
