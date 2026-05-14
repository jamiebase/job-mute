import { storage } from 'wxt/utils/storage';

import type { BlockedJob, JobCardInfo } from '../types';

export const blockedJobsItem = storage.defineItem<BlockedJob[]>('local:blockedJobs', {
  fallback: [],
});

export async function listBlockedJobs(): Promise<BlockedJob[]> {
  return blockedJobsItem.getValue();
}

export async function blockJob(job: JobCardInfo, reason = 'manual'): Promise<BlockedJob[]> {
  const blockedJobs = await blockedJobsItem.getValue();
  const nextJob: BlockedJob = {
    id: job.id,
    source: 'wanted',
    title: job.title,
    reason,
    blockedAt: new Date().toISOString(),
    ...(job.company ? { company: job.company } : {}),
    ...(job.href ? { href: job.href } : {}),
  };

  const next = [nextJob, ...blockedJobs.filter((blockedJob) => blockedJob.id !== job.id)];
  await blockedJobsItem.setValue(next);
  return next;
}

export async function unblockJob(id: string): Promise<BlockedJob[]> {
  const blockedJobs = await blockedJobsItem.getValue();
  const next = blockedJobs.filter((job) => job.id !== id);
  await blockedJobsItem.setValue(next);
  return next;
}

export async function clearBlockedJobs(): Promise<void> {
  await blockedJobsItem.setValue([]);
}

export function isBlockedJob(blockedJobs: BlockedJob[], job: Pick<JobCardInfo, 'id'>): boolean {
  return blockedJobs.some((blockedJob) => blockedJob.id === job.id);
}
