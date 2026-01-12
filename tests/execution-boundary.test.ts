/**
 * Execution Boundary Tests
 * 
 * These tests verify that all forbidden APIs throw [Code Mode Protocol Error]
 * when accessed from inside sketch code. This prevents determinism escape hatches.
 * 
 * Run: npx tsx tests/execution-boundary.test.ts
 */

import { FORBIDDEN_APIS, createSafeMath } from '../execution-sandbox';

const BLOCKED_FUNCTIONS = [
  'Date',
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'eval',
  'Function',
  'Notification',
  'Worker',
  'SharedWorker',
  'Blob',
  'File',
  'FileReader',
  'URL',
  'URLSearchParams',
  'Headers',
  'Request',
  'Response',
  'EventSource',
  'Image',
  'Audio',
  'Video',
];

const BLOCKED_OBJECTS = [
  'performance',
  'process',
  'navigator',
  'globalThis',
  'crypto',
  'document',
  'window',
  'self',
  'top',
  'parent',
  'frames',
  'location',
  'history',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'caches',
  'ServiceWorker',
];

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error}`);
    failed++;
  }
}

function expectThrows(fn: () => void, expectedPattern: string) {
  try {
    fn();
    throw new Error(`Expected to throw, but did not`);
  } catch (error: any) {
    if (!error.message.includes('[Code Mode Protocol Error]')) {
      throw new Error(`Expected [Code Mode Protocol Error], got: ${error.message}`);
    }
    if (!error.message.includes(expectedPattern)) {
      throw new Error(`Expected message to include "${expectedPattern}", got: ${error.message}`);
    }
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('Execution Boundary Tests — Forbidden API Blocking');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

console.log('Testing BLOCKED FUNCTION stubs...');
console.log('');

for (const apiName of BLOCKED_FUNCTIONS) {
  const stub = FORBIDDEN_APIS[apiName as keyof typeof FORBIDDEN_APIS];
  
  if (!stub) {
    test(`${apiName} stub exists`, () => {
      throw new Error(`No stub found for ${apiName}`);
    });
    continue;
  }
  
  test(`${apiName}() throws on function call`, () => {
    expectThrows(() => {
      (stub as any)();
    }, apiName);
  });
  
  test(`${apiName} throws on property access`, () => {
    expectThrows(() => {
      (stub as any).someProperty;
    }, apiName);
  });
  
  test(`new ${apiName}() throws on construction`, () => {
    expectThrows(() => {
      new (stub as any)();
    }, apiName);
  });
}

console.log('');
console.log('Testing BLOCKED OBJECT stubs...');
console.log('');

for (const apiName of BLOCKED_OBJECTS) {
  const stub = FORBIDDEN_APIS[apiName as keyof typeof FORBIDDEN_APIS];
  
  if (!stub) {
    test(`${apiName} stub exists`, () => {
      throw new Error(`No stub found for ${apiName}`);
    });
    continue;
  }
  
  test(`${apiName} throws on property access`, () => {
    expectThrows(() => {
      (stub as any).someProperty;
    }, apiName);
  });
  
  test(`${apiName} throws on method access`, () => {
    expectThrows(() => {
      (stub as any).someMethod();
    }, apiName);
  });
}

console.log('');
console.log('Testing Math.random blocking...');
console.log('');

test('Math.random throws via createSafeMath()', () => {
  const safeMath = createSafeMath();
  expectThrows(() => {
    safeMath.random();
  }, 'Math.random');
});

test('Safe Math preserves other functions', () => {
  const safeMath = createSafeMath();
  if (safeMath.floor(1.5) !== 1) {
    throw new Error('Math.floor broken');
  }
  if (safeMath.sin(0) !== 0) {
    throw new Error('Math.sin broken');
  }
  if (safeMath.PI !== Math.PI) {
    throw new Error('Math.PI broken');
  }
});

console.log('');
console.log('Testing Date-specific methods...');
console.log('');

test('Date.now throws', () => {
  const stub = FORBIDDEN_APIS.Date;
  expectThrows(() => {
    (stub as any).now;
  }, 'Date');
});

test('Date.parse throws', () => {
  const stub = FORBIDDEN_APIS.Date;
  expectThrows(() => {
    (stub as any).parse;
  }, 'Date');
});

console.log('');
console.log('Testing performance-specific methods...');
console.log('');

test('performance.now throws', () => {
  const stub = FORBIDDEN_APIS.performance;
  expectThrows(() => {
    (stub as any).now;
  }, 'performance');
});

test('performance.timing throws', () => {
  const stub = FORBIDDEN_APIS.performance;
  expectThrows(() => {
    (stub as any).timing;
  }, 'performance');
});

console.log('');
console.log('Testing crypto-specific methods...');
console.log('');

test('crypto.getRandomValues throws', () => {
  const stub = FORBIDDEN_APIS.crypto;
  expectThrows(() => {
    (stub as any).getRandomValues;
  }, 'crypto');
});

test('crypto.subtle throws', () => {
  const stub = FORBIDDEN_APIS.crypto;
  expectThrows(() => {
    (stub as any).subtle;
  }, 'crypto');
});

console.log('');
console.log('Testing globalThis access paths...');
console.log('');

test('globalThis.Date throws', () => {
  const stub = FORBIDDEN_APIS.globalThis;
  expectThrows(() => {
    (stub as any).Date;
  }, 'globalThis');
});

test('globalThis.performance throws', () => {
  const stub = FORBIDDEN_APIS.globalThis;
  expectThrows(() => {
    (stub as any).performance;
  }, 'globalThis');
});

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════════');

if (failed > 0) {
  process.exit(1);
}
