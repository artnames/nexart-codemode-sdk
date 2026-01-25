# Core vs Edges — NexArt CodeMode Business Model

## Core (Free, Open Source, MIT Licensed)

The following are **free forever** under the MIT license:

- **@nexart/codemode-sdk** — Deterministic execution runtime
- **nexart CLI** — Local run/replay/verify commands
- **Snapshot format** — Open specification (v1)
- **Local verification** — Offline determinism checks
- **Protocol specification** — VAR[0..9], seeded randomness, canvas API

No telemetry. No automatic network calls. Works offline forever.

---

## Edges (Optional Paid Services)

NexArt monetizes **optional hosted services**, not the core SDK:

| Service | Description |
|---------|-------------|
| **Hosted Attestation** | NexArt-signed verification proofs |
| **Retention** | Cloud storage for snapshots and proofs |
| **SLA Guarantees** | Uptime and latency commitments |
| **Compliance Tooling** | Audit trails, enterprise features |

These services are entirely optional. The SDK and CLI work fully offline.

---

## Attestation Types

- **NexArt Attested** — Signed by NexArt's hosted service key (paid)
- **Self Attested** — Signed by your own self-hosted key (free, you run it)

---

## Privacy Guarantee

- No telemetry in SDK or CLI
- No automatic network calls
- No usage tracking
- All verification can be done locally
