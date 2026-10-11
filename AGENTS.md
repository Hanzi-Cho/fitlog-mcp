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
