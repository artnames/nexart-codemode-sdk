# @nexart/cli v0.2

Command-line interface for NexArt CodeMode — run, replay, and verify deterministic generative art.

## Installation

```bash
# Global install (recommended)
npm install -g @nexart/cli

# After global install, use the `nexart` command directly:
nexart run sketch.js --seed 12345
```

## Quick Start (npx)

Run without installing globally:

```bash
# Using npx (no install required)
npx @nexart/cli run sketch.js --seed 12345
npx @nexart/cli verify out.snapshot.json
npx @nexart/cli replay out.snapshot.json --out replay.png
```

## Overview

The CLI renders Code Mode sketches via a **remote canonical renderer** and creates verifiable snapshots.

**v0.2 features:**
- Real PNG output via remote renderer
- Snapshot v1 format with SHA-256 hashing
- Verify and replay commands
- Optional code embedding in snapshots

## Commands

### Run

Execute a sketch and create a snapshot:

```bash
# With remote renderer (default)
nexart run sketch.js --seed 12345 --out render.png

# With code embedded for standalone verify/replay
nexart run sketch.js --seed 12345 --include-code

# Offline mode (placeholder PNG)
nexart run sketch.js --renderer local
```

**Options:**
| Flag | Default | Description |
|------|---------|-------------|
| `--out, -o` | out.png | Output PNG path |
| `--seed, -s` | random | PRNG seed |
| `--vars, -v` | 0,0,0,0,0,0,0,0,0,0 | VAR values (comma-separated) |
| `--width, -w` | 1950 | Canvas width |
| `--height` | 2400 | Canvas height |
| `--renderer` | remote | `remote` or `local` |
| `--endpoint` | env/localhost:5000 | Remote renderer URL |
| `--include-code` | false | Embed code in snapshot |
| `--runtime-hash` | auto | Override runtime hash |

**Outputs:**
- `render.png` — The rendered image
- `render.snapshot.json` — Snapshot for replay/verify

### Verify

Check that a snapshot produces the expected output:

```bash
nexart verify render.snapshot.json

# With external code file
nexart verify render.snapshot.json --code sketch.js
```

**Exit codes:**
- `0` — PASS (hashes match)
- `1` — FAIL (hashes differ or error)

### Replay

Re-execute from a snapshot:

```bash
nexart replay render.snapshot.json --out replay.png

# With external code file
nexart replay render.snapshot.json --code sketch.js --out replay.png
```

## Remote Renderer

The CLI calls a canonical Node.js renderer endpoint for real PNG generation.

### Endpoint Configuration

```bash
# Via environment variable
export NEXART_RENDERER_ENDPOINT=http://localhost:5000

# Via CLI flag
nexart run sketch.js --endpoint http://render.nexart.io
```

### Expected API

```
POST /api/render
Content-Type: application/json

{
  "code": "...",
  "seed": 12345,
  "VAR": [0,0,0,0,0,0,0,0,0,0],
  "width": 1950,
  "height": 2400,
  "protocolVersion": "1.2.0"
}

Response: image/png (binary)
Headers:
  X-Runtime-Hash: <hash>
```

Or JSON response:
```json
{
  "pngBase64": "...",
  "runtimeHash": "..."
}
```

## Snapshot Format (v1)

```json
{
  "protocol": "nexart",
  "protocolVersion": "1.2.0",
  "runtime": "canonical",
  "runtimeHash": "<sha256>",
  "codeHash": "<sha256>",
  "seed": 12345,
  "VAR": [0,0,0,0,0,0,0,0,0,0],
  "canvas": { "width": 1950, "height": 2400 },
  "outputHash": "<sha256>",
  "createdAt": "2026-01-24T...",
  "code": "..." // optional, if --include-code
}
```

**Hash definitions:**
- `outputHash` = SHA-256 of PNG bytes
- `codeHash` = SHA-256 of normalized code
- `runtimeHash` = From renderer or SHA-256 of SDK version

## Renderer Modes

| Mode | Description |
|------|-------------|
| `--renderer remote` | **Default.** Calls canonical renderer, produces real PNG output. |
| `--renderer local` | **NOT implemented yet.** Outputs a 1x1 placeholder image only. No real offline verification. |

```bash
# Remote (default) — real PNG output
nexart run sketch.js --seed 12345

# Local — NOT implemented, placeholder only
nexart run sketch.js --renderer local
```

Real local/offline rendering is planned for a future release.

## License

MIT — Free for all use including commercial.

See [Core vs Edges](../../docs/core-vs-edges.md) for the NexArt business model.
