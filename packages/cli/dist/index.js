#!/usr/bin/env node
/**
 * @nexart/cli v0.2 — NexArt CodeMode CLI
 *
 * Commands:
 * - nexart run <file> — Execute via remote renderer and create snapshot
 * - nexart replay <snapshot> — Re-execute from snapshot
 * - nexart verify <snapshot> — Verify snapshot hash
 *
 * Remote rendering via canonical Node renderer endpoint.
 */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as http from 'http';
import * as https from 'https';
const CLI_VERSION = '0.2.1';
const SDK_VERSION = '1.8.3';
const PROTOCOL_VERSION = '1.2.0';
const DEFAULT_ENDPOINT = process.env.NEXART_RENDERER_ENDPOINT || 'http://localhost:5000';
function sha256(data) {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
    return crypto.createHash('sha256').update(buffer).digest('hex');
}
function normalizeCode(code) {
    return code
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .replace(/\n+$/, '') + '\n';
}
function hashCode(code) {
    return sha256(normalizeCode(code));
}
function normalizeVAR(vars) {
    const result = new Array(10).fill(0);
    if (vars) {
        for (let i = 0; i < Math.min(vars.length, 10); i++) {
            result[i] = Math.max(0, Math.min(100, vars[i] ?? 0));
        }
    }
    return result;
}
function parseVars(varsStr) {
    const parts = varsStr.split(',').map(s => parseInt(s.trim(), 10) || 0);
    return normalizeVAR(parts);
}
/**
 * Call remote renderer endpoint
 */
async function callRenderer(endpoint, code, seed, VAR, width, height) {
    const url = new URL('/api/render', endpoint);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    const body = JSON.stringify({
        code,
        seed,
        VAR,
        width,
        height,
        protocolVersion: PROTOCOL_VERSION,
    });
    return new Promise((resolve, reject) => {
        const req = httpModule.request({
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        }, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const responseBuffer = Buffer.concat(chunks);
                const contentType = res.headers['content-type'] || '';
                // Handle binary PNG response
                if (contentType.includes('image/png')) {
                    const runtimeHash = res.headers['x-runtime-hash'] || sha256(SDK_VERSION);
                    resolve({ pngBytes: responseBuffer, runtimeHash });
                    return;
                }
                // Handle JSON response (with base64 PNG or error)
                try {
                    const json = JSON.parse(responseBuffer.toString('utf-8'));
                    if (json.error) {
                        reject(new Error(`Renderer error: ${json.error}`));
                        return;
                    }
                    if (json.pngBase64) {
                        const pngBytes = Buffer.from(json.pngBase64, 'base64');
                        const runtimeHash = json.runtimeHash || sha256(SDK_VERSION);
                        resolve({ pngBytes, runtimeHash });
                        return;
                    }
                    reject(new Error('Invalid renderer response: no PNG data'));
                }
                catch (e) {
                    reject(new Error(`Failed to parse renderer response: ${e}`));
                }
            });
        });
        req.on('error', (e) => {
            reject(new Error(`Failed to connect to renderer at ${endpoint}: ${e.message}`));
        });
        req.write(body);
        req.end();
    });
}
/**
 * Create a placeholder PNG (1x1 white pixel) for local mode
 */
function createPlaceholderPng() {
    return Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0xFF, 0xFF, 0x3F,
        0x00, 0x05, 0xFE, 0x02, 0xFE, 0xDC, 0xCC, 0x59,
        0xE7, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
}
async function runCommand(file, options) {
    console.log(`[nexart] Running: ${file}`);
    console.log(`[nexart] Renderer: ${options.renderer}`);
    if (!fs.existsSync(file)) {
        console.error(`Error: File not found: ${file}`);
        process.exit(1);
    }
    const code = fs.readFileSync(file, 'utf-8');
    const codeHash = hashCode(code);
    const VAR = parseVars(options.vars);
    const { seed, width, height } = options;
    console.log(`[nexart] Seed: ${seed}`);
    console.log(`[nexart] VAR: [${VAR.join(', ')}]`);
    console.log(`[nexart] Canvas: ${width}x${height}`);
    let pngBytes;
    let runtimeHash;
    if (options.renderer === 'remote') {
        console.log(`[nexart] Endpoint: ${options.endpoint}`);
        try {
            const result = await callRenderer(options.endpoint, code, seed, VAR, width, height);
            pngBytes = result.pngBytes;
            runtimeHash = options.runtimeHash || result.runtimeHash;
            console.log(`[nexart] Received ${pngBytes.length} bytes from renderer`);
        }
        catch (error) {
            console.error(`[nexart] Remote render failed: ${error}`);
            console.error(`[nexart] Falling back to placeholder (local renderer NOT implemented yet)`);
            pngBytes = createPlaceholderPng();
            runtimeHash = options.runtimeHash || sha256(SDK_VERSION);
        }
    }
    else {
        console.log(`[nexart] WARNING: Local renderer NOT implemented yet — outputs placeholder image only`);
        pngBytes = createPlaceholderPng();
        runtimeHash = options.runtimeHash || sha256(SDK_VERSION);
    }
    const outputHash = sha256(pngBytes);
    const snapshot = {
        protocol: 'nexart',
        protocolVersion: PROTOCOL_VERSION,
        runtime: 'canonical',
        runtimeHash,
        codeHash,
        seed,
        VAR,
        canvas: { width, height },
        outputHash,
        createdAt: new Date().toISOString(),
    };
    if (options.includeCode) {
        snapshot.code = code;
    }
    const outPath = options.out;
    const snapshotPath = outPath.replace(/\.png$/i, '.snapshot.json');
    fs.writeFileSync(outPath, pngBytes);
    fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
    console.log(`[nexart] Output: ${outPath}`);
    console.log(`[nexart] Snapshot: ${snapshotPath}`);
    console.log(`[nexart] outputHash: ${outputHash}`);
    console.log(`[nexart] codeHash: ${codeHash}`);
}
async function replayCommand(snapshotFile, options) {
    console.log(`[nexart] Replaying from: ${snapshotFile}`);
    if (!fs.existsSync(snapshotFile)) {
        console.error(`Error: Snapshot not found: ${snapshotFile}`);
        process.exit(1);
    }
    const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf-8'));
    if (snapshot.protocol !== 'nexart') {
        console.error('Error: Invalid snapshot format');
        process.exit(1);
    }
    // Get code from snapshot, --code flag, or error
    let code;
    if (options.code && fs.existsSync(options.code)) {
        code = fs.readFileSync(options.code, 'utf-8');
        console.log(`[nexart] Using code from: ${options.code}`);
    }
    else if (snapshot.code) {
        code = snapshot.code;
        console.log(`[nexart] Using embedded code from snapshot`);
    }
    else {
        console.error('Error: No code available. Provide --code <file> or use a snapshot with embedded code.');
        console.error('Hint: Use --include-code when running to embed code in snapshot.');
        process.exit(1);
    }
    console.log(`[nexart] Protocol: ${snapshot.protocolVersion}`);
    console.log(`[nexart] Seed: ${snapshot.seed}`);
    console.log(`[nexart] VAR: [${snapshot.VAR.join(', ')}]`);
    console.log(`[nexart] Canvas: ${snapshot.canvas.width}x${snapshot.canvas.height}`);
    let pngBytes;
    if (options.renderer === 'remote') {
        console.log(`[nexart] Endpoint: ${options.endpoint}`);
        try {
            const result = await callRenderer(options.endpoint, code, snapshot.seed, snapshot.VAR, snapshot.canvas.width, snapshot.canvas.height);
            pngBytes = result.pngBytes;
            console.log(`[nexart] Received ${pngBytes.length} bytes from renderer`);
        }
        catch (error) {
            console.error(`[nexart] Remote render failed: ${error}`);
            pngBytes = createPlaceholderPng();
        }
    }
    else {
        pngBytes = createPlaceholderPng();
    }
    const outputHash = sha256(pngBytes);
    fs.writeFileSync(options.out, pngBytes);
    console.log(`[nexart] Output: ${options.out}`);
    console.log(`[nexart] outputHash: ${outputHash}`);
}
async function verifyCommand(snapshotFile, options) {
    console.log(`[nexart] Verifying: ${snapshotFile}`);
    if (!fs.existsSync(snapshotFile)) {
        console.error(`Error: Snapshot not found: ${snapshotFile}`);
        process.exit(1);
    }
    const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf-8'));
    if (snapshot.protocol !== 'nexart') {
        console.error('Error: Invalid snapshot format');
        process.exit(1);
    }
    // Get code
    let code;
    if (options.code && fs.existsSync(options.code)) {
        code = fs.readFileSync(options.code, 'utf-8');
        console.log(`[nexart] Using code from: ${options.code}`);
    }
    else if (snapshot.code) {
        code = snapshot.code;
        console.log(`[nexart] Using embedded code from snapshot`);
    }
    else {
        console.error('Error: No code available for verification.');
        console.error('Provide --code <file> or use a snapshot with embedded code.');
        console.error('Hint: Use --include-code when running to embed code in snapshot.');
        process.exit(1);
    }
    // Verify codeHash matches
    const computedCodeHash = hashCode(code);
    if (computedCodeHash !== snapshot.codeHash) {
        console.error(`[nexart] Code hash mismatch!`);
        console.error(`[nexart] Expected: ${snapshot.codeHash}`);
        console.error(`[nexart] Actual:   ${computedCodeHash}`);
        console.log(`[nexart] Result: FAIL (code changed)`);
        process.exit(1);
    }
    const expected = snapshot.outputHash;
    let actual;
    if (options.renderer === 'remote') {
        console.log(`[nexart] Endpoint: ${options.endpoint}`);
        try {
            const result = await callRenderer(options.endpoint, code, snapshot.seed, snapshot.VAR, snapshot.canvas.width, snapshot.canvas.height);
            actual = sha256(result.pngBytes);
        }
        catch (error) {
            console.error(`[nexart] Remote render failed: ${error}`);
            console.log(`[nexart] Result: FAIL (render error)`);
            process.exit(1);
        }
    }
    else {
        actual = sha256(createPlaceholderPng());
    }
    console.log(`[nexart] Expected: ${expected}`);
    console.log(`[nexart] Actual:   ${actual}`);
    if (expected === actual) {
        console.log(`[nexart] Result: PASS`);
        process.exit(0);
    }
    else {
        console.log(`[nexart] Result: FAIL`);
        process.exit(1);
    }
}
// CLI setup
yargs(hideBin(process.argv))
    .command('run <file>', 'Execute a Code Mode sketch and create snapshot', (yargs) => {
    return yargs
        .positional('file', {
        describe: 'Path to the sketch file',
        type: 'string',
        demandOption: true,
    })
        .option('out', {
        alias: 'o',
        describe: 'Output PNG path',
        type: 'string',
        default: 'out.png',
    })
        .option('seed', {
        alias: 's',
        describe: 'PRNG seed',
        type: 'number',
        default: Math.floor(Math.random() * 2147483647),
    })
        .option('vars', {
        alias: 'v',
        describe: 'Comma-separated VAR values (10 values, 0-100)',
        type: 'string',
        default: '0,0,0,0,0,0,0,0,0,0',
    })
        .option('width', {
        alias: 'w',
        describe: 'Canvas width',
        type: 'number',
        default: 1950,
    })
        .option('height', {
        describe: 'Canvas height',
        type: 'number',
        default: 2400,
    })
        .option('renderer', {
        describe: 'Renderer mode: remote (default, real PNG) or local (NOT implemented, placeholder only)',
        choices: ['local', 'remote'],
        default: 'remote',
    })
        .option('endpoint', {
        describe: 'Remote renderer endpoint URL',
        type: 'string',
        default: DEFAULT_ENDPOINT,
    })
        .option('runtime-hash', {
        describe: 'Override runtime hash (advanced)',
        type: 'string',
    })
        .option('include-code', {
        describe: 'Embed code in snapshot for standalone replay/verify',
        type: 'boolean',
        default: false,
    });
}, async (argv) => {
    await runCommand(argv.file, {
        out: argv.out,
        seed: argv.seed,
        vars: argv.vars,
        width: argv.width,
        height: argv.height,
        renderer: argv.renderer,
        endpoint: argv.endpoint,
        runtimeHash: argv['runtime-hash'],
        includeCode: argv['include-code'],
    });
})
    .command('replay <snapshot>', 'Re-execute from a snapshot file', (yargs) => {
    return yargs
        .positional('snapshot', {
        describe: 'Path to snapshot JSON file',
        type: 'string',
        demandOption: true,
    })
        .option('out', {
        alias: 'o',
        describe: 'Output PNG path',
        type: 'string',
        default: 'replay.png',
    })
        .option('code', {
        alias: 'c',
        describe: 'Path to code file (if not embedded in snapshot)',
        type: 'string',
    })
        .option('renderer', {
        describe: 'Renderer mode',
        choices: ['local', 'remote'],
        default: 'remote',
    })
        .option('endpoint', {
        describe: 'Remote renderer endpoint URL',
        type: 'string',
        default: DEFAULT_ENDPOINT,
    });
}, async (argv) => {
    await replayCommand(argv.snapshot, {
        out: argv.out,
        code: argv.code,
        renderer: argv.renderer,
        endpoint: argv.endpoint,
    });
})
    .command('verify <snapshot>', 'Verify a snapshot produces the expected output', (yargs) => {
    return yargs
        .positional('snapshot', {
        describe: 'Path to snapshot JSON file',
        type: 'string',
        demandOption: true,
    })
        .option('code', {
        alias: 'c',
        describe: 'Path to code file (if not embedded in snapshot)',
        type: 'string',
    })
        .option('renderer', {
        describe: 'Renderer mode',
        choices: ['local', 'remote'],
        default: 'remote',
    })
        .option('endpoint', {
        describe: 'Remote renderer endpoint URL',
        type: 'string',
        default: DEFAULT_ENDPOINT,
    });
}, async (argv) => {
    await verifyCommand(argv.snapshot, {
        code: argv.code,
        renderer: argv.renderer,
        endpoint: argv.endpoint,
    });
})
    .demandCommand(1, 'You must provide a command')
    .help()
    .version(CLI_VERSION)
    .epilog(`
Environment Variables:
  NEXART_RENDERER_ENDPOINT  Default remote renderer URL (default: http://localhost:5000)

Examples:
  nexart run sketch.js --seed 12345 --include-code
  nexart verify out.snapshot.json
  nexart replay out.snapshot.json --out replay.png
  nexart run sketch.js --renderer local  # NOT implemented yet (placeholder only)
  `)
    .parse();
//# sourceMappingURL=index.js.map