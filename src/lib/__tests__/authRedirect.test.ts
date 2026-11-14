import { describe, expect, it } from 'vitest';
import { getSafeReturnPath } from '../authRedirect';

describe('getSafeReturnPath', () => {
  it('preserves an internal meeting invite path and query through authentication', () => {
    expect(getSafeReturnPath({
      pathname: '/meetings/guest/meeting-id',
      search: '?code=ABCD1234EFGH5678',
      hash: '',
    })).toBe('/meetings/guest/meeting-id?code=ABCD1234EFGH5678');
  });

  it('rejects external or malformed redirect targets', () => {
    expect(getSafeReturnPath('//example.com/phishing')).toBe('/dashboard');
    expect(getSafeReturnPath('https://example.com/phishing')).toBe('/dashboard');
    expect(getSafeReturnPath(null)).toBe('/dashboard');
  });
});
