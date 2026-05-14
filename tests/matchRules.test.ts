import { describe, expect, it } from 'vitest';

import { getMatchReason, matchesKeyword } from '../src/filters/matchRules';
import type { JobCardInfo } from '../src/types';

describe('matchesKeyword', () => {
  it('matches Korean text case-insensitively', () => {
    expect(matchesKeyword('프론트엔드 개발자', ['프론트'])).toBe(true);
  });

  it('ignores empty keywords', () => {
    expect(matchesKeyword('백엔드 개발자', ['', '  '])).toBe(false);
  });
});

describe('getMatchReason', () => {
  const baseJob: JobCardInfo = {
    id: '123',
    title: 'Platform Engineer',
    company: 'Example Labs',
    href: 'https://www.wanted.co.kr/wd/123',
    element: {} as HTMLElement,
  };

  it('returns title-keyword first', () => {
    expect(
      getMatchReason(baseJob, {
        titleKeywords: ['platform'],
        companyKeywords: ['example'],
      }),
    ).toBe('title-keyword');
  });

  it('returns company-keyword when company matches', () => {
    expect(
      getMatchReason(baseJob, {
        titleKeywords: [],
        companyKeywords: ['example'],
      }),
    ).toBe('company-keyword');
  });
});
