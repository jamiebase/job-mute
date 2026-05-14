import type { FilterRules, JobCardInfo } from '../types';

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('ko-KR');
}

export function matchesKeyword(value: string | undefined, keywords: string[]): boolean {
  if (!value) return false;

  const normalizedValue = normalize(value);
  return keywords.some((keyword) => {
    const normalizedKeyword = normalize(keyword);
    return normalizedKeyword.length > 0 && normalizedValue.includes(normalizedKeyword);
  });
}

export function getMatchReason(job: JobCardInfo, rules: FilterRules): string | undefined {
  if (matchesKeyword(job.title, rules.titleKeywords)) return 'title-keyword';
  if (matchesKeyword(job.company, rules.companyKeywords)) return 'company-keyword';
  return undefined;
}
