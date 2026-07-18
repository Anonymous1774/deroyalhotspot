import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Ensure we have a secure encryption key from environment, fallback to a default for safety
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dhos_secret_secure_key_32_bytes_!'.padEnd(32, '0').substring(0, 32);
const IV_LENGTH = 16;

/**
 * Encrypts cleartext symmetrically.
 * Returns text formatted as iv:ciphertext in hex encoding.
 */
export function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts symmetrically encrypted text back to cleartext.
 */
export function decrypt(text: string): string {
  if (!text) return '';
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return '';
    const iv = Buffer.from(textParts.shift() || '', 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}
