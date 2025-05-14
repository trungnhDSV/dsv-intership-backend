import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export async function generateHashPassword(password: string) {
  // generate salt
  const salt = randomBytes(8).toString('hex');
  // hash password with salt together
  const hash = (await scrypt(password, salt, 32)) as Buffer;

  // combine salt and hash
  return salt + '.' + hash.toString('hex');
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  const [salt, storedHash] = hashedPassword.split('.');
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  return storedHash === hash.toString('hex');
}
