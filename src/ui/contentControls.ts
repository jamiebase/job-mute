import type { JobCardInfo } from '../types';

const STYLE_ID = 'job-mute-style';
const BUTTON_CLASS = 'job-mute-button';
const CARD_ACTIONS_CLASS = 'job-mute-card-actions';
const MUTE_BUTTON_CLASS = 'job-mute-card-mute-button';
const COMPANY_BUTTON_CLASS = 'job-mute-firm-mute-button';
const HIDDEN_CLASS = 'job-mute-hidden';
const DETAIL_PANEL_ID = 'job-mute-detail-panel';
const ROOT_DATA_ATTRIBUTE = 'data-job-mute-root';

export interface DetailJobControlsOptions {
  job: JobCardInfo;
  hiddenReason: string | undefined;
  isVisibleThisSession: boolean;
  onHideJob: () => void;
  onHideCompany?: () => void;
  onViewOnce: () => void;
}

export function ensureContentStyle(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${HIDDEN_CLASS} {
      display: none !important;
    }

    .${BUTTON_CLASS} {
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

    .${BUTTON_CLASS}:focus-visible {
      outline: 2px solid #2563eb;
      outline-offset: 2px;
    }

    .${CARD_ACTIONS_CLASS} {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 2147483647;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 6px;
      max-width: calc(100% - 16px);
    }

    #${DETAIL_PANEL_ID} {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      box-sizing: border-box;
      width: min(360px, calc(100vw - 32px));
      border: 1px solid rgba(17, 24, 39, 0.14);
      border-radius: 8px;
      background: #ffffff;
      color: #111827;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 12px;
    }

    #${DETAIL_PANEL_ID}[data-hidden="true"] {
      border-color: rgba(217, 119, 6, 0.38);
      background: #fffbeb;
    }

    #${DETAIL_PANEL_ID} .job-mute-detail-title {
      margin: 0;
      color: #111827;
      font-size: 14px;
      font-weight: 700;
      line-height: 1.35;
    }

    #${DETAIL_PANEL_ID} .job-mute-detail-meta {
      margin: 4px 0 0;
      color: #4b5563;
      font-size: 12px;
      line-height: 1.35;
    }

    #${DETAIL_PANEL_ID} .job-mute-detail-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    #${DETAIL_PANEL_ID} .${BUTTON_CLASS} {
      background: #ffffff;
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

function getCardActionsElement(job: JobCardInfo): HTMLElement {
  const currentActions = job.element.querySelector<HTMLElement>(`.${CARD_ACTIONS_CLASS}`);
  if (currentActions) return currentActions;

  if (getComputedStyle(job.element).position === 'static') {
    job.element.style.position = 'relative';
  }

  const actions = document.createElement('div');
  actions.className = CARD_ACTIONS_CLASS;
  actions.setAttribute(ROOT_DATA_ATTRIBUTE, 'true');
  job.element.append(actions);
  return actions;
}

export function ensureMuteButton(job: JobCardInfo, onClick: () => void): void {
  const actions = getCardActionsElement(job);
  if (actions.querySelector(`.${MUTE_BUTTON_CLASS}`)) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BUTTON_CLASS} ${MUTE_BUTTON_CLASS}`;
  button.textContent = '숨김';
  button.title = '이 공고 숨기기';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  actions.append(button);
}

export function ensureCompanyMuteButton(job: JobCardInfo, onClick: () => void): void {
  if (!job.company) return;

  const actions = getCardActionsElement(job);
  if (actions.querySelector(`.${COMPANY_BUTTON_CLASS}`)) return;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BUTTON_CLASS} ${COMPANY_BUTTON_CLASS}`;
  button.textContent = '회사 숨김';
  button.title = '이 회사 숨기기';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });

  actions.append(button);
}

function getReasonLabel(reason: string | undefined): string {
  if (reason === 'company-keyword') return '회사 키워드 규칙';
  if (reason === 'title-keyword') return '직무명 키워드 규칙';
  if (reason) return '숨긴 공고';
  return '숨김 규칙 없음';
}

function appendDetailButton(
  actions: HTMLElement,
  label: string,
  title: string,
  onClick: () => void,
): void {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = BUTTON_CLASS;
  button.textContent = label;
  button.title = title;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  actions.append(button);
}

export function renderDetailJobControls(options: DetailJobControlsOptions): void {
  const { job, hiddenReason, isVisibleThisSession, onHideJob, onHideCompany, onViewOnce } = options;
  const shouldShowHiddenBanner = Boolean(hiddenReason) && !isVisibleThisSession;
  const renderKey = [
    job.id,
    job.title,
    job.company ?? '',
    hiddenReason ?? '',
    isVisibleThisSession ? 'visible-once' : 'normal',
  ].join('|');

  const currentPanel = document.getElementById(DETAIL_PANEL_ID);
  if (currentPanel?.dataset.renderKey === renderKey) return;

  const panel = document.createElement('aside');
  panel.id = DETAIL_PANEL_ID;
  panel.dataset.renderKey = renderKey;
  panel.dataset.hidden = shouldShowHiddenBanner ? 'true' : 'false';
  panel.setAttribute(ROOT_DATA_ATTRIBUTE, 'true');
  panel.setAttribute('aria-label', 'Job Mute 상세 페이지 제어');

  const title = document.createElement('p');
  title.className = 'job-mute-detail-title';
  title.textContent = shouldShowHiddenBanner ? '숨김 대상 공고입니다' : '현재 공고';
  panel.append(title);

  const meta = document.createElement('p');
  meta.className = 'job-mute-detail-meta';
  meta.textContent = [job.company, getReasonLabel(hiddenReason)].filter(Boolean).join(' · ');
  panel.append(meta);

  const actions = document.createElement('div');
  actions.className = 'job-mute-detail-actions';
  panel.append(actions);

  appendDetailButton(actions, '이 공고 숨기기', '현재 공고 숨기기', onHideJob);

  if (onHideCompany) {
    appendDetailButton(actions, '이 회사 숨기기', '회사 키워드 규칙에 추가', onHideCompany);
  }

  if (shouldShowHiddenBanner) {
    appendDetailButton(actions, '이번만 보기', '이번 세션에서 현재 공고 보기', onViewOnce);
  }

  currentPanel?.replaceWith(panel);
  if (!currentPanel) (document.body ?? document.documentElement).append(panel);
}

export function removeDetailJobControls(): void {
  document.getElementById(DETAIL_PANEL_ID)?.remove();
}
