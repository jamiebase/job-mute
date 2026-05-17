# Job Mute 개인정보 처리 초안(스토어 제출용)

> 제품/스토어 제출 준비용 초안입니다. 법률 자문이나 최종 법률 의무 판단 문서는 아닙니다.

## 1) 저장 항목(What we store)

현재 버전에서 로컬로 저장하는 데이터는 다음 2종입니다.

- 숨긴 공고 목록: `local:blockedJobs`
  - 키: `local:blockedJobs`
  - 항목: `id`, `source(wanted)`, `title`, `company?(선택)`, `href?(선택)`, `reason?`, `blockedAt`
  - 저장 시점: 카드 또는 상세 페이지에서 “숨김” 버튼 클릭 시
- 키워드 필터 규칙: `local:filterRules`
  - 키: `local:filterRules`
  - 항목: `titleKeywords[]`, `companyKeywords[]`
  - 저장 시점: 설정 화면(옵션)에서 “저장” 클릭하거나 “이 회사 숨기기” 액션 사용 시

## 2) 저장 위치(Where it is stored)

- 저장소: `chrome.storage.local` (WXT `storage.defineItem('local:...')` 방식)
- 범위: 현재 브라우저 사용자 프로필의 확장 전용 로컬 저장 영역
- 동기화: 클라우드/서버 동기화 없음(기기에 종속)

## 3) 외부 전송 유무(External transmission)

- 네트워크 전송 없음: 코드에서 `fetch`, `XMLHttpRequest`, 원격 API 호출을 수행하지 않습니다.
- 브라우저 내부 처리:
  - 콘텐츠 스크립트는 `wanted.co.kr` 페이지 DOM을 읽고 UI를 변경
  - 수집한 값은 로컬 저장소로만 쓰고 읽습니다.
- 결과적으로 현재 구현은 원격 분석, 동기화, 백엔드 로그로 데이터가 나가지 않습니다.

## 4) 삭제 방법(How to delete)

- 개별 삭제: 팝업의 숨긴 공고 목록에서 항목별 **해제** 버튼
- 전체 삭제: 팝업의 **전체 해제** 버튼
- 확장 삭제(또는 브라우저 프로필에서 확장 데이터 초기화): 확장 로컬 저장소(로컬 데이터) 삭제 효과
- 완전 초기화 검증 절차(권장):
  - 팝업에서 `전체 해제` 실행
  - 브라우저 확장 관리 화면에서 확장을 재설치하거나 임시로 비활성화 후 재활성화

## 5) 권한 사용 이유(Permission rationale)

- `storage`
  - 이유: 숨김 대상 목록(`blockedJobs`)과 키워드 규칙(`filterRules`)의 영속 저장
- `host_permissions`: `https://wanted.co.kr/*`, `https://www.wanted.co.kr/*`
  - 이유: 콘텐츠 스크립트를 Wanted 페이지에서만 주입/동작시키기 위함
  - 보완 이유: 모든 사이트 접근 권한(`all_urls`)을 사용하지 않음

## 6) Chrome Web Store 제출용 영문 disclosure 문구(요약)

- Short English summary (Store-ready draft):

`Job Mute keeps everything local. It stores only your muted job entries and your job/company keyword filters inside chrome.storage.local for wanted.co.kr, and does not send or sync this data to any remote server.`

## 7) 확인 포인트(Internal cross-check)

- manifest/권한 근거: `wxt.config.ts`
- 저장 키 근거: `src/storage/blockedJobs.ts`, `src/storage/settings.ts`, `src/types/index.ts`
- 외부 전송 점검: `entrypoints/*`, `src/*` 내 네트워크 호출 경로 부재
- 접근 범위 근거: `entrypoints/content.ts`, `src/filters/extractJobCard.ts`
