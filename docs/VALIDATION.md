# Validation / 2026-10-10

Stage: MVP implementation. This file is chronological evidence; historical pending/scope statements are superseded by the latest version entries below. GitHub pushes are authorized and completed. Mobile/background notification delivery is later scope, not a current MVP gate.

## Environment

Windows PowerShell, Node 24.19.0, pnpm 11.25.0; MCP SDK 2.3.1, MCP Apps 2.0.3. Locked dependencies.

## Passed

- TypeScript tsc --noEmit: exit 0.
- node scripts/build.mjs: exit 0. On this PC esbuild parent-directory scanning needs execution outside the filesystem sandbox.
- node --import tsx --test tests/core.test.ts: 9/9. SQLite persistence, deduplication/tombstones, day/category/streak aggregation, yesterday/gap and date/timezone rules, invalid inputs, two-session conflicts/locks, cursor pagination, backup rollback/version invalidation, fixed reminder request and review facts.
- node scripts/test-mcp.mjs: exit 0. Actual stdio discovery, resource MIME/executable root, CRUD, retry/conflict, process restart, progress/reminder contracts.
- node scripts/test-backup.mjs: exit 0. CLI export/import to new directory, pre-restore backup, overwrite refusal, corrupt JSON/schema rejection.
- node scripts/test-probe.mjs: exit 0. Isolated synthetic counter and process restart; does not fabricate UI evidence.
- G0 actual user evidence: user approved embedded UI and reported “로컬 저장 기능 확인했어. 잘 돼”. Subsequent open_fitlog_probe returned count=3. UI bridge logs identify host chatgpt, version 26.930.31730.
- Official Codex CLI installed fitlog@fitlog-personal 0.1.0; reread installed=true, enabled=true. Generated absolute-path manifests remain ignored under .local/.

## Pending — do not claim complete

- New production tools are not loaded into this current chat. Requested app restart. Only synthetic probe tools currently available.
- Actual production embedded UI CRUD, keyboard, narrow/light/dark, error/conflict states, review chat handoff and new-chat access. G0 evidence does not prove the new production UI.
- Authorized every-day Asia/Seoul 21:00 fixed meal-review reminder: local preferences/request generation implemented; actual cloud schedule ID/read-back and mobile push receipt unverified.
- ChatGPT browser is logged out; sign-in dialog opened. No cloud schedule submitted. Available Codex automation tool is local-only and was not substituted for cloud delivery.
- GitHub commit/push remains contingent on agreed acceptance. All tests used synthetic temporary DBs, no personal records uploaded.

## Scope

No cloud DB sync, conditional missing-record notifications, external alarm service, photos, weight, calendar, Claude compatibility or extension engine. Backup import retains contents/deduplication but invalidates stale versions. Preview changes memory only; production starts empty. Error responses omit internal paths, stack traces and record body data.

## 사이드바 진입점 · 2026-10-10
사용자 요청에 따라 open_dashboard 제목 Fitlog, global/thread 진입점 메타데이터를 추가했다. pnpm typecheck 통과. 샌드박스에서 build/test가 환경 접근 제한으로 실패한 뒤 승인된 외부 실행으로 pnpm build 및 pnpm test 전체 통과(코어 9개, MCP/백업/probe). MCP 테스트에 제목·진입점 검증을 추가하고 node scripts/test-mcp.mjs 재실행 통과. 설치 생성물의 mcp.json이 현재 dist/main.mjs를 참조함을 확인. 현재 세션은 probe 도구만 노출: 앱 재시작 후 실제 사이드바 노출·DOTS 아래 위치·고정 상태는 미검증. 채팅 상단 40% 레이아웃은 미구현이며 지원 여부 미확인.

## 미니 UI 검증 · 2026-10-10

pnpm typecheck, pnpm build, pnpm test 통과. 코어 10개(체크리스트 중복·필터 독립성·수정/삭제·자정 포함), MCP/백업/probe 통합 통과. 실제 MCP 응답에서 Fitlog global/thread 및 inline/pip/fullscreen 메타데이터 확인.

node --import tsx scripts/test-compact-ui.mjs 통과. 설치된 Edge headless, 실제 React UI, 별도 임시 SQLite 합성 데이터, 모사한 호스트 bridge 사용. 체크 완료/비활성, 페이지 이동, 2/4 원형 지표, 잔디 날짜 선택, 폼 저장, 외부 기록 후 새로고침, 리뷰 메시지 요청, 360px 다크 모드 가로 넘침 없음 검증. .local/ui-check/checklist.png, metrics.png, narrow-dark.png 육안 확인.

실제 Codex 사이드바 메뉴 표시·DOTS 바로 아래 위치·PiP 호스트 표시·창 점유율은 미검증. 앱 재시작 후 사용자 인수 필요. 실제 건강 DB는 테스트에 사용하지 않았다. 커밋/푸시 미실행.
## 실제 연결 누락 진단 및 복구 · 2026-10-10

사용자가 새 창에서 사이드바/오버레이 모두 표시되지 않음을 보고했다. 현재 세션 callable 도구는 fitlog-probe 3개뿐이며 본 서버 open_dashboard는 없었다. plugin list의 installed/enabled는 본 서버 실행이나 UI 표시의 증거가 아니었다. mcp list는 명시 등록 목록이며 플러그인 내부 발견 전체를 증명하지 않으므로 이를 패키지 파서 결함으로 단정하지 않는다.

prepare-plugin.mjs에 Codex 호환 manifest/.mcp.json과 명시적 MCP 참조를 추가하고 개인 플러그인 0.1.1로 갱신했다. 기존 Fitlog 본 서버 직접 등록이 없음을 확인하고 codex mcp add fitlog로 dist/main.mjs를 등록했다. codex mcp get fitlog --json으로 enabled=true와 정확한 경로 재조회 완료. probe는 독립 합성 연결로 유지한다.

등록된 명령과 같은 Node/main.mjs로 실제 MCP initialize/listTools/readResource 수행: 도구 11개, open_dashboard 제목 Fitlog, global/thread 진입점, inline/pip/fullscreen 리소스 메타데이터, compact HTML 확인. 개인 건강 기록을 조회하지 않았다. 앱의 실제 사이드바/PiP 수용은 여전히 미검증이며 사용자의 표시 실패 보고를 해소했다고 주장하지 않는다. 새 MCP 도구가 현재 실행 중인 세션 목록에 즉시 추가된다는 보장도 없다.

## HAN-7 implementation in progress · 2026-10-11
Daily explicit yes/no/unwritten checks and separate occurrence; local imagebook and goal profile; UI host sampling capability check. New functionality is not yet actual-host accepted. No real photo/health data in tests.

## HAN-7 final code checkpoint / 2026-10-11

- pnpm typecheck/build/test passed. Core 15/15; actual stdio discovery (20 tools), explicit checks/conflict/restart, backup CLI and probe regression passed.
- node --import tsx scripts/test-journal-ui.mjs passed: actual React + isolated synthetic SQLite in headless Edge. Explicit X/skipped/planned, image attachment, estimated analysis correction, carousel/reload, profile targets/reminder settings, unsupported AI preserves uploaded photo, mini checks/goal ring and 360px dark overflow. Host bridge and AI responses are test doubles. PNGs under ignored .local/ui-check/ were inspected.
- Original record presence and explicit goal adherence are separated. Selected images are stored locally and counted as recorded days, not goal attainment.
- AI target draft requires adult profile fields; draft is applied only after the user saves. Actual image recognition/target generation quality is unverified.
- Low-confidence host estimates, multiple images for the same meal, unconfirmed meals and pending image analysis defer automatic daily assessment. Multi-image meal consolidation remains follow-up work.
- In-app check times are opt-in; breakfast/lunch initially unset, dinner default 21:00. UI must remain open. OS notification permission/delivery, closed-app operation and cloud/mobile delivery are not verified.
- Camera folder scanner is opt-in, baseline excludes existing files, scans selected folder only, and stores new images only after food analysis succeeds. Actual Codex File System Access/sampling permissions are unverified. No background/mobile photo-library integration.
- Sidebar global/thread metadata preserved. Automatic pinning and exact ordering are not established by official docs.
- Existing running MCP processes require reconnection/app restart for new handlers. Actual Codex acceptance remains pending. No GitHub commit/push; prior acceptance condition retained. No actual health/photo data in source or tests.

## GitHub delivery authorization / 2026-10-11

- The user explicitly requested pushing the current implementation to https://github.com/Hanzi-Cho/fitlog-mcp. This supersedes the previous delivery wait; actual-host acceptance and the MVP project stage remain unchanged.
- Pre-commit verification: pnpm typecheck, pnpm build and pnpm test passed again (15/15 domain/storage tests, actual stdio MCP, backup CLI and probe regression).
- Git candidates were reviewed: source/docs/tests and dependency metadata only. DBs, user photos/records, backups, secrets, generated local manifests and build/dependency artifacts are excluded by .gitignore. Credential-pattern scan found no matching candidate files.
- Push preparation does not assert actual host AI/camera/folder/notification acceptance. Remote delivery is verified separately by comparing commit IDs after push.

## HAN-8 PC UX and documentation / 2026-10-11

- Requirements: docs/requirements/UX.md (UX-001..006, DOC-001/002), CHANGELOG.md and docs/PROJECT.md. Linear HAN-8 In Progress; project MVP.
- Passed: pnpm typecheck/build/test (18/18), actual stdio MCP, backup CLI and probe. Goal heatmap checks cover unique affirmative goals, X/unwritten/plan, record/photo independence, filter independence, variable N/zero/future, check-only streaks and review counts.
- Passed: node --import tsx scripts/test-journal-ui.mjs using actual React and isolated synthetic SQLite with a mocked host/AI bridge. PC equal-width checklist/metrics, one row per check, photo upload/new selection/edit/date navigation/carousel/reload, goal intensity 0..4, frame=image dimensions, no automatic overlay/host explanation, reminder settings, 360px dark overflow and browser errors checked.
- Inspected synthetic screenshots .local/ui-check/ux-desktop.png and ux-narrow.png. Screenshots/fixture data are not real user photos or health records.
- Minimal view retains reminder monitoring while mounted and only shows actionable due cards; advanced settings remain in detail view.
- Actual Codex UI/reconnection, natural-language tool routing, AI image quality, camera/folder permissions, OS/cloud/mobile delivery remain unverified. Existing MCP process must reconnect to load new handlers/resources. No stage transition or release claimed.

## Installed plugin refresh / 2026-10-11 / 0.1.2

- User reported stale plugin UI and explicitly requested updating the installed Codex plugin. Before refresh: installed version 0.1.1, this chat exposed old 11-tool metadata, and multiple Fitlog main.mjs processes predated the latest build. Source/GitHub delivery did not establish runtime refresh.
- Set package, MCP/bridge and generated portable/compatibility manifests to 0.1.2; generation reads package.json version. UI resource changed to ui://fitlog/dashboard/v0.1.2.html.
- pnpm typecheck/build/test passed (18/18, real stdio MCP discovery/CRUD/restart, backup/probe). Fresh synthetic MCP client successfully read the new versioned resource and found 20 tools.
- Executed node scripts/prepare-plugin.mjs and codex plugin add fitlog@fitlog-personal --json. Read-back installed=true/enabled=true/version=0.1.2. Cache path ~/.codex/plugins/cache/fitlog-personal/fitlog/0.1.2; source/cache manifest SHA-256 matched, both manifest versions matched and .mcp.json pointed to this repo dist/main.mjs. Direct MCP registration also points to the same production server.
- Health DB/photo/backup contents were not read or modified. App-wide restart was not forced during the active chat. Fully quit/reopen Codex and open a fresh Fitlog card to reload the running MCP/tool registry/UI; actual post-restart host acceptance is pending. Installing/updating the cache alone is not proof that an already-open card refreshed.

## 0.1.3 간소화 검증 · 2026-10-11

- pnpm typecheck / build / test 통과. 20개 저장·도메인 시험: 횟수 달성/감소/충돌/백업, title/feedback enum·구버전 누락 필드 기본값 추가. 실제 stdio MCP·새 URI·재시작, 백업 CLI, probe 통과.
- node --import tsx scripts/test-compact-ui.mjs: 실제 React+합성 SQLite, 호스트 bridge/첨부/AI는 모사. 단일 binary 체크/횟수 50→100→99·저장/재조회, 프로필/영양/알림 저장, 채팅 첨부 모사 저장 후 자동 조회, 읽기 이미지북/추천 pill/이전다음/날짜/재조회, 0~4 잔디, PC 좌우 동일 폭/300px 달력, 프레임=이미지, 360px dark 넘침 없음, JS 오류 없음. 합성 PC/좁은 화면 육안 확인.
- 실제 Codex 내 최신 카드·자연어/채팅 첨부 bytes 전달·AI 품질은 미검증. 설치 갱신과 활성 앱 세션 재시작은 별개다. 개인 건강 DB/사진을 시험 fixture로 사용하지 않았다. 이전 카메라/폴더/앱 업로드 수용 항목은 최신 UX 개정으로 제외한다.

설치 확인(2026-10-11): prepare-plugin 및 codex plugin add 이후 Fitlog installed=true, enabled=true, version=0.1.3. 소스/캐시 manifest 해시 일치 확인. 활성 Codex 세션의 재시작/새 카드 수용은 별도 미검증이며 강제 종료하지 않았다.


## 0.1.4 날짜 탐색/작업 관리 · 2026-10-11
- 최신 요구 UX-007/008: 중앙 빈 안내, 오늘 기본, 과거 달성 목록→사진 슬라이드, 과거 재클릭 오늘 복귀, 상단 오늘 지표 독립. 목록 마지막 추가/행별 제거와 binary/count 목표. 현재/과거 목표 집합과 분모를 날짜별 보존하고 체크는 삭제하지 않음.
- 코드: compact.tsx/Imagebook.tsx/Checks.tsx/TaskEditor.tsx, experience.ts/journal.ts/service.ts/goals.ts. goalConfig 날짜별 revisions와 버전, 백업 기본값·복원 포함. 실제 개인 DB/사진은 읽거나 수정하지 않음.
- 통과: pnpm typecheck/build/test(22개), 실제 stdio MCP 22도구/0.1.4 UI·추가/제거/충돌/재시작, 백업 CLI/probe. 실제 React+합성 SQLite/모사 bridge 브라우저: 중앙 위치 실측, 날짜 목록→사진/왕복·재클릭/오늘 지표 유지, count 추가/저장/제거/재조회, 과거 목표/분모 보존, PC/360px dark 넘침·JS 오류 없음. 합성 PC/과거 날짜 화면 육안 확인.
- 프로젝트 MVP/HAN-8 In Progress 유지. 실제 Codex 새 카드 수용·채팅 첨부/AI·실제 알림 수신은 별도 미검증. 설치 갱신과 열린 앱 세션 수용을 구분한다.

설치 확인: prepare-plugin 및 plugin add 이후 installed=true/enabled=true/version=0.1.4, 소스/캐시 manifest 해시 일치. 활성 Codex 앱의 강제 종료는 수행하지 않았으며 새 카드 수용은 미검증.



## 0.1.5 UX-009 · 노트북 창 밀도
지표 왼쪽/목록 오른쪽, 최대 폭 760px·상단 32px·행 32px·목록 최대164px, 달력 240px/낮은 창 칸24px, 범례 제거. 사진 비율을 유지하고 창 높이로 축소한다. 실제 React+합성 SQLite/모사 bridge에서 960×640, 800×600, 720×540, 600×480 오늘/과거 화면 페이지 가로·세로 넘침 없음. 세로 사진/피드백3개/16작업/6주 달력·기존 날짜/작업 관리와 360px dark 회귀 통과. 합성720×540 화면 육안 확인. 타입/빌드/22개 시험·stdio MCP22도구/0.1.5리소스·백업/probe 통과. 실제 MacBook 및 Codex 기본 창 실측/새 카드 수용은 미검증. 프로젝트 MVP/HAN-8 In Progress 유지.


## 0.1.6 · UX-010..013 · 2026-10-11
- 통과: pnpm typecheck/build/test. 25개 저장·도메인 시험, 실제 stdio MCP25도구/새 URI, edit_goal/update_personal_info/claim_due_alarms, 시간대 동기화와 과거 날짜 보존, 재시작·백업 CLI/probe.
- 신규 저장 시험: 이름/목표 수정과 오늘 count 유지·달성 재계산·유형 전환 초기화·버전 충돌·과거 이력/복원; 개인정보 유지 kcal와 미입력/나이 경계; 요일·일회성·간격·DST·claim 중복·재시작/복원과 삭제 로그 정리.
- 브라우저: node --import tsx scripts/test-compact-ui.mjs. 실제 React+합성 임시 SQLite, 호스트/AI bridge 모사. 수정·취소·재조회, select/number 높이 동일, 추가/취소 영역, 자동 저장/계산/저장 버튼 제거, 8→80 중간 입력, 느린 첫 요청 중 새 초안이 최신 버전으로 후속 저장됨, 합성 저장 실패 시 오류/원본 유지→재시도, 닫기 직전 대기 초안 저장, 알림 추가/간격/활성/제거/재열기 확인.
- 15px classic scrollbar CSS 강제 후 설정 전후 .compact x/width 동일·root gutter stable. 960×640/800×600/720×540/600×480 기본 화면 페이지 넘침 없음, 많은 목록·세로 사진·6주 달력 및 360px dark 회귀. 설정을 펼치면 의도적으로 페이지 세로 스크롤을 허용한다.
- .local/ui-check/settings-desktop.png, laptop-720.png 등은 합성 테스트 결과이며 Git 제외. 설정 화면 육안 확인: 하단 개인정보/4개 값/한 줄 알림·수정 아이콘 배치 정상.
- 실제 건강 DB/사진을 읽거나 수정하지 않음. 실제 Codex 재시작 후 새 카드, Mac 기본 창, dots 계정 연동, 실제 채팅 첨부·AI·OS 알림 수신은 미검증. 닫힌 앱/클라우드/모바일 알림은 제공하지 않음. claim 후 UI 종료 시 수신 보장 없음. 유지 추정은 개인 감량 처방이 아님.
- 프로젝트 MVP, HAN-8 In Progress 유지. 자동 시험·설치·푸시를 실제 호스트 수용/제품화 전이 완료로 간주하지 않는다.


## 0.1.7 · UX-014 · 2026-10-11
- 통과: pnpm typecheck/build/test(26개), 실제 stdio MCP25도구/0.1.7 URI·새 carbRecommended/fatRecommended 값, CLI 백업/복원·probe. 권장값342g/83g과 상한404g/96g 구분, 여성 예시·미입력·복원 검증. 개인 DB/사진은 읽거나 수정하지 않음.
- 실제 React/합성 SQLite + 모사 호스트 bridge: 라운드 카드4개/권장값·문구 확인, 자동 저장 성공 텍스트/유지 설명/호스트 모델/PC 알림 허용 버튼 없음. 반복 행 select 없음, 7요일 평소 숨김, 간격3시간·시간23:59 말풍선 편집/자동 저장·활성/재열기·제거, 매주 월 수 금/일회성/매일 전환과 Escape가 말풍선만 닫는 동작 통과.
- 느린 저장 중 후속 입력/실패→재시도/닫기 직전 저장·기존 작업 수정/날짜/사진/노트북 960×640~600×480 페이지 fit 회귀. 360px dark 설정·말풍선의 화면 내 배치와 가로 넘침 없음, JS 오류 없음. .local/ui-check/settings-desktop.png/settings-narrow.png 육안 확인. 합성 화면은 Git 제외.
- 실제 Codex 새 카드/모바일 전달 수용은 미검증. PC OS 알림 경로는 제거, 열린 앱 확인만 유지. 설치·푸시·시험을 실제 호스트 수용이나 제품화 전이 완료로 간주하지 않음. 프로젝트 MVP/HAN-8 In Progress 유지.

## 0.1.8 · UX-015/016 · 2026-10-11
- 통과: pnpm typecheck/build/test(26개 도메인·실제 임시 SQLite 시험), 실제 stdio MCP26도구/0.1.8 리소스·get_help 전체/사진 필터·invalid topic 거부·read-only 메타데이터·journal revision 무변경, 기존 CRUD/재시작·백업/복원·probe. 개인 건강 DB/사진 미접근.
- 실제 React/임시 SQLite + 모사 host bridge: ?가 config 왼쪽, 기능별8개 설명/어두운 backdrop, 개별 확인 후7개/나머지 유지, X/ESC/재열기8개/마지막 확인 종료, 모달 내부 키보드 포커스/종료 후 버튼 복원, 설정 열린 상태 도움말 ESC가 설정 유지, 도움말 전후 revision 일치. 720x540·360x800 내용 스크롤과 X 화면 내 배치, 가로 넘침 없음. 기존 프로필/알림/작업/사진/달력/노트북 회귀와 JS 오류 없음 통과.
- 합성 도움말 화면 .local/ui-check/help-desktop.png/help-narrow.png 육안 확인. 사진/AI 인식은 fixture로 대체하므로 실제 인식 수용이 아님. 스크린샷은 Git 제외.
- 사용자 첨부 JPG를 변경 없이 자산으로 복사, 원본·저장소·패키지·설치 캐시 SHA256 일치 확인. portable/compatibility manifest의 composerIcon/logo/logoDark 경로와 소스/캐시 manifest 해시 일치. prepare-plugin 문법 검사 통과.
- Fitlog0.1.8 installed=true/enabled=true 재조회. 실제 Codex 새 카드의 도움말/아이콘 표시·AI 채팅 라우팅·첨부 bytes 접근·실제 이미지 인식·모바일 호스트 수용 미검증. 열린 카드/서버가 자동 교체됐다고 주장하지 않는다. 로그인/RBAC·기기 간 자동 동기화·모바일 백그라운드 전달은 미구현.
- TESTING.md E2E-01..12에 기대값/코드/근거 계층/미검증·후속을 명시. 추가 도구 Inspector/promptfoo/ARTEMIS는 공식 자료 조사·추천이며 설치/실행하지 않음. Linear 공통/프로젝트 문서와 HAN-8에 제품화4축/결과를 기록 후 재조회. MVP/HAN-8 In Progress 유지.


## 0.1.9 · UX-017/018 · 2026-10-11
- 통과: 타입/빌드, 26개 도메인·실제 임시 SQLite 시험, 실제 stdio MCP26도구/0.1.9 리소스/동일 tour 순서·체크리스트3페이지·도움말 무변경, 백업/복구/probe. 데이터 스키마/개인 DB/사진 변경 없음.
- 실제 React + 합성 SQLite + 모사 host bridge: 사용자 지정8기능/총11설명 순서 전체 통과. 각 설명마다 실제 대상/말풍선 bounding box 비겹침·viewport 내 배치, 같은 영역 페이지 위치/높이 동일, 최초 힌트와 재방문 미표시, X/ESC/Tab·포커스 복원, 설정 자동 열기/시작 상태 복원, 모션 감소와 도움말 전후 revision 동일. 1000x900/720x540/600x480/360x800 및 알림20개 600x480/360x800 통과. 알림 상시 표시와 기존 목표/프로필/알림 편집·사진/달력·작은 노트북 페이지 fit 회귀·JS 오류 없음.
- help-checklist.png/help-profile-narrow.png/help-alarms-compact.png 합성 화면 육안 확인. dim 배경을 유지하면서 말풍선 fade 전환, 기본240ms enter/180ms leave, 모션 감소 즉시 처리. 강조는 실제 요소 주변이며 대상은 가리지 않음. 좁고 내용이 긴 영역에서는 설명 내부만 스크롤.
- 단계 자동 전이 사용자 승인 확보: 기준 충족 시 재확인 없이 전이·재조회. 현재 프로젝트 MVP/HAN-8 In Progress 유지 사유는 최신 실제 호스트 핵심 흐름 미검증. 사용자 UI 피드백/과거 probe 저장은 근거로 인정하되 최신 첨부·인식·저장·신규 채팅을 대신하지 않는다. 현재 대화 callable Fitlog 메타데이터는 초기11도구이며 이번 격리 MCP시험26도구와 다름.
- 제품화 전이 전 확인: 최신 실제 호스트 신규 채팅에서 목표/기록 저장→UI 최신화→새 조회 일치, 실제 첨부 bytes→AI분석→저장→사진/분석 재조회 일치. UI사용감·API·모사·실제호스트를 분리. 미지원 모바일/백그라운드 전달·카메라 자동수집·RBAC·기기 동기화는 후속 범위이며 현 MVP에 소급 필수화하지 않음.
