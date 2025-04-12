import { createId } from '@paralleldrive/cuid2';

export function generateRandomId(): string {
  return createId();
}

export function generatePassword(length = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*(){}|+-';
  const all = chars + numbers + symbols;

  let retVal = '';
  retVal += chars.charAt(Math.floor(Math.random() * chars.length));
  retVal += numbers.charAt(Math.floor(Math.random() * numbers.length));
  retVal += symbols.charAt(Math.floor(Math.random() * symbols.length));

  for (let i = 0; i < length - 3; ++i) {
    retVal += all.charAt(Math.floor(Math.random() * all.length));
  }
  return retVal;
}
