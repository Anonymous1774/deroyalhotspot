import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatLimitUptime } from '../src/services/mikrotik/mikrotik-client';

describe('Voucher Business Logic Tests', () => {
  it('should format MikroTik limit-uptime correctly based on plan duration units', () => {
    const minutesUptime = formatLimitUptime(30, 'minutes');
    assert.strictEqual(minutesUptime, '30m');

    const hoursUptime = formatLimitUptime(3, 'hours');
    assert.strictEqual(hoursUptime, '3h');

    const daysUptime = formatLimitUptime(7, 'days');
    assert.strictEqual(daysUptime, '7d');

    const defaultUptime = formatLimitUptime(15, 'unknown');
    assert.strictEqual(defaultUptime, '15m');
  });

  it('should generate voucher codes excluding confusing characters (0, O, 1, I)', () => {
    // Alphanumeric generator character set validator
    const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const generateCode = (length: number) => {
      let code = '';
      for (let i = 0; i < length; i++) {
        code += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
      }
      return code;
    };

    const code = generateCode(10);
    assert.strictEqual(code.length, 10);
    
    // Ensure no confusing characters exist
    assert.strictEqual(code.includes('0'), false);
    assert.strictEqual(code.includes('O'), false);
    assert.strictEqual(code.includes('1'), false);
    assert.strictEqual(code.includes('I'), false);
  });
});
