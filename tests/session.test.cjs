const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadTs } = require('./load-ts.cjs');
// Browser globals are replaced per test and restored by the test context.
global.localStorage = undefined;

const owner = '67ed63b0476a735fe2a204c5';
const cookieId = '67ed63b0476a735fe2a204c6';
const sessionData = (userId = owner, isSessionValid = true) => ({ userId, isSessionValid, email: 'owner@example.test', userUpdatedAt: new Date(), defaultCurrencyCode: 'PLN' });
function storage(values = { userId: owner, isSessionValid: 'true' }) {
  const data = new Map(Object.entries(values));
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: (k) => data.delete(k), clear: () => { throw new Error('Must not erase local storage'); } };
}
function server(overrides = {}) {
  let renewals = 0;
  const session = { id: cookieId, userId: owner, expiresAt: new Date(Date.now() + 3600_000), save: async () => {} };
  const action = loadTs('actions/userActions.ts', {
    'next/headers': { cookies: async () => ({ get: () => ({ value: cookieId }) }) },
    '@/models/Session': { findById: async () => session },
    '@/models/User': { findById: async () => ({ id: owner }) },
    '@/lib/mongoDb': { connectDb: async () => {} },
    './cookieActions': { setAuthCookie: async () => { renewals++; } },
    ...overrides,
  });
  return { action, session, renewals: () => renewals };
}

function account(expenses = 0, categories = 0) {
  const fail = () => { throw new Error('Must not delete local data'); };
  return loadTs('lib/prepareLocalAccount.ts', { './indexedDb': { localDb: {
    expenses: { count: async () => expenses, clear: fail }, categories: { count: async () => categories, clear: fail }, delete: fail,
  } } });
}

test('same-account login preserves local ownership, cursors and unsent data', async (t) => {
  t.mock.property(global, 'localStorage', storage({ userId: owner, isSessionValid: 'false', expensesUpdatedAt: 'old-cursor', email: 'owner@example.test' }));
  assert.equal(await account(1000, 10).prepareLocalAccount(sessionData()), 'active');
  assert.equal(localStorage.getItem('userId'), owner);
  assert.equal(localStorage.getItem('expensesUpdatedAt'), 'old-cursor');
  assert.equal(localStorage.getItem('isSessionValid'), 'true');
});

test('logging into another account does not clear or reassign offline data', async (t) => {
  t.mock.property(global, 'localStorage', storage());
  assert.equal(await account(1000, 10).prepareLocalAccount(sessionData('different-user')), 'account-mismatch');
  assert.equal(localStorage.getItem('userId'), owner);
  assert.equal(localStorage.getItem('isSessionValid'), 'false');
});

test('missing owner with saved data blocks adoption and preserves the data', async (t) => {
  t.mock.property(global, 'localStorage', storage({ email: 'owner@example.test' }));
  assert.equal(await account(1000).prepareLocalAccount(sessionData()), 'account-mismatch');
  assert.equal(localStorage.getItem('userId'), null);
  assert.equal(localStorage.getItem('email'), 'owner@example.test');
});

test('an expired server session does not modify the local owner', async (t) => {
  t.mock.property(global, 'localStorage', storage());
  assert.equal(await account(1000).prepareLocalAccount(sessionData('another-user', false)), 'session-required');
  assert.equal(localStorage.getItem('userId'), owner);
});

test('an empty device can sign in without deleting any storage', async (t) => {
  t.mock.property(global, 'localStorage', storage({ selectedLanguage: 'pl' }));
  assert.equal(await account().prepareLocalAccount(sessionData()), 'active');
  assert.equal(localStorage.getItem('userId'), owner);
  assert.equal(localStorage.getItem('selectedLanguage'), 'pl');
});

test('live session check renews a valid session and reports expiry explicitly', async () => {
  const s = server();
  const active = await s.action.checkSyncSession(owner);
  assert.equal(active.status, 'active');
  assert.ok(new Date(active.expiresAt).getTime() > Date.now() + 179 * 86400_000);
  assert.equal(s.renewals(), 1);
  s.session.expiresAt = new Date(0);
  assert.deepEqual(await s.action.checkSyncSession(owner), { status: 'session-required' });
});

test('missing or deleted cookies/sessions and a different account are distinguished', async () => {
  const noCookie = server({ 'next/headers': { cookies: async () => ({ get: () => undefined }) } });
  assert.deepEqual(await noCookie.action.checkSyncSession(owner), { status: 'session-required' });
  const noSession = server({ '@/models/Session': { findById: async () => null } });
  assert.deepEqual(await noSession.action.checkSyncSession(owner), { status: 'session-required' });
  assert.deepEqual(await server().action.checkSyncSession('different-user'), { status: 'account-mismatch' });
});

test('a database outage is reported as unavailable rather than an expired session', async (t) => {
  t.mock.method(console, 'error', () => {});
  const s = server({ '@/lib/mongoDb': { connectDb: async () => { throw new Error('database unavailable'); } } });
  assert.deepEqual(await s.action.checkSyncSession(owner), { status: 'unavailable' });
});

test('simultaneous client checks share one request and can recover after reauthentication', async (t) => {
  t.mock.property(global, 'localStorage', storage());
  let calls = 0;
  let result = { status: 'session-required' };
  const cache = new Map();
  const mocks = { '@/actions/userActions': { checkSyncSession: async () => { calls++; return result; } } };
  const { checkSession } = loadTs('lib/sync/checkSession.ts', mocks, cache);
  const a = checkSession(owner), b = checkSession(owner);
  assert.equal(a, b);
  const results = await Promise.all([a, b]);
  assert.equal(calls, 1);
  assert.deepEqual(results, [{ status: 'session-required' }, { status: 'session-required' }]);
  result = { status: 'active', userId: owner, expiresAt: new Date().toISOString() };
  assert.deepEqual(await checkSession(owner), result);
  assert.equal(calls, 2);
});

test('network or server-action failures do not masquerade as expired sessions', async (t) => {
  t.mock.property(global, 'localStorage', storage());
  const cache = new Map();
  const mocks = { '@/actions/userActions': { checkSyncSession: async () => { throw new Error('Server Components error digest'); } } };
  const { checkSession } = loadTs('lib/sync/checkSession.ts', mocks, cache);
  assert.deepEqual(await checkSession(owner), { status: 'unavailable' });
  assert.equal(localStorage.getItem('isSessionValid'), 'true');
});

test('expired session prevents reads/uploads without touching the local expenses', async (t) => {
  t.mock.property(global, 'localStorage', storage());
  t.mock.method(console, 'error', () => {});
  let calls = 0;
  const fail = () => { calls++; throw new Error('Must not access replicas'); };
  const cache = new Map();
  const mocks = {
    '@/actions/userActions': { checkSyncSession: async () => ({ status: 'session-required' }) },
    '@/actions/syncActions': { fetchModifiedExpensesBatch: fail, uploadExpensesBatch: fail },
    '../indexedDb': { localDb: { expenses: { toArray: fail }, transaction: fail } },
  };
  const { syncExpenses } = loadTs('lib/sync/expensesSyncUtils.ts', mocks, cache);
  assert.equal(await syncExpenses(), false);
  assert.equal(calls, 0);
  assert.equal(localStorage.getItem('userId'), owner);
});

test('demo mode cannot replace personal expenses after signing out', async (t) => {
  t.mock.property(global, 'localStorage', storage({ userId: owner, isSessionValid: 'false' }));
  const { initializeDemoMode } = loadTs('lib/demoUtils.ts', { './indexedDb': { localDb: {
    expenses: { count: async () => 1000 }, categories: { count: async () => 10 },
    delete: () => { throw new Error('Must not delete personal data'); },
  } } });
  await assert.rejects(initializeDemoMode(), /must be preserved/);
  assert.equal(localStorage.getItem('userId'), owner);
});
