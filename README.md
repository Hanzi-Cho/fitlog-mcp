# Fitlog MCP

Codex 내부에서 운동·식단을 기록하고 실천 이력을 확인하는 1인 로컬 MCP App.

**현재: MVP 코드와 개인용 설치 완료. 실제 호스트 최종 인수 및 클라우드 알림 등록 대기.** 완료/미검증 범위는 [검증 기록](docs/VALIDATION.md)을 확인하세요.

- [기능별 UX 요구사항·수용 기준](docs/requirements/UX.md)
- [Linear 프로젝트·단계 전이·현재 구성](docs/PROJECT.md)
- [Changelog](CHANGELOG.md)
- [승인 설계](docs/DESIGN.md)
- [dots·알림 요구사항](docs/REMINDERS.md)
- [Codex 설치](integrations/codex/README.md)
- [Linear 명세](https://linear.app/hanzicho/document/0a988e811461)

## 실행

Node 24.13 이상 25 미만, pnpm 11.25.0 필요.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
node scripts/prepare-plugin.mjs
```

테스트는 임시 합성 DB를 사용합니다. 실제 Codex 화면·모바일 푸시 시험을 대체하지 않습니다.

## 기능

프로필, 운동·식단 CRUD, 누적/현재/최장 연속 기록일, 월·연간 잔디, 최근 7/30일 리뷰 데이터, JSON 백업/복구를 제공합니다. 채팅에서 “Fitlog 대시보드를 열어줘”라고 요청하세요. 화면에서도 날짜를 선택해 기록하고 기록 제목을 눌러 수정할 수 있습니다.

같은 요청 재시도는 중복 저장하지 않고 오래된 버전 수정은 충돌로 거부합니다. 같은 날짜에 여러 건을 기록해도 기록일은 하루입니다. 시간대를 바꿔도 과거 날짜를 바꾸지 않습니다.

고정 알림 기본값은 매일 Asia/Seoul 21:00 식단 리뷰 안내입니다. **로컬 설정 저장은 실제 예약 등록이 아닙니다.** UI의 “채팅에서 알림 등록 요청”으로 호스트에 요청하고 실제 저장된 예약을 확인해야 합니다. dots 또는 지원되는 ChatGPT 클라우드 예약 기능을 사용합니다. 모바일 푸시는 계정·휴대폰 권한에 따릅니다. 별도 알람 서버/앱은 없습니다.

추가 구현: 끼니/운동의 목표 준수 ✓/X/미작성과 실행 상태, 날짜별 로컬 사진 이미지북, 사용자 영양 목표, 호스트 AI 지원 시 사진 분석·목표 초안, 앱 내 끼니 확인 알림과 선택 폴더의 새 음식 사진 가져오기. 실제 호스트 AI·카메라·폴더 권한·OS 알림 수용은 미검증입니다. 폴더 확인과 앱 내 알림은 화면이 열려 있을 때 동작합니다. 체중 기록·Claude 호환·클라우드 DB 동기화·앱 종료 후 사진함 접근은 후속입니다.

## 데이터와 백업

기본 저장 위치: Windows `%LOCALAPPDATA%/FitlogMcp`, 다른 환경 `~/.local/share/FitlogMcp`. `FITLOG_DATA_DIR`로 바꿀 수 있습니다. 최초 실행에는 합성 데이터 없이 빈 기록으로 시작합니다.

```sh
node dist/backup.mjs export <새로운-백업파일.json>
node dist/backup.mjs import <백업파일.json>
```

export는 기존 파일을 덮어쓰지 않습니다. import는 현재 기록을 대체하므로 대상 폴더를 확인하세요. 검증 후 트랜잭션으로 적용하며 대체 전 현 상태를 데이터 폴더의 `backups/`에 보존합니다. 50 MiB 초과/미지원 스키마/중복 ID/잘못된 날짜는 거부합니다. 과거 백업에는 삭제한 기록이 남을 수 있습니다.

개인 기록·DB·백업·토큰은 Git에 넣지 않습니다. MCP로 조회한 내용은 Codex 모델 처리에 전달됩니다. 앱 수준 암호화는 제공하지 않습니다.

## 구조

- `src/contracts`: 공유 스키마·공개 오류
- `src/domain`: 날짜·기록일·연속일 계산
- `src/application`: 기록·프로필·리뷰·알림 요청·백업
- `src/infrastructure`: SQLite 연결/스키마·repository
- `src/mcp`, `src/cli`: 호스트 도구·백업 명령
- `ui/src`: 실제 MCP Apps UI
- `ui/preview.*`, `src/probe`: 합성 시안 및 연결 시험
- `scripts`, `tests`: 빌드·개인용 패키지 생성·검증
