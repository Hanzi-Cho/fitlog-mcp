# Fitlog MCP — 구체화 명세 v1.1

2026-10-10 · 사용자 승인 완료 / MVP 본 구현 및 인수 중 (최신 체크포인트는 아래 참조)

사용자 확정: “추천안으로 확정하고 MVP 진행”. v0.2의 추천 스택·최소 범위·집계 규칙·검증 기준을 승인했다. G0 실제 호스트 통과 전까지 프로젝트 상태는 구체화에 유지한다.

## 근거와 결정

원안: [P-HAN-1](<https://linear.app/hanzicho/project/ai-%ED%97%AC%EC%8A%A4-%EC%8B%9D%EB%8B%A8-%EC%9E%90%EA%B8%B0%EA%B4%80%EB%A6%AC-%ED%94%8C%EB%9F%AC%EA%B7%B8%EC%9D%B8-f38af4bd8e45>).
저장소: [Hanzi-Cho/fitlog-mcp](<https://github.com/Hanzi-Cho/fitlog-mcp>), 공개·현재 빈 저장소. 사용자 요청에 따라 MVP 완료·검증 후 커밋·푸시한다. 코드 저장 승인이 서비스 배포나 실제 개인 데이터 업로드 승인은 아니다.
구현 예정 위치: C:/Users/whwog/Documents/ChatGPT/developer\_/fitlog-mcp. 상위는 기존 GNSS 프로젝트이므로 별도 Git 저장소로 관리.
사용자 답변으로 확정:

* Codex 우선. Claude 지원은 후속.
* 본인 1인용, 이 PC에 로컬 보관.
* 운동·식단 기록 우선. 사진 월렛·일정은 후속.
* Codex 채팅 옆/안의 임베디드 UI 필수. 외부 브라우저 대시보드만으로 완료 불가.

원래 운영 규칙은 “Linear 워크플로 스킬 작성” 채팅(01a11493-0afe-75ff-8738-241884f1d010)에 남은 linear-project-lifecycle/SKILL.md, references/contract.md 및 clarify.md에서 확인했다. 본 문서는 그 기준의 요구·범위·기능별 상태·설계 대안·데이터 정책·파일 구조·화면/토큰·MVP/최종 순서·수용 검증을 구체화한다. 스택·규칙은 2026-10-10 사용자가 추천안으로 명시 승인했다.
원본 참고 이미지 자체는 Linear에 연결되어 있지 않아, 화면은 원안의 텍스트를 기준으로 설계했다.

## 제품의 핵심

“채팅으로 오늘의 운동·식사를 기록하고, 같은 대화에서 프로필·기록 이력·실천 잔디를 확인한다.”
채팅은 입력/설명, 서버는 기록·집계의 원본, 임베디드 UI는 확인·수정·탐색을 담당한다.
성공 시나리오: 사용자가 운동과 식사를 입력 → 실제 저장 결과 확인 → UI의 해당 날짜 및 실천 지표 갱신 → 재시작/다른 채팅에서도 다시 조회 → 잘못된 기록 수정·삭제.
AI는 호스트 모델을 사용한다. 자체 LLM API·API 키·과금 인프라를 추가하지 않는다.

## 최소 구현 수준 — 승인된 범위

P0:

1. 프로필: 표시 이름, @handle, 시간대. @handle은 로컬 표시 식별자이며 로그인 아님. 원형 이니셜 아바타.
2. 운동 CRUD: 날짜, 운동명, 선택 운동 시간(분), 선택 메모.
3. 식단 CRUD: 날짜, 끼니(아침/점심/저녁/간식), 음식 설명, 선택 메모.
4. 프로필 지표: 누적 기록일, 현재 연속일, 최장 연속일. 전체/운동/식단 필터.
5. 연간 잔디·월별 탐색·날짜별 상세·최근 이력.
6. 최근 7일/30일 사실 요약을 AI에 반환해 대화 피드백 지원.
7. 로컬 DB 영속성, 중복/충돌 방지, 명시적 JSON 백업·복구.
8. Codex 임베디드 화면에서 실제 데이터 조회·등록·수정·삭제.

후속:
사진 월렛·사진 아바타·체중 및 감량 지표·수동 일정 → 반복 일정·알림 → Claude 어댑터 → 외부 미니 플러그인 → 계정·동기화·제품 배포·Analytics.
사용자 승인에 따라 체중도 첫 버전에서 제외한다. 따라서 빈 감량 카드나 작동하지 않는 사진/일정 버튼을 만들지 않는다.
원안의 플러그인 목록은 P0에서 “운동 기록 / 식단 기록 사용 중” 상태만 표시. 확장 모듈 설치·토글 엔진은 후속. 이는 원안 삭제가 아닌 단계 분리다.
자동 칼로리·영양 추정, 사진 분석, 운동 처방은 MVP 범위 밖.

## 데이터와 동작 규칙 — 승인된 범위

* 완료된 운동 또는 식단이 있는 날짜를 “기록한 날”로 센다. 건강 목표 달성 여부와 동일시하지 않는다.
* 날짜별 동일 카테고리 기록이 여러 개여도 해당 카테고리 1일. 운동+식단이 있으면 통합도 1일.
* 오늘 기록이 있으면 오늘부터, 오늘 없고 어제 있으면 어제부터 역산해 현재 연속일 표시. 둘 다 없으면 0. 최장 연속일은 전체 기록 날짜의 최댓값.
* 잔디는 없음/운동만/식단만/둘 다를 범례·텍스트로 구분. 강도는 0/1/2개 카테고리로 구분하며 입력 건수로 부풀리지 않는다.
* 시간대 기본 Asia/Seoul. 저장은 localDate(YYYY-MM-DD), 기록 당시 IANA timezone, UTC createdAt/updatedAt. 시간대 변경으로 과거 날짜를 이동시키지 않는다.
* 상대 날짜는 서버가 제공한 기준일·시간대로 호스트가 해석하고 저장 응답에 절대 날짜를 표시. 운동명·끼니·날짜가 모호하면 질문, 선택값은 null.
* 과거 입력 허용, 미래 실제 기록은 거부. 운동 시간은 유한 양수(분); 날짜/윤일/문자열 길이를 검증.
* 수정·삭제 후 카드/잔디/이력 즉시 같은 데이터로 재계산.
* 신규 기록은 idempotencyKey + payload hash로 재시도 중복 방지. 같은 key에 다른 payload는 CONFLICT. 같은 날 의도적인 여러 기록은 새 key 사용.
* 수정은 expectedVersion으로 낙관적 잠금. 버전 충돌 시 최신 내용을 보여 주고 재입력. 삭제 재시도는 이미 삭제됨으로 성공.
* UI 삭제는 날짜·내용을 보여 주고 확인. 채팅 삭제는 명시적인 삭제 의도·특정 대상을 확인. 다수 기록이 매칭되면 선택을 요청.
* 사실 요약은 기간·실제 기록 수·기록일·누락일을 반환. 계산되지 않은 칼로리·효과를 생성하지 않는다.

## 저장·공개·삭제

저장 위치: %LOCALAPPDATA%/FitlogMcp, FITLOG_DATA_DIR로 변경 가능. 소스 저장소 밖에 SQLite와 백업을 저장. 로그에는 운동/식단 본문을 기본 기록하지 않는다.
local-only는 DB 저장 위치를 뜻한다. MCP 응답으로 조회한 기록은 Codex 모델 처리에 전달된다. “외부에 절대 전송되지 않음”으로 설명하지 않는다. 기본 조회는 기간·개수로 최소화.
앱 수준 DB 암호화는 P0에 미포함. 운영체제 사용자 권한의 보호 범위이며 암호화 저장이라고 표시하지 않는다.
삭제는 DB에서 기록 제거, 지표 재산출. 과거에 내보낸 백업은 자동 수정되지 않는다. 삭제 보장은 앱의 논리적 삭제이며 저장장치 포렌식 복구 불가능을 보장하지 않는다.
백업은 profile+activities+schemaVersion을 포함한 JSON. CLI에서 사용자 지정 파일로 export/import. 임베디드 호스트의 파일 다운로드 기능에 MVP를 종속시키지 않는다. 복구는 strict schema/크기/중복 ID/날짜 검증 후 DB transaction으로 적용; 복구 전 현 상태 백업. 손상 파일은 현재 DB 변경 없이 거부.
Git에는 코드·설계·합성 테스트 데이터만 포함. 개인 기록·DB·백업·키·로그는 제외.

## 아키텍처 대안과 추천

A. **TypeScript + React + Node + SQLite + MCP Apps** 추천.
UI와 도구 schema/type을 공유하고 단일 로컬 패키지로 실행. 전용 HTTP API/daemon 없이 stdio MCP 서버가 application 서비스를 호출한다. UI는 호스트 bridge의 tools/call로 같은 서비스를 이용한다.
B. Python MCP + SQLite + React. 서버 구현은 간결하지만 UI와 schema/런타임이 분리돼 배포·계약 동기화 부담이 늘어난다.
C. 로컬 웹 대시보드. 별도 브라우저만으로는 확정한 임베디드 요구를 충족하지 않아 주경로로 채택하지 않는다.

추천 구조:
Codex 모델 → MCP tool → application → domain + SQLite repository.
Codex 내 iframe UI → MCP Apps host bridge → 같은 MCP tools → 같은 application.
조회 결과 → structuredContent → React 렌더링.
DB 접근은 repository에만 존재. 날짜·연속일 집계는 domain 순수 함수. 모델이나 React가 별도 공식을 구현하지 않는다.
여러 Codex 세션이 동일 DB를 사용할 수 있으므로 SQLite WAL + busy timeout + transaction + unique key + version check. DB 잠금 실패는 재시도 가능한 오류.
의존성 후보: React, TypeScript, Zod, 공식 MCP SDK, MCP Apps SDK, SQLite 드라이버, esbuild, Vitest, Playwright. 현재 Node 24.19.0 및 공식 MCP server/client/core 2.3.1, ext-apps 2.0.3을 설치했다. pnpm 11.25.0 및 pnpm-lock.yaml로 고정하며 node:sqlite를 사용한다. 사용하지 않는 프레임워크/모노레포는 추가하지 않는다.

### 첫 기술 검증 G0: 임베디드 UI

open_dashboard는 ui://fitlog/dashboard/v1.html 리소스를 가리키는 \_meta.ui.resourceUri와 실제 snapshot을 반환.
리소스는 text/html;profile=mcp-app 타입의 자체 포함 HTML/JS/CSS. UI는 host bridge로 초기화·결과 수신·도구 호출. DB나 localhost에 직접 fetch하지 않으며 외부 CDN 없이 번들.
MCP Apps 호환 호스트에서 동작하는 표준을 쓰되, **현재 Windows Codex에서 stdio 서버의 UI 리소스 렌더링까지 되는지는 실제 연결로 검증해야 한다.** MCP 도구 연결 성공만으로 UI 지원을 주장하지 않는다.
G0 통과: 현재 앱에서 도구 발견 → 임베디드 렌더 → 테스트 기록 추가 → read-back → 새 채팅 재조회. 합성 데이터 사용.
G0 실패: 오류·클라이언트 버전·지원 기능을 기록하고 구체화 단계 유지. 같은 제품 목표의 호스트 확장 방식/지원 클라이언트를 검토. 외부 브라우저·공개 터널·클라우드 데이터 저장으로 조용히 대체하지 않는다.

## 화면 관계와 디자인

기본 진입: 채팅에서 “기록 보여줘” → 대시보드. “운동 기록해줘” → 저장 확인 → 필요 시 대시보드.
대시보드 위에서 아래:

1. 프로필: 이니셜 원형, 이름, @handle, 시간대, 설정.
2. 세 지표: 누적 기록일 / 현재 연속 / 최장 연속.
3. 오늘: 날짜 선택, 운동 추가 / 식단 추가, 오늘 기록 목록.
4. 활동: 연도와 전체/운동/식단 선택, 연간 잔디, 좁은 화면은 월별 탐색. 칸 선택 → 해당 날짜 상세.
5. 최근 기록: 항목 선택 → 보기/수정/삭제. 최근 7일·30일 요약 요청.
6. 사용 중: 운동 기록 / 식단 기록.
   프로필 설정, 운동/식단 폼, 삭제 확인은 화면 내 패널로 열고 취소하면 이전 선택 날짜와 스크롤 복원.
   첫 사용은 프로필 최소 설정→첫 기록. 데이터 0건은 안내·추가 버튼. 초기 demo 수치를 실제 기록처럼 보여주지 않는다.
   공통 상태: host bridge 연결 중/연결 실패, 로딩, 빈 목록, 저장 중, 검증 오류, 저장 실패(입력 유지), 충돌(최신값 표시), 정상 저장, 재조회. 버튼 반복 클릭 방지.
   토큰: host theme 우선(배경/글자/보더), 중립 배경+단일 녹색 강조. 간격 4/8/12/16/24px, 본문 14px·보조 12px·제목 20px, radius 8/12px, 조작 영역 44px. host dark/light 따라가고 색만으로 활동 종류 구분 금지.
   좁은 컨테이너 한 열, 넓은 컨테이너 지표 3열. 키보드 접근, focus 표시, 폼 label/오류 연결, 잔디 칸에 날짜·운동/식단 건수 접근성 이름. 색 대비와 작은 화면은 실제 렌더 검증.

## 데이터 계약과 파일 구조

profile: singleton id, displayName, handle, timezone.
activity: id(UUID), type(workout/meal), localDate, timezone, title, durationMinutes?, mealType?, note?, version, createdAt, updatedAt.
idempotency: key(unique), operation, payloadHash, resultId. 삭제된 ID를 같은 key로 재생성하지 않음.
migration: schema version.
MCP: get_profile/update_profile, create_activity/list_activities/update_activity/delete_activity, get_progress, get_review_context, open_dashboard.
공통 응답: 실제 저장 ID/필드/version, 데이터 schemaVersion, snapshot revision. list 기본 50/max200 및 cursor. 모든 도구 입력은 동일 schema 검사.
오류 코드: VALIDATION_ERROR/NOT_FOUND/CONFLICT/STORAGE_BUSY/STORAGE_ERROR. UI 상태로 매핑하고 개인 데이터·내부 stack/경로를 오류에 노출하지 않는다.
UI에도 같은 CRUD 도구 사용. 모델 입력·도구 결과의 사용자 텍스트는 명령이나 HTML로 실행하지 않는다.

예정 구조:

```text
fitlog-mcp/
  README.md
  AGENTS.md
  package.json
  pnpm-lock.yaml
  tsconfig.json
  .gitignore
  docs/
    DESIGN.md
    VALIDATION.md
  src/
    domain/{activity,dates,progress,streak}.ts
    application/{records,profile,queries,backup}.ts
    infrastructure/{database,repositories,config}.ts
    infrastructure/migrations/001_initial.sql
    contracts/{schemas,errors}.ts
    mcp/{main,tools,resources}.ts
    cli/backup.ts
  ui/
    src/{main,App}.tsx
    src/bridge.ts
    src/features/{profile,records,activity}/
    src/components/
    src/styles.css
  integrations/codex/README.md
  tests/{unit,integration,mcp,ui}/
  fixtures/synthetic/
  scripts/
```

AGENTS.md는 이 프로젝트의 확정 범위·Linear 링크·완료/검증 규칙만 기록. 전역 운영 규칙 전체를 중복 복제하지 않는다.
플러그인 설치 패키지는 G0 결과에 맞춰 manifest/연결 설정을 추가. skills가 필요한 경우에만 기록 워크플로를 보조하며 도구 구현을 대체하지 않는다.

## 구현 스텝 / 완료 조건

S0 구체화 검토 완료: 사용자가 v0.2 추천안의 범위·스택·집계 규칙·검증 기준 및 MVP 착수를 승인했다.
S1 G0 spike: 별도 repo clone, 실행환경/SDK 고정, 최소 MCP 도구와 임베디드 실제 렌더·상호작용. 통과해야 MVP 전체 구현으로 진행.
S2 코어: migration, 프로필/운동/식단 CRUD, 날짜·연속일·중복/충돌 테스트. DB 재시작 후 동일 조회.
S3 채팅 경로: 실제 Codex에서 생성→조회→수정→삭제→진행 집계. 잘못된 입력과 중복 재시도 처리.
S4 임베디드 UI: 프로필·폼·지표·잔디·이력, bridge 연결/오류 상태, 호스트 dark/light와 좁은 화면 검증.
S5 백업·복구·패키징: JSON export/import, 새 데이터 폴더 복구, 실행·연결·제거 안내.
S6 인수·커밋·푸시: 아래 기준 통과 및 미검증 없는 P0 → secret/개인 데이터 제외 확인 → 지정 repo에 커밋·푸시 → remote commit SHA read-back → Linear에 증거 갱신. branch protection이 있으면 우회하지 않고 적절한 브랜치/PR 사용. 제품화·배포는 별도 범위.
의존성: S0→S1→S2→S3→S4→S5→S6.

최종 제품 후보 순서:
F1 체중·사진 월렛(파일 보관·삭제·backup 확장) → F2 수동 일정 및 기록 연결 → F3 반복·알림(호스트 실행수명 검토) → F4 Claude에서 도구·UI 실제 호환 → F5 외부 미니 플러그인의 권한/격리 → F6 계정/동기화·운영·출시/Analytics.
후속 순서는 MVP 피드백으로 재검토하며 지금 착수하지 않는다.

## 수용 기준과 테스트 방법

A1 채팅 통합: 오늘 운동 20분+점심 식사 입력, 도구 read-back과 임베디드에서 동일 날짜·내용 확인. 실제 Codex, 합성 데이터.
A2 집계 단위: 같은 날짜 운동2/식단1 → 전체1일·운동1일·식단1일. 순수 함수 단위 테스트 및 UI 표시 대조.
A3 날짜: 오늘 없음/어제 있음, 자정, 월말·연말·윤일, 시간대 변경 후 과거 보존. 고정 시계 단위 테스트.
A4 CRUD: 과거 날짜 수정/마지막 기록 삭제 → 잔디·지표·목록 동일 재계산. SQLite 통합+UI 흐름.
A5 정합성: 반복 key 한 건, 같은 key/다른 payload 충돌, 두 세션 오래된 version 충돌, DB busy 오류. 실제 임시 DB 통합.
A6 영속성: 서버 종료/재시작/새 채팅에서 동일 결과. 실제 stdio 프로세스 통합.
A7 복구: export→새 폴더 import→동일 profile/활동/집계. 손상 JSON/미지원 schema/잘못된 날짜/중복 ID는 원래 DB 보존.
A8 UI: 현재 Codex 내 임베디드에서 키보드 등록·수정·삭제, 로딩/빈/오류/충돌, 좁은 폭, dark/light 확인. 테스트 host 모사만 통과하면 실제 호스트 검증 완료가 아님.
A9 품질: typecheck/build + 관련 unit/integration/MCP/UI 테스트 통과, 실행 명령·환경·결과를 VALIDATION.md에 기록.
A10 전달: 소스에 실데이터/키/DB 없음, 지정 repo로 push 성공·remote SHA 확인. push 실패나 G0 미통과는 MVP 전달 완료 아님.

## 진행 체크포인트 (2026-10-10)

* 사용자 추천안 및 MVP 착수 승인 완료. GitHub 레포를 지정 경로에 복제하고 codex/mvp 브랜치를 준비했다.
* 전역 Linear 운영 규칙 복구·설치 및 현재 채팅 로드를 확인했다.
* S1/G0 시험 서버 구현, TypeScript 검사·빌드 성공.
* 실제 stdio 프로세스 테스트로 초기화/도구 발견/UI 리소스 메타데이터/합성 SQLite 쓰기·조회/재시작 보존 통과.
* fitlog-probe 전역 MCP 등록 및 codex mcp get으로 설정 재확인.
* 현재 채팅의 도구 목록에는 새 서버가 아직 미노출. 사용자에게 앱 재시작 후 이 채팅에서 계속하도록 요청.
* **현재 Codex 내 UI 렌더링·버튼 동작 미검증. G0 전체 통과 아님.**
* 다음: 새 도구 로드→open_fitlog_probe→실제 내장 UI 확인→버튼 왕복→새 채팅/재시작 조회. G0 성공 후 본 구현 및 MVP 상태 전이.
* 실제 건강 기록 기능·MVP 전체는 미구현. 커밋·푸시는 아직 하지 않았다. 사용자의 “MVP 완료 시 커밋·푸시” 조건을 유지한다.

## 공식 기술 근거

[Codex MCP](<https://learn.chatgpt.com/docs/extend/mcp?surface=cli>): stdio 연결.
[MCP UI](<https://developers.openai.com/plugins/build/chatgpt-ui>): UI resource/host bridge 패턴.
[Plugin packaging](<https://developers.openai.com/plugins/build/plugins>): 설치 패키지 구조.
기술 구조는 프로젝트용 제안이며, 문서만으로 현재 호스트의 렌더링 검증을 대신하지 않는다.

## UI 구조 미리보기 · 2026-10-10 추가 체크포인트

사용자 요청으로 원안 텍스트와 승인된 MVP 배치를 재확인하고 실제 probe UI 리소스에 화면 시안을 추가했다. 프로필 → 누적/현재/최장 기록일 → 오늘 시험 입력 → 월·연간 잔디와 날짜 상세 → 최근 기록 → 운동/식단 사용 중 목록. 사진 월렛·체중·확장 목록은 기존 합의대로 후속이다. 원본 참고 이미지는 미첨부다.

합성 데이터 표시, 카테고리 필터, 월/연간 전환, 날짜 상세, React 메모리에만 추가하는 샘플 입력을 구현했다. 개인 기록 CRUD 구현 완료가 아니다. 실제 SQLite 합성 카운터 시험은 별도 접이식 영역으로 유지했다.

현재 채팅에 MCP 도구가 노출되고 open_fitlog_probe 호출이 성공했다. 호스트 UI bridge 초기화 로그도 존재한다(host: chatgpt, version: 26.930.31730). 다만 이는 육안 렌더·버튼 왕복 검증을 대체하지 않는다. 새 시안 타입 검사/빌드/MCP 프로토콜 시험 통과. 인라인 화면을 검사할 수 없어 사용자에게 옆 패널 확장을 요청했다. 실제 화면·버튼·재조회 확인 전 G0 전체 통과나 MVP 완료로 표시하지 않는다. 커밋·푸시 미실행.

## 추가 합의 — UI 승인 및 dots/예약 알림 (2026-10-10)

사용자: “UI는 맘에들어”, 기존 UI 시안을 채택. 사용자는 MVP 구현·검증 후 Hanzi-Cho/fitlog-mcp 커밋·푸시를 재승인했다.
추가 요구: dots와 연동하고, 지원되는 더 낮은 요금제에서도 특정 시각에 모바일 알림 또는 앱 내 채팅 알림을 받는다.
명시 확정: “고정 시각 알림 우선, 기록 여부 확인은 후속 (추천)”.

### MVP 요구사항 R1–R7

* R1. Fitlog 기록/프로필/집계 API는 표준 MCP로 유지한다. dots 전용 실행·추론 API에 종속시키지 않는다.
* R2. 고정 알림 설정은 내용, 요일, 현지 시각, IANA 시간대, 활성 의도를 표현한다. 초기 알림은 비활성이며 사용자에게 임의 시간을 적용하지 않는다.
* R3. Fitlog에서 호스트 예약용 자연어 요청문을 생성한다. dots 사용 가능 시 dots, 아니면 해당 계정에서 지원되는 ChatGPT 예약 작업으로 전달하는 안내를 제공한다. 생성된 요청문과 실제 호스트 예약은 구분한다.
* R4. 앱 내 채팅 메시지를 기본 전달 대상으로 한다. ChatGPT 모바일 푸시는 해당 계정/앱/OS 알림 권한이 허용할 때 이용한다. 별도 모바일 앱, 알람시계 앱 조작, 강제 소리/진동, 정확한 초 단위 도착 보장은 MVP에 포함하지 않는다.
* R5. 호스트 예약 생성은 실제 호스트 도구 또는 UI에서만 수행하고 ID·저장된 주기·시간대·전달 대상의 재조회로 확인한다. Fitlog 로컬 설정 저장만으로 “예약됨/전송됨”으로 표시하지 않는다. 지원 도구가 없으면 설정 안내 상태로 남긴다.
* R6. 첫 MVP 고정 알림은 건강 DB를 읽거나 업로드하지 않는다. PC가 꺼진 경우도 가능한 알림 경로는 클라우드에 실제 저장된 예약에 한정된다. 로컬 Codex 자동화를 클라우드 예약이라고 설명하지 않는다.
* R7. 알림 변경/해제 시 실제 호스트 예약과 별도라는 점을 표시하고, 기존 예약 ID를 이용해 중복 생성 없이 변경·해제한다. 호스트 확인이 안 되면 미확인 상태로 표시한다.

### 후속 범위

미기록 여부에 따른 조건부 알림, dots에서 연결된 PC의 기록 조회, PC가 꺼져 있어도 동작하는 데이터 연동/동기화. 로컬 stdio MCP 등록만으로 dots 클라우드 접근이 완료됐다고 주장하지 않는다.

### 수용·검증

입력 시간/요일/시간대 검증, 한국어 예약 요청문 생성, 설정의 로컬 영속성, 미등록/호스트 확인 상태 분리. 실제 예약 저장 및 앱 내 결과 도착은 통합 시험으로 구분한다. 모바일 푸시 도착은 사용자 기기에서 별도로 확인하며 채팅 생성만으로 푸시 도착을 주장하지 않는다.
사용자 추가 답변: 21:00 식단 리뷰, ChatGPT 푸시 + 앱 내 메시지, 외부 알람 서비스 미사용. 매일 Asia/Seoul 21:00 고정 알림으로 구현한다. 알림은 오늘의 식사를 입력/확인하고 리뷰하자는 안내이며, 아직 조회하지 않은 개인 기록을 분석한 것처럼 말하지 않는다.

### 확인한 공식 근거와 한계

* [dots 예약](<https://learn.chatgpt.com/docs/dots/tasks-and-memory>): 반복 작업에는 저장된 일정, 시간대, 알림 조건, 전달 위치가 필요.
* [dots 지원 범위](<https://learn.chatgpt.com/docs/dots#access>): 현재 Pro 100/200/500 등 대상에 순차 제공. 사용자 계정 활성화 또는 낮은 요금제의 dots 지원은 추정하지 않음.
* [예약 작업](<https://learn.chatgpt.com/docs/automations>): 웹 예약은 로컬 폴더를 직접 읽을 수 없음. 로컬 파일을 쓰는 데스크톱 예약은 PC와 앱 실행 필요. 낮은 요금제별 고정 예약 가능 여부는 이번에 읽은 문서만으로 확정되지 않았으므로 계정 기능 확인 필요.
* [알림 설정](<https://learn.chatgpt.com/docs/notifications>): 계정/종류별 채널이 다르며 푸시 등 제공 여부와 권한에 종속.
* [dots 로컬 컴퓨터 연결](<https://learn.chatgpt.com/docs/dots/computers-and-apps>): 연결된 PC 사용은 PC 온라인·앱 실행 필요.

## G0 실제 사용자 검증

2026-10-10 사용자가 내부 UI 및 ‘로컬 저장 기능 확인했어. 잘 돼’라고 확인. 이후 open_fitlog_probe 재호출 결과 count=3 확인. UI bridge 로그와 실제 stdio 재시작 통합 시험도 존재한다. 새 채팅 자체의 재조회는 아직 별도 미검증이며 최종 인수에 유지한다. 사용자 재승인에 따라 본 MVP 구현을 진행한다.

## MVP 구현 체크포인트 · 2026-10-10

운동/식단 CRUD, 프로필, 기록일/연속일 집계, 실제 MCP Apps UI, JSON 백업/복구, 7/30일 리뷰, 매일 21:00 알림의 로컬 설정·호스트 요청문을 구현했다. typecheck/build, 핵심 테스트 9개, 실제 stdio MCP CRUD/충돌/재시작, 백업 CLI 검증 통과. 개인용 fitlog@fitlog-personal 0.1.0 installed=true/enabled=true 재조회 확인.

현재 채팅에는 기존 probe 도구만 있어 앱 재시작 후 실제 버전 UI 인수가 남았다. ChatGPT 브라우저는 로그아웃 상태이며 로그인 화면을 열어두었다. 클라우드 예약 및 모바일 푸시 수신은 미검증/미등록이다. 제공된 로컬 예약 도구를 클라우드 예약으로 대체하지 않았다. 지정 GitHub 커밋·푸시는 인수 조건 충족 후 수행하며 현재 미실행.

진행 이슈: [HAN-6](<https://linear.app/hanzicho/issue/HAN-6>). 로컬 실행·설치·검증 안내는 README.md, integrations/codex/README.md, docs/VALIDATION.md에 정리했다.
## HAN-7 approved expansion / 2026-10-11

User authorized PC-first, chat-minimal meal check/photo/nutrition improvement. This supersedes the original later-work exclusion for these features. Linear HAN-7 and its project specification hold requirements and implementation checkpoints.

Contracts: src/contracts/experience.ts. Journal persistence: src/application/journal.ts (SQLite journal table). UI: JournalPanel, ReminderPanel, CameraFolder. Host AI uses MCP Apps createSamplingMessage with capability checks; no new API key/provider billing or cloud photo storage.

Goal adherence (yes/no/unwritten) and occurrence (unknown/completed/skipped/planned) are independent. Food names never imply failure. Planned meals remain unassessed. Explicit user statuses are never overwritten by an estimate.

One date imagebook uses bounded JPEG/PNG/WebP uploads, stable insertion order, same-date/meal/hash deduplication and versioned analysis/delete. Images have a 4MB/item, 20/day, 200/32MB total limit. Snapshot responses exclude image bytes; explicit image retrieval is required. Backups include the journal extension and accept legacy input; restores invalidate stale versions.

Stored adult profile and weight goal can produce a host AI target draft; user review/save applies it. Daily nutrition comparison waits for all principal meals and analyzed photos. Low-confidence estimates and duplicate-meal images defer assessment. All nutrition values from photos are estimates and manually correctable.

Default UI is the expanded PC dashboard; mini view retains explicit status controls. Host theme/green accent/labels and responsive columns retained. In-app reminders require an open UI; OS/mobile/background delivery is separate. Camera folder access requires explicit directory selection and host support, and ignores pre-existing files. Actual host acceptance and mobile refinement remain pending.
