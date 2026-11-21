import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rulesContent = fs.readFileSync('firestore.rules', 'utf8');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

test('firestore.rules covers every collection declared in firebase-blueprint.json', () => {
  const paths = Object.keys(blueprint.firestore);
  assert.ok(paths.length >= 4);
  for (const path of paths) {
    assert.ok(
      rulesContent.includes(`match ${path}`),
      `Missing match block in firestore.rules for blueprint path ${path}`
    );
  }
});

test('firestore.rules enforces Eight Pillars and Dirty Dozen defenses', () => {
  // 1. Default-deny catch-all
  assert.match(rulesContent, /match \/\{document=\*\*\}[\s\S]*allow read, write: if false;/);

  // 2. Email verification required on bootstrapped owner email (Email Spoofing Test)
  assert.match(
    rulesContent,
    /request\.auth\.token\.email == 'huangqiyuan\.1@gmail\.com'\s*&&\s*request\.auth\.token\.email_verified == true/
  );

  // 3. No client writes to /admins (Self-Privilege Escalation Defense)
  assert.match(rulesContent, /match \/admins\/\{adminUid\}[\s\S]*allow create, update, delete: if false;/);

  // 4. Strict keys().hasAll & keys().hasOnly + affectedKeys().hasOnly (Shadow Update Defense)
  assert.ok(rulesContent.includes('data.keys().hasAll('));
  assert.ok(rulesContent.includes('data.keys().hasOnly('));
  assert.ok(rulesContent.includes('incoming().diff(existing()).affectedKeys().hasOnly('));

  // 5. Path variable hardening & strict ID pattern
  assert.ok(rulesContent.includes("id.matches('^[a-zA-Z0-9_\\\\-]+$')"));
  assert.ok(rulesContent.includes('isValidId(projectId)'));
  assert.ok(rulesContent.includes('isValidId(sketchId)'));

  // 6. Temporal integrity & immutable createdAt
  assert.ok(rulesContent.includes('incoming().createdAt == request.time'));
  assert.ok(rulesContent.includes('incoming().createdAt == existing().createdAt'));
  assert.ok(rulesContent.includes('incoming().updatedAt == request.time'));

  // 7. Secure list queries (no blanket allow list: if true;)
  assert.equal(rulesContent.includes('allow list: if true;'), false);
  assert.equal(rulesContent.includes('allow read: if true;'), false);
});
