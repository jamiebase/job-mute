import type { JobCardInfo } from '../types';

const STYLE_ID = 'job-mute-style';
const BUTTON_CLASS = 'job-mute-button';
const HIDDEN_CLASS = 'job-mute-hidden';

export function ensureContentStyle(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${HIDDEN_CLASS} {
      display: none !important;
    }

    .${BUTTON_CLASS} {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2147483647;
      border: 1px solid rgba(17, 24, 39, 0.16);
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.96);
      color: #111827;
      cursor: pointer;
      font: 600 12px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 6px 8px;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
    }

    .${BUTTON_CLASS}:hover {
      background: #f3f4f6;
    }
  `;
  document.documentElement.append(style);
}

export function hideJobCard(job: JobCardInfo): void {
  job.element.classList.add(HIDDEN_CLASS);
}

export function showJobCard(job: JobCardInfo): void {
  job.element.classList.remove(HIDDEN_CLASS);
}

export function ensureMuteButton(job: JobCardInfo, onClick: () => void): void {
  if (job.element.querySelector(`.${BUTTON_CLASS}`)) return;

  if (getComputedStyle(job.element).position === 'static') {
    job.element.style.position = 'relative';
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = BUTTON_CLASS;
  button.textContent = '숨김';
  button.title = '이 공고 숨기기';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  job.element.append(button);
}
