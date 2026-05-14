import { filterRulesItem, parseKeywords, stringifyKeywords } from '../../src/storage/settings';

const titleKeywordsElement = document.querySelector<HTMLTextAreaElement>('#title-keywords');
const companyKeywordsElement = document.querySelector<HTMLTextAreaElement>('#company-keywords');
const saveButton = document.querySelector<HTMLButtonElement>('#save');
const statusElement = document.querySelector<HTMLParagraphElement>('#status');

function setStatus(message: string): void {
  if (!statusElement) return;
  statusElement.textContent = message;
}

async function hydrate(): Promise<void> {
  const rules = await filterRulesItem.getValue();

  if (titleKeywordsElement) {
    titleKeywordsElement.value = stringifyKeywords(rules.titleKeywords);
  }

  if (companyKeywordsElement) {
    companyKeywordsElement.value = stringifyKeywords(rules.companyKeywords);
  }
}

saveButton?.addEventListener('click', () => {
  void filterRulesItem
    .setValue({
      titleKeywords: parseKeywords(titleKeywordsElement?.value ?? ''),
      companyKeywords: parseKeywords(companyKeywordsElement?.value ?? ''),
    })
    .then(() => {
      setStatus('저장되었습니다.');
      window.setTimeout(() => setStatus(''), 1800);
    });
});

void hydrate();
