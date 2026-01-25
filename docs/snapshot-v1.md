# Snapshot v1 Specification

## Overview

A NexArt Snapshot captures all inputs needed to deterministically reproduce a Code Mode render. Given the same snapshot and protocol version, the output is **byte-for-byte identical**.

---

## Snapshot Fields

```typescript
interface NexArtSnapshotV1 {
  protocol: 'nexart';
  protocolVersion: string;      // e.g., '1.2.0'
  runtime: 'canonical';
  runtimeHash: string;          // SHA-256 of runtime version string
  codeHash: string;             // SHA-256 of normalized code
  seed: number;                 // PRNG seed
  VAR: number[];                // 10 protocol variables (0-100)
  canvas: {
    width: number;              // Canvas width in pixels
    height: number;             // Canvas height in pixels
  };
  outputHash: string;           // SHA-256 of PNG bytes
  createdAt: string;            // ISO 8601 timestamp
}
```

---

## Hash Definitions

### outputHash
SHA-256 of the raw PNG bytes (not base64, not the file path).

```typescript
outputHash = sha256(pngBytes).toString('hex');
```

### codeHash
SHA-256 of **canonically normalized** code:
1. Convert CRLF to LF
2. Trim trailing whitespace per line
3. Ensure single trailing newline

```typescript
function normalizeCode(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n+$/, '\n');
}
codeHash = sha256(normalizeCode(code)).toString('hex');
```

### runtimeHash
SHA-256 of the SDK version string (e.g., '1.8.3').

When using the CLI with `--renderer remote`, the `runtimeHash` is sourced from the canonical renderer's response header (`X-Runtime-Hash`) or JSON field (`runtimeHash`).

### Optional Code Embedding

When running with `--include-code`, the snapshot includes an optional `code` field containing the original source code. This enables standalone replay/verify without the original file:

```typescript
interface NexArtSnapshotV1 {
  // ... other fields ...
  code?: string;  // Optional: embedded code for standalone replay
}
```

---

## Replay Guarantee

Given:
- Same `codeHash` (same normalized source code)
- Same `seed`
- Same `VAR[0..9]`
- Same `canvas.width` and `canvas.height`
- Same `protocolVersion`

The `outputHash` will be **identical**.

---

## CLI Commands

```bash
# Generate snapshot
nexart run sketch.js --out render.png --seed 12345

# Replay from snapshot
nexart replay render.snapshot.json --out replay.png

# Verify snapshot
nexart verify render.snapshot.json
# Prints: PASS or FAIL with expected/actual hashes
```

---

## Cross-Platform Compatibility

Hashing works in both environments:
- **Node.js**: `crypto.createHash('sha256')`
- **Browser**: `crypto.subtle.digest('SHA-256', ...)`

The SDK provides a unified `sha256()` function that works in both.
