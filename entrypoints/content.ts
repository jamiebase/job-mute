import { findJobCards, getWantedJobId } from '../src/filters/extractJobCard';
import { getMatchReason } from '../src/filters/matchRules';
import { blockJob, blockedJobsItem, isBlockedJob } from '../src/storage/blockedJobs';
import { addCompanyKeyword, defaultFilterRules, filterRulesItem } from '../src/storage/settings';
import type { BlockedJob, FilterRules, JobCardInfo } from '../src/types';
import {
  ensureCompanyMuteButton,
  ensureContentStyle,
  ensureMuteButton,
  hideJobCard,
  removeDetailJobControls,
  renderDetailJobControls,
  showJobCard,
} from '../src/ui/contentControls';

const TITLE_SELECTORS = [
  'main h1',
  'h1',
  '[data-testid*="title" i]',
  '[class*="position" i]',
  '[class*="title" i]',
].join(',');
const COMPANY_SELECTORS = [
  '[data-testid*="company" i]',
  'a[href*="/company/"]',
  '[class*="company" i]',
  '[class*="Company" i]',
].join(',');
const CONTENT_CONTROL_SELECTOR = '[data-job-mute-root="true"]';

function getText(element: Element | null): string | undefined {
  if (!element || element.closest(CONTENT_CONTROL_SELECTOR)) return undefined;

  const text = element.textContent?.replace(/\s+/g, ' ').trim();
  return text || undefined;
}

function getTextFromSelectors(selectors: string, maxLength: number): string | undefined {
  for (const element of document.querySelectorAll(selectors)) {
    const text = getText(element);
    if (text && text.length <= maxLength) return text;
  }

  return undefined;
}

function getDetailJob(): JobCardInfo | undefined {
  const id = getWantedJobId(location.href);
  if (!id) return undefined;

  const title =
    getTextFromSelectors(TITLE_SELECTORS, 140) ||
    document.title.replace(/\s*\|?\s*원티드.*$/i, '').trim() ||
    'Untitled job';
  const company = getTextFromSelectors(COMPANY_SELECTORS, 80);

  return {
    id,
    title,
    href: location.href,
    element: document.body,
    ...(company ? { company } : {}),
  };
}

export default defineContentScript({
  matches: ['https://wanted.co.kr/*', 'https://www.wanted.co.kr/*'],
  runAt: 'document_idle',
  main() {
    ensureContentStyle();

    let blockedJobs: BlockedJob[] = [];
    let filterRules: FilterRules = defaultFilterRules;
    const visibleDetailJobIds = new Set<string>();
    let applyTimer: number | undefined;
    let currentHref = location.href;

    const scheduleApply = () => {
      window.clearTimeout(applyTimer);
      applyTimer = window.setTimeout(() => {
        void applyJobMute();
      }, 120);
    };

    const getHiddenReason = (job: JobCardInfo): string | undefined => {
      if (isBlockedJob(blockedJobs, job)) return 'manual';
      return getMatchReason(job, filterRules);
    };

    const addCompanyRule = async (company: string) => {
      filterRules = await addCompanyKeyword(company);
      scheduleApply();
    };

    const applyDetailControls = () => {
      const detailJob = getDetailJob();
      if (!detailJob) {
        removeDetailJobControls();
        return;
      }

      const hiddenReason = getHiddenReason(detailJob);
      const company = detailJob.company;
      renderDetailJobControls({
        job: detailJob,
        hiddenReason,
        isVisibleThisSession: visibleDetailJobIds.has(detailJob.id),
        onHideJob: () => {
          void blockJob(detailJob).then((nextBlockedJobs) => {
            blockedJobs = nextBlockedJobs;
            scheduleApply();
          });
        },
        ...(company
          ? {
              onHideCompany: () => {
                void addCompanyRule(company);
              },
            }
          : {}),
        onViewOnce: () => {
          visibleDetailJobIds.add(detailJob.id);
          scheduleApply();
        },
      });
    };

    const applyJobMute = async () => {
      const jobs = findJobCards();

      for (const job of jobs) {
        const matchReason = getMatchReason(job, filterRules);

        if (isBlockedJob(blockedJobs, job) || matchReason) {
          hideJobCard(job);
          continue;
        }

        showJobCard(job);
        ensureMuteButton(job, () => {
          void blockJob(job).then((nextBlockedJobs) => {
            blockedJobs = nextBlockedJobs;
            hideJobCard(job);
          });
        });
        ensureCompanyMuteButton(job, () => {
          if (job.company) void addCompanyRule(job.company);
        });
      }

      applyDetailControls();
    };

    const hydrate = async () => {
      blockedJobs = await blockedJobsItem.getValue();
      filterRules = await filterRulesItem.getValue();
      await applyJobMute();
    };

    blockedJobsItem.watch((nextBlockedJobs) => {
      blockedJobs = nextBlockedJobs;
      scheduleApply();
    });

    filterRulesItem.watch((nextFilterRules) => {
      filterRules = nextFilterRules;
      scheduleApply();
    });

    const handleLocationChange = () => {
      if (currentHref === location.href) return;
      currentHref = location.href;
      scheduleApply();
    };

    const wrapHistoryMethod = (method: 'pushState' | 'replaceState') => {
      const original = history[method];
      const wrapped = function updateHistoryState(
        this: History,
        data: unknown,
        unused: string,
        url?: string | URL | null,
      ) {
        const result = original.call(this, data, unused, url);
        handleLocationChange();
        return result;
      };
      history[method] = wrapped as History[typeof method];
    };

    wrapHistoryMethod('pushState');
    wrapHistoryMethod('replaceState');
    window.addEventListener('popstate', handleLocationChange);

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    void hydrate();
  },
});
