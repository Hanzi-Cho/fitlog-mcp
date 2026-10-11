# Validation / 2026-10-10

Stage: MVP implementation. Code and personal plugin installation are ready. Final host acceptance and real cloud reminder delivery are pending. No commit/push yet.

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

