/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
import fs from 'node:fs';
import path from 'node:path';
import { checkUnprunedJson } from './rules/unpruned-json.js';
import { checkUnbatchedLoops } from './rules/unbatched-loop.js';
import { checkMissingCaching } from './rules/missing-caching.js';
import { checkUnboundedTokens } from './rules/unbounded-tokens.js';
import { calculateSavings } from './cost.js';
const IGNORED_DIRS = new Set([
    'node_modules', 'dist', 'build', '.git', '.next', '.turbo',
    'coverage', 'venv', '.venv', '__pycache__', '.pytest_cache'
]);
const SUPPORTED_EXTENSIONS = new Set([
    '.js', '.mjs', '.cjs', '.jsx',
    '.ts', '.mts', '.cts', '.tsx',
    '.py'
]);
function getFilesRecursively(dir) {
    let results = [];
    if (!fs.existsSync(dir))
        return results;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) {
                results = results.concat(getFilesRecursively(fullPath));
            }
        }
        else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (SUPPORTED_EXTENSIONS.has(ext)) {
                results.push(fullPath);
            }
        }
    }
    return results;
}
export function scanCodebase(options = {}) {
    const rootDir = options.targetDir ? path.resolve(options.targetDir) : (options.cwd || process.cwd());
    const files = getFilesRecursively(rootDir);
    const findings = [];
    const ignoredRules = new Set(options.ignoreRules || []);
    for (const file of files) {
        let content = '';
        try {
            content = fs.readFileSync(file, 'utf-8');
        }
        catch {
            continue;
        }
        const relPath = path.relative(rootDir, file).replace(/\\/g, '/');
        const fileFindings = [
            ...checkUnprunedJson(relPath, content),
            ...checkUnbatchedLoops(relPath, content),
            ...checkMissingCaching(relPath, content),
            ...checkUnboundedTokens(relPath, content),
        ];
        for (const f of fileFindings) {
            if (!ignoredRules.has(f.rule)) {
                findings.push(f);
            }
        }
    }
    let errors = 0;
    let warnings = 0;
    let info = 0;
    for (const f of findings) {
        if (f.severity === 'error')
            errors++;
        else if (f.severity === 'warning')
            warnings++;
        else if (f.severity === 'info')
            info++;
    }
    const savings = calculateSavings(findings);
    const status = findings.length === 0 ? 'clean' : 'waste-detected';
    return {
        timestamp: new Date().toISOString(),
        filesScanned: files.length,
        findings,
        savings,
        status,
        summary: {
            errors,
            warnings,
            info,
        },
    };
}
//# sourceMappingURL=scanner.js.map