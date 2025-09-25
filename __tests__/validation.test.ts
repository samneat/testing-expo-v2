import { isValidEmail, validatePasswordStrength } from '../src/utils/validation';

describe('validation utils', () => {
  test('isValidEmail', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('bad')).toBe(false);
    expect(isValidEmail('a@b')).toBe(false);
  });

  test('validatePasswordStrength', () => {
    // Minimum: 8 chars, upper, lower, number, special
    expect(validatePasswordStrength('Aa1!aaaa')).toBe(true);
    expect(validatePasswordStrength('weak')).toBe(false);
    expect(validatePasswordStrength('NoNumber!')).toBe(false);
    expect(validatePasswordStrength('nonumberorspecial')).toBe(false);
  });
});
