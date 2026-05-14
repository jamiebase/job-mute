# Job Mute Next Steps

## 전제 점검

PRD의 핵심 전제인 “Wanted 전용 로컬 확장으로 MVP를 검증한다”는 현재 코드 기준 대체로 맞다. 목록 공고 숨김, 로컬 저장, 키워드 필터, 팝업 해제 흐름은 이미 구현되어 있다.

다만 “목록과 상세 페이지 모두에서 충분히 동작한다”는 전제는 아직 검증되지 않았다. 상세 페이지 전용 UI와 현재 공고 식별 로직이 없고, 실제 Wanted 렌더링 DOM 검증도 완료되지 않았다.

## 다양한 관점이 필요한 이유

다음 작업은 제품 완성도, 실제 사이트 호환성, 보안/개인정보 리스크가 동시에 얽혀 있다. 구현만 보면 상세 페이지와 회사 숨김 액션이 먼저 보이지만, 보안 관점에서는 hostname 검증과 저장 데이터 disclosure가 더 작고 중요한 리스크일 수 있다. 실제 사이트 관점에서는 DOM 구조가 맞지 않으면 구현된 기능도 무력화된다.

| 후보                        | 설명                                               | 우선 확률 |
| --------------------------- | -------------------------------------------------- | --------: |
| 실제 Wanted DOM/식별자 검증 | 링크 패턴, 카드 selector, 상세 페이지 구조 확인    |       35% |
| 상세 페이지 지원            | 상세 페이지 배너, 현재 공고 숨김, 이번만 보기      |       25% |
| 회사 숨김 액션              | 카드/상세에서 `이 회사 숨기기` 제공                |       18% |
| 보안/개인정보 정리          | hostname 제한, 저장 데이터 최소화, disclosure 초안 |       15% |
| 성능 계측                   | MutationObserver 범위 축소, 100개 카드 기준 측정   |        7% |

## 호출한 에이전트 결과 요약

### 구현 매핑

현재 구현된 항목:

- 목록 공고 카드 탐지와 숨김 버튼
- 숨긴 공고의 로컬 저장과 재방문 시 숨김
- 제목/회사 키워드 필터
- 팝업에서 숨김 해제와 전체 초기화
- `MutationObserver` 기반 동적 DOM 대응

미구현 또는 불확실한 항목:

- 상세 페이지 전용 배너/액션
- `이 회사 숨기기` 명시 액션
- 현재 페이지가 Wanted가 아닐 때의 안내
- 실제 Wanted DOM에서 `/wd/:id`, `/jobs/:id` 링크 패턴이 충분한지 검증
- 300ms 성능 목표의 계측

### 보안/개인정보 검토

긍정적 항목:

- `<all_urls>` 권한 없음
- 외부 전송 코드 없음
- DOM 삽입은 `textContent`, `createElement` 중심이라 저장 데이터 기반 HTML 실행 리스크가 낮음

개선 필요 항목:

- `getWantedJobId`에서 hostname을 `wanted.co.kr` 또는 `www.wanted.co.kr`로 제한한다.
- `storage.local`에 저장되는 공고 제목, 회사명, URL, 키워드는 사용자의 구직 관심사이므로 개인정보/스토어 disclosure에 명시한다.
- `host_permissions`가 정적 content script만으로 충분한지 빌드 manifest에서 검증한다.
- popup 외부 링크에는 `noreferrer`에 더해 `noopener`를 명시한다.

### 브라우저 DOM 검증

브라우저 검증 에이전트는 제한 시간 안에 완료하지 못해 종료했다. 웹으로 확인한 정적 HTML에는 공고 링크가 충분히 노출되지 않았으므로, 실제 렌더링된 브라우저에서 별도 검증이 필요하다.

## 권장 작업 순서

1. `extractJobCard` hostname 검증 추가
   - 관련 파일: `src/filters/extractJobCard.ts`
   - 이유: 작은 수정으로 외부 링크 오탐과 popup 신뢰 리스크를 줄인다.

2. 실제 Wanted DOM 검증
   - 관련 파일: `src/filters/extractJobCard.ts`, `entrypoints/content.ts`
   - 확인할 것: 목록 링크 패턴, 카드 root selector, 회사명 selector, 상세 페이지 제목/회사 추출 가능성.

3. 상세 페이지 지원
   - 관련 파일: `entrypoints/content.ts`, `src/ui/contentControls.ts`, `src/filters/extractJobCard.ts`
   - 구현할 것: 현재 공고 식별, 숨김 대상 안내 배너, 현재 공고 숨김, 이번만 보기.

4. 회사 숨김 명시 액션
   - 관련 파일: `src/ui/contentControls.ts`, `entrypoints/content.ts`, `src/storage/settings.ts`
   - 구현할 것: 카드/상세에서 회사명 키워드를 바로 추가하는 액션.

5. 개인정보/스토어 문서 초안
   - 관련 파일 후보: `docs/privacy.md`
   - 포함할 것: 저장 항목, 저장 위치, 외부 미전송, 삭제 방법, 권한 사용 이유.

6. 성능 계측과 observer 범위 축소
   - 관련 파일: `entrypoints/content.ts`
   - 기준: 목록 100개 카드 기준 300ms 이내, 스크롤 중 체감 지연 없음.

## 바로 맡기기 좋은 다음 에이전트

- `frontend-developer`: 상세 페이지 배너와 회사 숨김 액션 구현
- `security-auditor`: hostname 제한과 privacy/disclosure 초안 재검토
- `browser-debugger`: 실제 Wanted 렌더링 DOM/무한 스크롤 검증 재시도
- `test-automator`: 공고 ID 추출, hostname 제한, 키워드 매칭 회귀 테스트 추가
