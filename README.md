# Job Mute

Wanted 공고 목록에서 보고 싶지 않은 공고를 로컬 브라우저 저장소에 기록하고 숨기는 개인용 확장 프로그램입니다.

## 전제 점검

목표가 Wanted 화면의 DOM을 읽고 특정 공고 카드를 숨기는 수준이라면 백엔드, DB, 로그인 서버는 필요하지 않습니다. 이 저장소는 그 전제에 맞춰 WXT, TypeScript, Manifest V3, Vanilla DOM으로 시작합니다.

## 사용 스택

- Runtime: Node.js 24 LTS
- Package manager: pnpm
- Extension framework: WXT
- Language: TypeScript
- Manifest: Manifest V3
- UI: Vanilla HTML/CSS/TS
- Storage: WXT storage wrapper over extension local storage
- Testing: Vitest
- Lint/format: ESLint + Prettier

## 개발

```sh
pnpm install
pnpm dev
```

Chrome에서 개발 빌드를 직접 올릴 때는 `pnpm build` 후 `.output/chrome-mv3` 디렉터리를 `chrome://extensions`의 압축해제된 확장 프로그램으로 로드합니다.

## 기능

- Wanted 공고 링크(`/wd/:id`, `/jobs/:id`)를 기준으로 채용 카드를 탐지합니다.
- 공고 카드에 `숨김` 버튼을 추가합니다.
- 숨긴 공고는 `chrome.storage.local`에 저장하고 목록 재방문 시 다시 숨깁니다.
- 옵션 페이지에서 직무명/회사명 키워드 필터를 저장할 수 있습니다.

## 문서

- [MVP PRD](docs/mvp-prd.md)
- [Next Steps](docs/next-steps.md)

## 근거

- Chrome 확장은 Manifest V3 형식을 사용합니다: https://developer.chrome.com/docs/extensions/mv3/manifest
- DOM 읽기/수정은 content script가 담당합니다: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- WXT는 MV3와 TypeScript 기반 확장 개발을 지원합니다: https://wxt.dev/
- Node.js 24는 LTS 라인입니다: https://nodejs.org/en/about/previous-releases
