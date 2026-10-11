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

0.1.4 화면은 오늘의 체크리스트+설정 아이콘, 단일 체크박스/횟수, 연속 기록/목표 원형, 큰 월 달력, 날짜별 이미지북으로 구성합니다. 목록 아래에서 작업을 추가하고 행 옆 휴지통으로 제거합니다. 과거 날짜 선택 시 달성 내역→사진을 넘겨 보며, 같은 날짜를 다시 누르면 오늘로 돌아옵니다. 상단은 항상 오늘입니다. 프로필·영양 목표·앱 내 알림은 설정에서 변경합니다. 운동·식단 CRUD, 7/30일 리뷰, JSON 백업/복구는 MCP 도구로 제공합니다. 채팅에서 “Fitlog 대시보드를 열어줘”라고 요청하세요.

같은 요청 재시도는 중복 저장하지 않고 오래된 버전 수정은 충돌로 거부합니다. 같은 날짜에 여러 건을 기록해도 기록일은 하루입니다. 시간대를 바꿔도 과거 날짜를 바꾸지 않습니다.

고정 알림 기본값은 매일 Asia/Seoul 21:00 식단 리뷰 안내입니다. **로컬 설정 저장은 실제 예약 등록이 아닙니다.** 채팅에서 get_reminder_request로 호스트 예약을 요청하고 실제 저장된 예약을 확인해야 합니다. dots 또는 지원되는 ChatGPT 클라우드 예약 기능을 사용합니다. 모바일 푸시는 계정·휴대폰 권한에 따릅니다. 별도 알람 서버/앱은 없습니다.

사진은 이 채팅에만 첨부합니다. 호스트가 실제 첨부 bytes를 제공하면 로컬에 저장하고 AI 분석을 처리합니다. 이미지북은 식사 이름·추정 kcal·짧은 영양 피드백 pill을 표시합니다. 앱 업로드/카메라/폴더 입력 UI는 제거했습니다. 실제 Codex 첨부 전달·AI 품질·OS 알림은 미검증입니다. 체중 기록·Claude 호환·클라우드 DB 동기화는 후속입니다.

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


## 0.1.6 업데이트
하단 개인정보 자동 저장·유지 영양 추정/운동 권장, 공통 스크롤 공간, 요일/일회성/간격 알림, 작업 수정과 공통 추가/취소 폼. [번호별 요구 UX-010..013](docs/requirements/UX.md), [현재 단계](docs/PROJECT.md), [검증·제한](docs/VALIDATION.md). 설치 갱신은 integrations/codex/README.md. 실제 열린 Codex 세션의 새 카드 수용은 설치 성공과 별도다.


## 0.1.7 업데이트
비개발자가 편하게 기록하는 플러그인: 영양4개 라운드 카드와 탄수화물/지방 권장량, 조용한 자동 저장, 쉬운 보관/AI 안내. 알림 반복·시간 요약을 누르면 그 자리의 말풍선에서 수정한다. PC OS 알림 버튼/전달은 제거했고 휴대폰 알림은 후속이다. [UX-014](docs/requirements/UX.md), [검증](docs/VALIDATION.md).


## 도움말과 제품화 검증
상단 ?에서 기능별 설명을 확인하고 하나씩 닫거나 X/ESC로 전체 종료할 수 있습니다. 채팅에서도 사용법을 물어보세요. 읽기 전용 get_help는 화면과 같은 원본으로 지원 기능과 한계를 반환합니다. 제품화 필수 4축과 Linear 전이: docs/PROJECT.md, 번호별 테스트 코드/시나리오 및 도구 후보: docs/TESTING.md. 실제 실행 근거는 docs/VALIDATION.md에서 구분합니다.

0.1.9 도움말은 실제 기능을 강조하며 한 항목씩 안내합니다. 같은 기능의 설명은 1/3처럼 이어지고, X 또는 ESC로 언제든 종료할 수 있습니다. 설정 내 알림은 항상 펼쳐져 있습니다.
