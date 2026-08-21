const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveMemberAccess, isLocalRuntime } = require('../common/liff-app.js');

test('not registered access resolves to not_registered state', () => {
  const state = resolveMemberAccess({ isRegistered: false });
  assert.equal(state.state, 'not_registered');
  assert.equal(state.isAllowed, false);
});

test('suspended access resolves to suspended state', () => {
  const state = resolveMemberAccess({ status: 'NG' });
  assert.equal(state.state, 'suspended');
  assert.equal(state.isAllowed, false);
});

test('normal registered access resolves to app state', () => {
  const state = resolveMemberAccess({ isRegistered: true, status: 'OK', fullName: '山田 太郎' });
  assert.equal(state.state, 'app');
  assert.equal(state.isAllowed, true);
  assert.equal(state.member.fullName, '山田 太郎');
});

test('local runtime detection works for localhost and file protocol', () => {
  assert.equal(isLocalRuntime({ hostname: 'localhost', protocol: 'https:' }), true);
  assert.equal(isLocalRuntime({ hostname: 'example.com', protocol: 'file:' }), true);
  assert.equal(isLocalRuntime({ hostname: 'example.com', protocol: 'https:' }), false);
});
