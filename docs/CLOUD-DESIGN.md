# 기기 간 동기화 설계 제안 · 2026-10-11

상태: 사용자 요청에 따른 조사·추천·요구 구체화. 클라우드 구현/배포/실제 개인 데이터 이전은 아직 하지 않았다. 현재 실행 버전은 로컬 저장 방식이다. 담당: 에이전트(구체안·구현·검증), 사용자(서비스/지역/비용/이전 범위 선택과 실제 PC·모바일 사용감).

## 1. 현재 저장 구조와 소실 범위

- `src/infrastructure/database.ts`: `FITLOG_DATA_DIR`가 있으면 그 경로, 없으면 Windows `%LOCALAPPDATA%/FitlogMcp/fitlog.sqlite`. 다른 OS의 기본은 `~/.local/share/FitlogMcp/fitlog.sqlite`.
- 설치된 로컬 MCP 설정은 `LOCALAPPDATA`·`USERPROFILE`을 전달한다. 플러그인 설치 캐시와 실제 기록 DB는 별도이며 Codex 계정 저장소와 연결하지 않는다.
- 달성 내역·목표 이력·프로필·알림·분석은 SQLite에 저장한다. 사진은 별도 JPG 폴더가 아니라 `journal`의 photo JSON에 base64 원본으로 저장한다(`src/application/journal.ts`). 채팅에 첨부했다고 이 DB 저장까지 보장되는 것은 아니며 사진 저장 도구 성공/재조회가 필요하다.
- 이 DB를 잃으면 사진과 기록이 함께 사라질 수 있다. 실행 중 `fitlog.sqlite`만 복사하면 WAL의 미반영 내용을 놓칠 수 있으므로 기존 앱 export/restore 또는 일관된 SQLite 백업 절차를 사용한다. DB/WAL를 OneDrive 등에 그대로 놓아 여러 기기에서 동시 수정하는 방식은 권장하지 않는다.

## 2. 권장 구성

PC 플러그인·지원되는 모바일 클라이언트 → HTTPS 원격 MCP/Fitlog API → Supabase Auth + PostgreSQL(기록) + private Storage(사진).

현재 TypeScript 도메인 계산·요구 계약·React UI를 유지하고 저장 어댑터를 분리한다. API/MCP는 관리 가능한 Node 호스팅 한 곳에 배포하는 구체안으로 시작한다. 업체/지역/요금/운영 주체는 미결정이며 현재 새 외부 서비스는 만들지 않았다.

- **CLOUD-001 · 동일 계정**: 우선 Supabase Auth의 Google 또는 이메일 인증으로 Fitlog 내부 사용자 UUID를 발급하고 PC·모바일에서 동일 계정을 사용한다. 표시 이름/이메일 문자열을 저장 소유권으로 신뢰하지 않는다. 계정 연결·복구·로그아웃·접근 철회도 설계한다.
- **CLOUD-002 · ChatGPT 로그인 확장**: OpenAI의 공식 Sign in with ChatGPT를 후보로 둔다. 현재 공식 문서는 상용 파트너 제한 시험과 오픈소스의 ChatGPT plan 사용을 구분한다. Fitlog의 배포 방식/클라이언트 등록 가능 여부를 먼저 확인한다. identity 인증이 가능해도 Fitlog DB·사진 저장소·세션·권한은 앱이 운영한다. Codex에 이미 로그인했다는 사실, 호스트 표시 이름 또는 로컬 Codex 토큰을 Fitlog 서버 인증으로 대신하지 않는다. 검증된 issuer/subject를 내부 사용자 ID에 연결하고 기존 계정 연결은 명시적 인증으로 확인한다. 이 제안에 유료 모델 API 도입은 포함하지 않는다.
- **CLOUD-003 · 데이터 분리**: records/goals/checks/profile/reminders/photos/analysis에 `owner_id`와 버전 필드를 둔다. 인증된 주체에서 소유자를 결정하고 RLS와 API 검증으로 타인 읽기/수정/삭제를 거부한다. 사진은 private bucket, `user-id/photo-id` 경로와 짧은 만료의 읽기 URL을 사용한다. 클라이언트에 service-role 키를 배포하지 않는다. 개발자 배포 권한과 이용자 자기 데이터 권한을 분리한다.
- **CLOUD-004 · 동기화와 이미지 일관성**: 서버를 원본으로 두고 버전 충돌/재시도용 idempotency key/삭제 tombstone을 적용한다. 1차는 온라인 저장 성공 후 완료 표시·재접속/다른 기기 재조회. 사진 업로드→해시/MIME/크기 확인→메타데이터 확정→분석을 상태로 분리하고 실패한 고아 객체를 정리한다. 기기 로컬 캐시 삭제는 서버 삭제로 전파하지 않는다. 오프라인 편집 큐·실시간 구독은 2차로 분리하며 저장하지 못한 기록은 성공으로 표시하지 않는다.
- **CLOUD-005 · 백업과 복구**: 클라우드 저장도 사용자 실수·계정 삭제·장애에 대한 백업을 대신하지 않는다. DB 백업/PITR와 사진 객체의 별도 백업·복구를 모두 둔다. Supabase DB 백업에는 사진 객체 원본이 포함되지 않는다. 소프트 삭제/복구 기간, 보관 한도, 백업 비용, 지역, 최종 탈퇴 삭제·백업 만료 정책은 운영 전에 확정한다. 독립 복구 시험에서 사진 해시와 기록 수까지 비교한다.
- **CLOUD-006 · 이전과 모바일**: 현재 로컬 export를 먼저 확보하고, 로그인한 소유자에게 ID/날짜/달성·분석/원본 해시를 보존해 멱등 import한다. 두 번째 기기에서 재조회·사진 표시·수정 동기화 확인 후 전환하며 원본은 검증 전 삭제하지 않는다. 모바일의 원격 MCP·앱 UI·채팅 첨부 bytes 지원을 실제 호스트에서 별도 확인한다. 모바일 호스트 제약이 있으면 동일 API를 사용하는 반응형 웹/PWA를 대안으로 제공하는 안을 검토한다. 클라우드만 만들면 기존 로컬 플러그인이 모든 휴대폰에서 실행된다고 주장하지 않는다. 기존 플러그인 이미지 입력은 채팅 첨부 정책을 유지하며 별도 모바일 업로드 UI는 후속 구체화다.

## 3. 단계와 수용 기준

1. 구체화: 인증 공급자/서버 지역·비용·백업/이전 범위/모바일 접근 경로를 확정한다. 현재 문서는 이 단계의 추천이며 실제 도입 승인이 아니다.
2. 합성 데이터 PoC: 두 계정과 두 브라우저·기기로 로그인/연결/철회, 타인 ID 접근 거부, 만료 URL 거부, 원격 MCP discovery/오류/권한을 검증한다. 현재 미구현/미검증.
3. 핵심 구현: 사진 첨부→저장→AI 분석→저장된 값 답변→PC/모바일 재조회, 체크/횟수/프로필 갱신, 동시 수정 충돌, 토큰 만료, 네트워크 실패/재시도. 실제 AI 수용은 모사 분석과 구분한다.
4. 이전·복구: 중단 후 재개/중복 없는 import, 사진·기록 해시/수 대조, 로컬 캐시 삭제 후 서버 복원, DB와 사진 동시 복구, 계정 탈퇴/철회/보관 만료를 검증한다.
5. 제품화/출시: 위 채택 범위의 실제 대상 호스트 수용을 남긴다. 기존 로컬 MVP의 차단과 새 클라우드 후속 범위를 구분하고, 증거가 충족되면 기존 자동 전이 승인에 따라 Linear 상태를 이동한다. 현재 미구현 기능을 기존 MVP 완료 기준으로 소급하지 않는다.

시나리오 추적: `TESTING.md` E2E-14. 실제 실행 근거는 `VALIDATION.md`; 클라우드 테스트 파일/실행 근거는 아직 없음.

## 4. 대안과 선택 이유

- Supabase 권장: 기존 SQLite의 관계형 기록·목표 이력을 PostgreSQL로 옮기기 쉽고 계정/행 권한/사진 저장을 한 서비스에서 구성할 수 있다. 이는 Fitlog 코드 구조에 대한 설계 판단이며 자동 마이그레이션 보장은 아니다.
- Firebase도 가능하지만 현재 관계형 이력·질의 모델을 문서 DB에 맞춰 재설계할 비용이 있다. 완전 자가 운영 PostgreSQL+객체 저장소는 제어 범위가 큰 대신 인증·백업·업데이트 운영 책임이 늘어난다. 현재 규모에는 먼저 관리형 구성을 추천한다.
- 저장 서비스와 AI 분석 호출은 별개다. 기존 호스트 AI 분석을 유지해도 클라우드 보관은 가능하며 다른 모델 서비스의 신규 비용을 전제로 하지 않는다.

## 공식 근거 · 2026-10-11 확인

- [OpenAI Sign in with ChatGPT](https://developers.openai.com/siwc/quickstart): 제한 시험·identity 범위·앱 자체 세션/권한 책임.
- [Supabase Google 로그인](https://supabase.com/docs/guides/auth/social-login/auth-google): 웹/네이티브 로그인과 등록 절차.
- [PostgreSQL RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): 사용자별 데이터 정책.
- [Private Storage](https://supabase.com/docs/guides/storage/buckets/fundamentals): 읽기 포함 접근 통제와 signed URL.
- [DB 백업의 범위](https://supabase.com/docs/guides/platform/backups): Storage 객체 원본 제외. 백업 기능/보관은 선택 요금제 확인 필요.

Linear 클라우드 후속: [HAN-9](https://linear.app/hanzicho/issue/HAN-9/제품화-구체화-계정-기반-pc모바일-동기화와-사진기록-백업) · Backlog · 설계 추천/서비스·이전 범위 미결정.
