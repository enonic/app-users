// What a browser's `type="email"` accepts: something, an @, a host with a dot. Not RFC 5322 — the
// platform's `EmailValidator` has the last word.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmailAddress(value: string): boolean {
  return EMAIL.test(value);
}
