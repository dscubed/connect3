/**
 * Validates password against requirements: min 6 chars,
 * lowercase, uppercase, digits and symbols.
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  const MIN_LENGTH = 6;

  if (password.length < MIN_LENGTH) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: "Password should contain lowercase, uppercase letters, digits and symbols" };
  }

  return { valid: true };
}
