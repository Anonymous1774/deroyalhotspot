import { describe, it } from 'node:test';
import assert from 'node:assert';
import { encrypt, decrypt } from '../src/utils/crypto';
import { getRouterHealth } from '../src/services/mikrotik/mikrotik-client';

describe('Router & Security Tests', () => {
  it('should encrypt and decrypt router password symmetrically', () => {
    const originalPassword = 'MySecretRouterPassword123!';
    const encrypted = encrypt(originalPassword);
    
    assert.ok(encrypted);
    assert.notStrictEqual(encrypted, originalPassword);

    const decrypted = decrypt(encrypted);
    assert.strictEqual(decrypted, originalPassword);
  });

  it('should generate simulated router telemetry under simulation mode', async () => {
    process.env.MIKROTIK_SIMULATION_MODE = 'true';
    const health = await getRouterHealth();

    assert.strictEqual(health.status, 'SIMULATED');
    assert.strictEqual(health.identity, 'DeRoyal hAP ax3 (Simulated)');
    assert.ok(health.cpuUsage >= 0 && health.cpuUsage <= 100);
    assert.strictEqual(health.hotspotStatus, 'active');
  });
});
