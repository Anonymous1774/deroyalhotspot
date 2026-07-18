import { describe, it } from 'node:test';
import assert from 'node:assert';
import { hashPassword, comparePassword } from '../src/utils/hash';
import { signToken, verifyToken } from '../src/utils/jwt';

describe('Authentication & Token Tests', () => {
  it('should hash a password and verify it successfully', async () => {
    const rawPassword = 'SecureAdminPassword2026!';
    const hash = await hashPassword(rawPassword);

    assert.ok(hash);
    assert.ok(hash.startsWith('$argon2id$'));

    const isMatch = await comparePassword(rawPassword, hash);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await comparePassword('WrongPassword!', hash);
    assert.strictEqual(isWrongMatch, false);
  });

  it('should generate and verify JWT administrative tokens', () => {
    const payload = { id: 'admin-uuid', email: 'test@deroyal.name.ng', role: 'ADMIN' };
    const token = signToken(payload);

    assert.ok(token);
    
    const decoded = verifyToken(token);
    assert.ok(decoded);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, payload.role);
  });
});
