const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeMemberCheckResponse, normalizeMemberStatus } = require('../common/member-check.js');

test('bookroom style response is normalized', () => {
  const result = normalizeMemberCheckResponse({
    isRegistered: true,
    fullName: '山田 太郎',
    status: 'OK'
  });

  assert.equal(result.isRegistered, true);
  assert.equal(result.status, 'ok');
  assert.equal(result.fullName, '山田 太郎');
});

test('notice style response is normalized', () => {
  const result = normalizeMemberCheckResponse({
    data: {
      status: 'suspended',
      member_name: '鈴木 一郎',
      register_form_url: 'https://liff.line.me/example'
    }
  });

  assert.equal(result.isRegistered, true);
  assert.equal(result.status, 'suspended');
  assert.equal(result.registerFormUrl, 'https://liff.line.me/example');
});

test('not registered status is normalized', () => {
  const result = normalizeMemberCheckResponse({
    isRegistered: false
  });

  assert.equal(result.isRegistered, false);
  assert.equal(result.status, 'not_registered');
});

test('legacy status keywords are mapped', () => {
  assert.equal(normalizeMemberStatus('NG'), 'suspended');
  assert.equal(normalizeMemberStatus('restricted'), 'suspended');
  assert.equal(normalizeMemberStatus('active'), 'ok');
});
