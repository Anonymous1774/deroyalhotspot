import * as argon2 from 'argon2';

/**
 * Hashes a plain text password using Argon2id.
 * @param password Plain text password
 * @returns Promise resolving to the hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

/**
 * Compares a plain text password with a hash.
 * @param password Plain text password
 * @param hash Hashed password
 * @returns Promise resolving to boolean (true if match, false otherwise)
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
