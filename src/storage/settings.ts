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
