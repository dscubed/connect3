/**
 * Validates password against requirements: min 6 chars,
 * lowercase, uppercase, digits and symbols.
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  const MIN_LENGTH = 6;

  if (password.length < MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${MIN_LENGTH} characters` };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must include a lowercase letter" };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must include an uppercase letter" };
  }

  if (!/\d/.test(password)) {
    return { valid: false, error: "Password must include a digit" };
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: "Password must include a symbol" };
  }

  return { valid: true };
}
