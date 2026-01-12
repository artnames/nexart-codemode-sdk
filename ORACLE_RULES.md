# Oracle Rules — Protocol v1.2.0

╔══════════════════════════════════════════════════════════════════════════════╗
║  RELEASE GATE RULE                                                           ║
║                                                                              ║
║  If the oracle hash changes and the protocol version does not,               ║
║  the release is INVALID.                                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

---

## What is the Oracle?

The oracle is a deterministic regression test that verifies the SDK produces
identical output for identical inputs. It uses:

- A fixed canonical sketch (`oracle/oracle-config.json`)
- Fixed seed, VARs, and dimensions
- SHA-256 hash of raw pixel data

---

## Human Process Lock

**Before any of the following:**
- SDK publish to npm
- Renderer publish
- Runtime refactor
- Protocol change

**You MUST:**

```bash
npx tsx scripts/check-determinism.ts
```

**Result must be:**
```
✅ Determinism check passed
```

**If it fails:**
- ❌ Do NOT ship
- Investigate what changed
- Either fix the regression OR bump protocol version

---

## When to Bump Protocol Version

Only bump the protocol version (`protocolVersion` in types.ts) when:

1. **Intentional rendering change** — The output should differ
2. **Breaking determinism change** — Same inputs now produce different outputs
3. **New protocol features** — That affect rendering semantics

When you bump, also regenerate the oracle hash:

```bash
npx tsx scripts/generate-oracle-hash.ts
```

Then update `oracle/oracle-hash.txt` with the new hash.

---

## Files

| File | Purpose |
|------|---------|
| `oracle/oracle-config.json` | Canonical sketch + parameters |
| `oracle/oracle-hash.txt` | Expected SHA-256 hash |
| `scripts/check-determinism.ts` | Validates hash matches |
| `scripts/generate-oracle-hash.ts` | Regenerates hash |

---

## CI Integration (Recommended)

Add to your CI pipeline:

```yaml
- name: Determinism Check
  run: npx tsx scripts/check-determinism.ts
```

This ensures no merge can break determinism without explicit protocol version bump.
