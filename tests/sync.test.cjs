const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadTs } = require('./load-ts.cjs');
const { syncCollection, createSyncRunner, unchangedSinceSnapshot } = loadTs('lib/sync/syncCollection.ts');
const { resolveConflicts } = loadTs('lib/sync/resolveConflicts.ts');
const expense = (_id, time = 1000) => ({ _id, amount: 10, updatedAt: new Date(time), createdAt: new Date(time), date: new Date(time), categoryId: 'cat', currency: 'PLN', description: '' });
const deferred = () => { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; };

function replica(local, server, overrides = {}) {
  return {
    local: new Map(local.map((d) => [d._id, d])),
    server: new Map(server.map((d) => [d._id, d])),
    async sync() {
      await syncCollection({
        batchSize: 128,
        readLocal: async () => [...this.local.values()],
        readServer: async () => [...this.server.values()],
        upload: async (documents) => {
          for (const document of documents) this.server.set(document._id, document);
          return documents;
        },
        save: async (documents, snapshot) => {
          const original = new Map(snapshot.map((d) => [d._id, d]));
          for (const document of documents) {
            if (unchangedSinceSnapshot(this.local.get(document._id), original.get(document._id))) this.local.set(document._id, document);
          }
        },
        ...overrides,
      });
    },
  };
}

test('recovers old offline expenses despite a newer server timestamp and equal replica counts', async () => {
  const r = replica([expense('offline', 1000)], [expense('other-device', 900000)]);
  await r.sync();
  assert.deepEqual([...r.local.keys()].sort(), ['offline', 'other-device']);
  assert.deepEqual([...r.server.keys()].sort(), ['offline', 'other-device']);
});

test('partial upload failure is retryable without losing or skipping any of 300 expenses', async () => {
  let calls = 0;
  const r = replica(Array.from({length: 300}, (_, i) => expense(String(i))), []);
  const upload = async (documents) => {
    if (++calls === 2) throw new Error('offline');
    for (const d of documents) r.server.set(d._id, d);
    return documents;
  };
  await assert.rejects(replica([...r.local.values()], [], { upload }).sync(), /offline/);
  assert.equal(r.server.size, 128);
  await r.sync();
  assert.equal(r.local.size, 300);
  assert.equal(r.server.size, 300);
});

test('requires acknowledgements for the exact uploaded IDs', async () => {
  const r = replica([expense('a')], [], { upload: async () => [expense('wrong-id')] });
  await assert.rejects(r.sync(), /acknowledge/);
  assert.equal(r.local.size, 1);
});

test('an edit made during download survives and uploads on the next pass', async () => {
  const changed = expense('a', 3000);
  const r = replica([expense('a')], [expense('a', 2000)]);
  await replica([...r.local.values()], [], {
    readServer: async () => { r.local.set('a', changed); return [expense('a', 2000)]; },
    save: async (documents, snapshot) => {
      for (const d of documents) if (unchangedSinceSnapshot(r.local.get(d._id), snapshot.find((s) => s._id === d._id))) r.local.set(d._id, d);
    },
  }).sync();
  assert.equal(r.local.get('a'), changed);
  await r.sync();
  assert.equal(r.server.get('a'), changed);
});

test('deletions and server-only expenses are reconciled', () => {
  const deleted = { ...expense('a', 2000), deletedAt: new Date(2000) };
  const result = resolveConflicts([expense('a'), expense('offline')], [deleted, expense('server')]);
  assert.deepEqual(result.toUpload.map((d) => d._id), ['offline']);
  assert.equal(result.toSave.find((d) => d._id === 'a'), deleted);
  assert.equal(result.toSave.length, 2);
});

test('concurrent sync calls run sequentially and schedule another pass', async () => {
  const gate = deferred();
  let calls = 0, active = 0, maxActive = 0;
  const run = createSyncRunner(async () => {
    calls++; active++; maxActive = Math.max(maxActive, active);
    if (calls === 1) await gate.promise;
    active--;
  });
  const first = run();
  const second = run();
  assert.equal(first, second);
  gate.resolve();
  assert.equal(await first, true);
  assert.equal(calls, 2);
  assert.equal(maxActive, 1);
});

test('failed runs report failure and can be retried', async (t) => {
  t.mock.method(console, 'error', () => {});
  let calls = 0;
  const run = createSyncRunner(async () => { if (++calls === 1) throw new Error('expected network failure'); });
  assert.equal(await run(), false);
  assert.equal(await run(), true);
});
