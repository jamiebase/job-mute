import { findJobCards } from '../src/filters/extractJobCard';
import { getMatchReason } from '../src/filters/matchRules';
import { blockJob, blockedJobsItem, isBlockedJob } from '../src/storage/blockedJobs';
import { defaultFilterRules, filterRulesItem } from '../src/storage/settings';
import type { BlockedJob, FilterRules } from '../src/types';
import { ensureContentStyle, ensureMuteButton, hideJobCard, showJobCard } from '../src/ui/contentControls';

export default defineContentScript({
  matches: ['https://wanted.co.kr/*', 'https://www.wanted.co.kr/*'],
  runAt: 'document_idle',
  main() {
    ensureContentStyle();

    let blockedJobs: BlockedJob[] = [];
    let filterRules: FilterRules = defaultFilterRules;
    let applyTimer: number | undefined;

    const scheduleApply = () => {
      window.clearTimeout(applyTimer);
      applyTimer = window.setTimeout(() => {
        void applyJobMute();
      }, 120);
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
      }
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

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    void hydrate();
  },
});
