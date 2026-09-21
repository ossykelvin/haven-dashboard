export type PasswordPolicy = {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSymbol: boolean
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true
}

export function passwordPolicyError(password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY) {
  if (password.length < policy.minLength) return `Use at least ${policy.minLength} characters`
  if (policy.requireUppercase && !/[A-Z]/.test(password)) return 'Add an uppercase letter'
  if (policy.requireLowercase && !/[a-z]/.test(password)) return 'Add a lowercase letter'
  if (policy.requireNumber && !/\d/.test(password)) return 'Add a number'
  if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) return 'Add a symbol'
  return null
}
