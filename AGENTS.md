# Fitlog MCP

Linear project: https://linear.app/hanzicho/project/ai-헬스-식단-자기관리-플러그인-f38af4bd8e45
Approved design: docs/DESIGN.md (2026-10-10 user approval).

- Build for Codex first, one local user, exercise and meal records. Embedded UI is required.
- Weight tracking, Claude compatibility and external modules remain later work. Photos and local reminder settings are in the authorized HAN-7 expansion; actual host/background/mobile acceptance remains separate.
- Use TypeScript, React, SQLite and standard MCP Apps. Keep domain calculations independent of the UI and transport.
- Never commit real health records, databases, backups, credentials or machine-local configuration.
- G0 requires actual Codex embedded rendering and tool interaction. A browser harness or tool-only test is not host validation.
- Read current Linear state before updates and verify writes afterward. Preserve existing work.
- Run typecheck, build and meaningful tests. Record actual results and unverified host checks in docs/VALIDATION.md.
- 2026-10-11: the user explicitly requested pushing the current fitlog-mcp work to Hanzi-Cho/fitlog-mcp, superseding the earlier delivery wait for host acceptance. Commit only source/docs/tests and dependency metadata; exclude personal records, photos, DBs, backups, credentials and local configuration. Keep actual-host acceptance pending and verify the remote commit after pushing.

- HAN-7 user expansion (2026-10-10): explicit goal checks/meal occurrence, local photos, personal nutrition targets and host AI analysis, PC-first UI are authorized. Original later-work limits above are superseded for these features. No new paid API/cloud photo storage. Actual host and background/mobile acceptance remain separate.

<!-- productization-flow:start -->
## Productization workflow / 2026-10-11

- Apply the common lifecycle and productization criteria: https://linear.app/hanzicho/document/bf273c53e2b9. On this Windows Codex home also read C:/Users/whwog/.codex/guides/linear-workflow/LINEAR-WORKFLOW.md. Treat this as persistent guidance requested by the user for dots; do not assume installation on other hosts.
- The user evaluates real usage and UX. The agent owns authorized engineering checks and records evidence for real integration, reliability, data migration/backup/restore/deletion, privacy/security/permissions, installation/upgrades, performance/capacity, accessibility/compatibility, regressions, incident recovery/rollback and release/measurement preparation.
- Record applicability, owner, acceptance criteria, environment/version, results/evidence and residual work. Distinguish passed, failed, unverified, agreed deferral and not applicable (with reasons). Do not enable telemetry, paid services or cloud photo storage from this documentation request.
- Keep Fitlog at MVP until its agreed actual-host acceptance is evidenced and productization scope/start is approved by current or valid prior authorization. This request documents the workflow and does not itself authorize a project transition. Do not repeat already granted permissions.
- Existing implementation/harness passes do not prove actual Codex production UI/new-chat access, host sampling/image recognition, camera/folder permissions, OS notifications or cloud/mobile delivery. Reconcile HAN-5/HAN-6/HAN-7 and docs/VALIDATION.md when resuming.
- For productization, verify photo/DB consistency and deletion, versioned backup/restore and upgrade recovery, permission refusal/AI failure and correction, storage limits, restart persistence, supported PC host/keyboard flows and reproducible installation. Gather actual-host evidence for the approved core flow before claiming acceptance.
- Closed-app camera/library access, background/cloud/mobile delivery and automatic sidebar pinning/ordering remain unverified or unsupported pending capability checks. Keep them explicitly limited or agree follow-up scope; do not promise them from metadata or mocks.
- Productization→Release/Analytics requires an evidenced release candidate, resolved blocking defects, agreed nonblocking deferrals, and approved release/operations/measurement scope. Record before→after stage, evidence, approval source and next actions in Linear; read before writes and verify afterward. Stage movement does not prove deployment.
<!-- productization-flow:end -->

## UX requirements and project documentation / HAN-8

- Product purpose: minimal effort and attention for daily self-management. Prefer direct checks/photos and one-screen status over extra chat, pages and technical host explanations. Keep actionable errors and necessary data-transmission/estimate/deletion information.
- Read docs/requirements/UX.md for stable numbered requirements and code/acceptance mappings; docs/PROJECT.md for Linear links, current phase, implementation/validation/host-acceptance boundaries and transition tasks; CHANGELOG.md for changes. Update these with Linear when requirements change.
- PC metrics occupy the left half; checks occupy the right half as one item per row in a bounded scroll area so its scrollbar is outside right. Selected-date imagebook below must fit the actual image without an empty decorative frame.
- Heatmap intensity is affirmative goals K/N, not presence of records/photos. Default N is four; current user-authorized task add/remove changes the active date-specific goal set. Preserve historical sets and checks. Explicit X/unwritten/planned do not add attainment.
- Short chat facts use existing MCP CRUD/check tools; preserve explicit goal judgments and avoid repeated clarification. Natural-language routing and actual host acceptance require real evidence, not just tool descriptions.

- 0.1.3 최신 UX 우선: docs/requirements/UX.md. 상단 제목+설정만, binary/count 단일 조작, PC 동일 비율/큰 달력, 채팅 첨부만 허용하는 읽기 전용 이미지북/영양 enum pill. 과거 3상태/실행 드롭다운/상세 화면/업로드·카메라·폴더 UI 요구를 대체한다. 내부 구버전 기록과 백업은 호환 보존하며 개인 데이터는 변환/삭제하지 않는다. 실제 첨부 bytes/호스트 AI 수용 전에는 자동 저장/인식 완료를 주장하지 않는다.

- 0.1.4 UX-007/008: calendar selection affects only the lower record carousel (historical achievements first, photos after). Reclick selected past date returns to today. Today checklist/metrics stay independent. Add/remove tasks from today onward with versioned goal-set history and backup compatibility; retain checks on removal.

- 0.1.5 UX-009: prioritize the smaller default laptop Codex window. Max width 760px, compact header/rows/spacing, no heatmap legend, height-responsive uncropped photos. Validate page fit at 720x540 and 600x480 with long lists/portrait photos/six-week calendars; actual Mac/Codex window acceptance remains separate.


- 0.1.6 UX-010..013: all scroll views use ScrollArea composition + scrollbar-gutter:stable (root/textarea same policy). Reuse TaskForm for add/edit; edit icon immediately before removal, completion/target-count wording, equal input height and separate cancel area. Edit from today onward; retain history and same-type counts; reset today progress on control-type changes and invalidate stale check versions.
- Profile is read-only identity + autosaved personal info/free goal. Preserve queued drafts under serialized versioned saves and expose conflicts; remove manual target/timezone inputs. Sync explicit browser timezone without shifting historical dates. Calculate maintenance reference values with documented assumptions; never infer a deficit from vague free text. Alarm recurrence/claims are local open-app only, durable at-most-once claims are not proof of delivery. See docs/requirements/UX.md and VALIDATION.md.


- 0.1.7 / UX-014: Fitlog is for non-developers. Product copy must use familiar language; remove technical host/model/API terms, redundant save-success text and explanatory clutter. Explain local storage and AI assistance accurately without claiming automatic permanent AI memory. Keep actionable failure/retry information.
- Use four rounded nutrition cards with recommended carb/fat values distinct from legacy upper limits. Keep calculation assumptions/sources in requirements/UX.md; do not silently repurpose max fields. AlarmRow shows compact recurrence/time summaries; edit through shared anchored InlinePopover, bordered name field and rounded active/inactive button. No leading dropdown or always-visible weekday grid. Remove PC OS notification permission/delivery; mobile delivery remains later work. Preserve quiet autosave, history, stable scroll gutters and explicit actual-host acceptance boundaries.


## 제품화 필수 작업 4축 · 2026-10-11 사용자 승인 범위
1. **사용자 경험**: 사용자가 실제로 다듬는 요구를 번호화하고 UI·상태·접근성·반응형 수용 기준으로 연결한다. 에이전트는 승인된 개선과 회귀 검증을 수행하고 사용자는 실제 사용감을 평가한다.
2. **권한**: 개발자의 공식 UI/기능 수정·배포 권한과 이용자의 자기 기록·작업·프로필·알림 관리 범위를 구분한다. 로컬/서버/클라우드 여부와 무관하게 데이터 소유·읽기/쓰기/삭제·기기/파일 접근·AI 전송 권한을 명시한다. UI 숨김을 권한 검증으로 보지 않는다. 현재 Fitlog는 단일 로컬 사용자이며 로그인/RBAC는 미구현이다. 로컬 컴퓨터 소유자의 파일 수정을 막는다고 주장하지 않는다. 다중 사용자/공유가 적용되기 전 도구·데이터 계층의 소유권 검증, 거부/철회·타인 ID 접근 음성 테스트가 필요하다. 권한 설계/구현은 후속 범위이며 새 인증/클라우드 도입을 자동 승인하지 않는다.
3. **도움말**: 작업을 방해하지 않는 화면 도움말과 채팅/MCP 사용법을 제공한다. 공통 원본에서 지원·호스트 의존·예정 기능을 구분하고 오류·제한·권한도 안내한다. 설명의 정확성·발견성·키보드 조작을 검증한다.
4. **테스트 코드와 시나리오**: 요구 ID → 사전 조건/입력 → 기대 도구 호출·저장 상태·출력·화면 → 자동 테스트 경로 → 실행 근거/미검증을 연결한다. 단위·DB·실제 MCP 통합·앱 UI·실제 AI 채팅·실제 대상 호스트를 구분한다. PC/모바일, 상태 전이/최신화, 첨부·인식·저장·재조회, 권한 거부, 오류/충돌/재시도/복구를 포함한다. 미지원 흐름은 실패를 감추지 말고 명확한 제한 안내를 수용 기준으로 둔다.

전이 운영: 구체화에서 위 4축의 범위·담당·수용 기준을 정하고, MVP에서 핵심 코드/테스트/지원 한계를 만든다. 제품화에서는 실패 시나리오·실제 통합·회귀 코드와 근거를 보강한다. 출시/Analytics 전에는 핵심 시나리오 실제 대상 환경 통과와 권한/데이터 유실/핵심 흐름 차단 해소를 확인한다. 각 축에 적용 여부·담당·환경/버전·통과/실패/미검증·근거·이월 결정을 기록한다. 문서 작성·에뮬레이터 통과만으로 Linear 상태를 이동하지 않는다.

Read docs/TESTING.md for numbered scenarios and evidence levels. UI/MCP help must share src/domain/help.ts. Update tests and requirements with meaningful behavior changes; do not invent host/AI/mobile acceptance from mocks. UX-015 supersedes the old title+config-only header: put help immediately left of config.

0.1.9 / UX-017·018 supersedes UX-015 simultaneous help cards. Guide one anchored bubble at a time in the user-defined feature order; never cover the active feature, keep multi-page callout geometry fixed, use enter/exit animation and reduced-motion handling. Shared helpTour.ts feeds UI and get_help. First-use hint is a local UI preference, not account tracking. Alarm settings are always expanded; restore pre-tour settings/scroll/focus without data writes. See requirements/UX.md and TESTING.md.

## 단계 자동 전이 · 2026-10-11 최신 사용자 승인
사용자가 ‘Linear MVP, 제품화 단계로 넘어갔다면 말 안 해도 옮기고, 부족하다면 근거를 제시’하도록 명시했다. 합의된 범위의 MVP/제품화 단계는 기존/현재 승인과 실제 진입·완료 기준이 충족되면 별도 재확인 없이 에이전트가 최신 상태/동시 변경을 읽고 전이·재조회·근거 기록까지 수행한다. 충족되지 않으면 현재 단계, 완료 근거, 핵심 부족 근거, 다음 검증, 후속 범위와 차단 범위를 구분해 보고한다. 문서 작성만으로 보류하거나 이미 받은 전이 승인을 다시 묻지 않는다. 실제 핵심 미검증은 완료로 꾸미지 않는다. 새로운 배포/비용/공유/파괴적 변경 등 합의 범위 밖 영향은 별도 승인 범위를 확인한다.


## 0.1.10 / UX-019 · 클라우드 추천 요청
Read docs/CLOUD-DESIGN.md for the user's cross-device persistence request, current local SQLite/photo storage, numbered cloud requirements, recommendation and unverified scope. The latest request authorizes investigation/design; it does not enable paid infrastructure or migrate personal health data. Do not imply that Codex login supplies Fitlog storage/authentication, or that mobile plugin support follows automatically from remote storage. Preserve existing transition authorization and separate the cloud follow-up from the original MVP gate.
Help must show full text without an inner scroll view. Keep modal background scrolling locked with stable gutters, reserve same-group geometry, avoid close/target collisions, restore scrolling on exit, and test real browser geometry and wheel behavior (E2E-13).
