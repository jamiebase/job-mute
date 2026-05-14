import { clearBlockedJobs, listBlockedJobs, unblockJob } from '../../src/storage/blockedJobs';
import type { BlockedJob } from '../../src/types';

const listElement = document.querySelector<HTMLUListElement>('#blocked-jobs');
const emptyElement = document.querySelector<HTMLElement>('#empty');
const clearButton = document.querySelector<HTMLButtonElement>('#clear');

function formatBlockedAt(value: string): string {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function createJobItem(job: BlockedJob): HTMLLIElement {
  const item = document.createElement('li');
  const body = document.createElement('div');
  const title = document.createElement(job.href ? 'a' : 'strong');
  const meta = document.createElement('span');
  const removeButton = document.createElement('button');

  title.textContent = job.title;
  if (title instanceof HTMLAnchorElement && job.href) {
    title.href = job.href;
    title.target = '_blank';
    title.rel = 'noreferrer';
  }

  meta.textContent = [job.company, formatBlockedAt(job.blockedAt)].filter(Boolean).join(' · ');

  removeButton.type = 'button';
  removeButton.textContent = '해제';
  removeButton.addEventListener('click', () => {
    void unblockJob(job.id).then(render);
  });

  body.append(title, meta);
  item.append(body, removeButton);
  return item;
}

async function render(): Promise<void> {
  if (!listElement || !emptyElement || !clearButton) return;

  const blockedJobs = await listBlockedJobs();
  listElement.replaceChildren(...blockedJobs.map(createJobItem));
  emptyElement.hidden = blockedJobs.length > 0;
  clearButton.disabled = blockedJobs.length === 0;
}

clearButton?.addEventListener('click', () => {
  void clearBlockedJobs().then(render);
});

void render();
