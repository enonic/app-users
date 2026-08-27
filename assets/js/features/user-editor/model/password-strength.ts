import { passwordStrength as assess } from 'check-password-strength';

export type PasswordStrengthLevel = 'tooWeak' | 'weak' | 'medium' | 'strong';

export type PasswordStrength = {
  level: PasswordStrengthLevel;
  score: 0 | 1 | 2 | 3 | 4;
  labelKey: string;
};

// ! Indexed by the library's `id`, not by its `value`: the id is the stable half of a level, while the
// ! value is the display string of `defaultOptions` and would silently read every password as the
// ! weakest if that wording ever changed.
const LEVELS: readonly PasswordStrengthLevel[] = ['tooWeak', 'weak', 'medium', 'strong'];

const SCORES: Record<PasswordStrengthLevel, 1 | 2 | 3 | 4> = {
  tooWeak: 1,
  weak: 2,
  medium: 3,
  strong: 4,
};

export function passwordStrength(value: string): PasswordStrength {
  if (value.length === 0) {
    return { level: 'tooWeak', score: 0, labelKey: 'users.dialog.strength.tooWeak' };
  }

  const level = LEVELS[assess(value).id] ?? 'tooWeak';

  return { level, score: SCORES[level], labelKey: `users.dialog.strength.${level}` };
}

export function isPasswordAccepted(strength: PasswordStrength): boolean {
  return strength.level === 'medium' || strength.level === 'strong';
}

const ALPHABET =
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&()*+,-.<=>?@[]^_{|}~';

const GENERATED_LENGTH = 15;

export function generatePassword(): string {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const bytes = crypto.getRandomValues(new Uint8Array(GENERATED_LENGTH));
    const candidate = Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join('');

    if (isPasswordAccepted(passwordStrength(candidate))) {
      return candidate;
    }
  }

  return '';
}
