// 本機一鍵抓取所有免 AI Token 的公開資料源，最後執行資料格式驗證。
// Fetch all zero-token public feeds locally in parallel, then validate the data files.
//
// 用法 / Usage:
//   node scripts/fetch-all.mjs                      # 任何來源失敗時回傳非 0 / exit non-zero on failure
//   node scripts/fetch-all.mjs --continue-on-error  # 即使部分來源失敗或離線仍繼續啟動站台 / keep going so local preview still opens
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const continueOnError = process.argv.includes('--continue-on-error');

const TASKS = [
  { name: 'CISA KEV（已遭利用漏洞）', script: 'fetch-kev.mjs' },
  { name: 'GitHub 套件漏洞（GHSA）', script: 'fetch-ghsa.mjs' },
  { name: '語言與框架版本（endoflife.date）', script: 'fetch-eol.mjs' },
  { name: '技術動態 RSS（19 個來源）', script: 'fetch-feeds.mjs' },
];

function runScript(script) {
  const start = Date.now();
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(__dirname, script)], {
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('close', (code) => {
      resolve({
        code: code ?? 1,
        ms: Date.now() - start,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

console.log('正在更新本機公開資料源（免 AI Token）...\n');

const results = await Promise.all(
  TASKS.map(async (task) => ({
    ...task,
    ...(await runScript(task.script)),
  }))
);

let failedCount = 0;
for (const r of results) {
  const sec = (r.ms / 1000).toFixed(1);
  if (r.code === 0) {
    const summary = r.stdout.split(/\r?\n/).filter(Boolean).at(-1) ?? '完成';
    console.log(`[OK]   ${r.name} (${sec}s) — ${summary}`);
  } else {
    failedCount += 1;
    const reason = r.stderr.split(/\r?\n/).filter(Boolean).at(-1)
      ?? r.stdout.split(/\r?\n/).filter(Boolean).at(-1)
      ?? `exit ${r.code}`;
    console.warn(`[WARN] ${r.name} (${sec}s) — ${reason}`);
  }
}

console.log('\n正在驗證資料格式...');
const check = await runScript('validate-data.mjs');
if (check.stdout) console.log(check.stdout);
if (check.stderr) console.error(check.stderr);

if (check.code !== 0) {
  console.error('\n資料驗證失敗，請檢查上述錯誤。');
  process.exit(1);
}

if (failedCount > 0) {
  console.warn(`\n有 ${failedCount} 個來源本次未完全成功，已保留上次成功的本機資料。`);
  if (!continueOnError) process.exit(1);
} else {
  console.log('\n所有免 Token 公開資料源皆已更新完成！');
}
