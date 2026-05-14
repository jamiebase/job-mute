export type JobSource = 'wanted';

export interface JobCardInfo {
  id: string;
  title: string;
  company?: string;
  href?: string;
  element: HTMLElement;
}

export interface BlockedJob {
  id: string;
  source: JobSource;
  title: string;
  company?: string;
  href?: string;
  reason?: string;
  blockedAt: string;
}

export interface FilterRules {
  titleKeywords: string[];
  companyKeywords: string[];
}
