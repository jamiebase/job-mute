import { storage } from 'wxt/utils/storage';

import type { FilterRules } from '../types';

export const defaultFilterRules: FilterRules = {
  titleKeywords: [],
  companyKeywords: [],
};

export const filterRulesItem = storage.defineItem<FilterRules>('local:filterRules', {
  fallback: defaultFilterRules,
});

export function parseKeywords(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function stringifyKeywords(keywords: string[]): string {
  return keywords.join('\n');
}

function normalizeKeyword(keyword: string): string {
  return keyword.normalize('NFKC').trim().toLocaleLowerCase('ko-KR');
}

export async function addCompanyKeyword(keyword: string): Promise<FilterRules> {
  const nextKeyword = keyword.trim();
  if (!nextKeyword) return filterRulesItem.getValue();

  const rules = await filterRulesItem.getValue();
  const alreadyExists = rules.companyKeywords.some(
    (companyKeyword) => normalizeKeyword(companyKeyword) === normalizeKeyword(nextKeyword),
  );

  if (alreadyExists) return rules;

  const nextRules = {
    ...rules,
    companyKeywords: [...rules.companyKeywords, nextKeyword],
  };

  await filterRulesItem.setValue(nextRules);
  return nextRules;
}
