import { describe, expect, it } from 'vitest';

import { getWantedJobId } from '../src/filters/extractJobCard';

describe('getWantedJobId', () => {
  it('accepts only wanted hosts for absolute urls', () => {
    expect(getWantedJobId('https://wanted.co.kr/wd/123')).toBe('123');
    expect(getWantedJobId('https://www.wanted.co.kr/jobs/456')).toBe('456');
    expect(getWantedJobId('https://google.com/wd/789')).toBeUndefined();
    expect(getWantedJobId('https://jobs.wanted.co.kr/wd/789')).toBeUndefined();
  });

  it('allows relative job links only when current origin is Wanted', () => {
    expect(getWantedJobId('/wd/123', 'https://www.wanted.co.kr')).toBe('123');
    expect(getWantedJobId('/jobs/456', 'https://wanted.co.kr')).toBe('456');
    expect(getWantedJobId('/wd/789', 'https://example.com')).toBeUndefined();
    expect(getWantedJobId('/jobs/101', 'https://example.com')).toBeUndefined();
  });
});
