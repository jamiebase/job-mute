import type { JobCardInfo } from '../types';

const JOB_LINK_PATTERN = /\/(?:wd|jobs)\/(\d+)/;
const WANTED_HOSTS = new Set(['wanted.co.kr', 'www.wanted.co.kr']);
const CARD_SELECTOR = [
  'li',
  'article',
  '[data-testid*="job" i]',
  '[data-cy*="job" i]',
  '[class*="Job" i]',
  '[class*="Card" i]',
].join(',');
const TITLE_SELECTOR = [
  'h1',
  'h2',
  'h3',
  '[data-testid*="title" i]',
  '[class*="title" i]',
  '[class*="position" i]',
].join(',');
const COMPANY_SELECTOR = [
  '[data-testid*="company" i]',
  '[class*="company" i]',
  '[class*="Company" i]',
].join(',');

function toAbsoluteUrl(href: string, baseOrigin?: string): URL | undefined {
  try {
    return baseOrigin ? new URL(href, baseOrigin) : new URL(href);
  } catch {
    return undefined;
  }
}

export function getWantedJobId(
  href: string,
  currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined,
): string | undefined {
  const url = toAbsoluteUrl(href, currentOrigin);
  if (!url) return undefined;
  if (!WANTED_HOSTS.has(url.hostname)) return undefined;

  const match = url.pathname.match(JOB_LINK_PATTERN);
  return match?.[1];
}

function getText(element: Element | null): string | undefined {
  const text = element?.textContent?.replace(/\s+/g, ' ').trim();
  return text || undefined;
}

function getFallbackTitle(anchor: HTMLAnchorElement): string {
  return (
    anchor.getAttribute('aria-label')?.trim() ||
    getText(anchor)?.split(' ').slice(0, 12).join(' ') ||
    'Untitled job'
  );
}

export function extractJobCard(anchor: HTMLAnchorElement): JobCardInfo | undefined {
  const id = getWantedJobId(anchor.href);
  if (!id) return undefined;

  const element = anchor.closest<HTMLElement>(CARD_SELECTOR) ?? anchor;
  const title = getText(element.querySelector(TITLE_SELECTOR)) ?? getFallbackTitle(anchor);
  const company = getText(element.querySelector(COMPANY_SELECTOR));

  return {
    id,
    title,
    href: anchor.href,
    element,
    ...(company ? { company } : {}),
  };
}

export function findJobCards(root: ParentNode = document): JobCardInfo[] {
  const anchors = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href]'));
  const jobsByElement = new Map<HTMLElement, JobCardInfo>();

  for (const anchor of anchors) {
    const job = extractJobCard(anchor);
    if (job) jobsByElement.set(job.element, job);
  }

  return Array.from(jobsByElement.values());
}
