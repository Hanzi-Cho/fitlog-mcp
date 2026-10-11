# Codex 개인용 설치

저장소 루트에서 Node 24.13–24.x, pnpm 11.25.0으로 설치·빌드한다. 공개 배포 없이 이 PC에만 설치한다.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm test
node scripts/prepare-plugin.mjs
codex plugin marketplace add <repo절대경로>/.local/marketplace --json
codex plugin add fitlog@fitlog-personal --json
codex plugin list --json
```

생성기는 실행 중인 Node와 이 저장소의 dist/main.mjs 절대 경로를 개인용 mcp.json에 기록한다. .local/은 Git에서 제외된다. 현재 체크아웃을 참조하므로 폴더/Node를 옮기면 새로 생성 및 설치해야 한다. 다른 PC에서는 그 PC에서 생성한다.

최초 fitlog@fitlog-personal 0.1.0 설치 이후 2026-10-11에 0.1.2로 갱신했고 installed=true/enabled=true를 재조회했다. 중복 등록하지 말고 앱을 재시작한 후 “Fitlog 대시보드를 열어줘”라고 요청한다. open_dashboard가 실제 버전이며 open_fitlog_probe는 합성 시험용이다.

## 실제 호스트 인수

2026-10-10: `open_dashboard`의 표시 이름을 `Fitlog`로 설정하고 `openai/ui.entrypoints`에 `global`(사이드바 앱), `thread`(대화 옆 패널)를 등록했다. 설치된 패키지는 이 체크아웃의 `dist/main.mjs`를 참조한다. 앱 재시작 후 메뉴 노출을 확인해야 하며, DOTS 바로 아래의 정확한 순서나 고정 상태는 아직 검증하지 않았다. 이 등록은 채팅 상단 40% 고정 레이아웃을 구현하지 않는다.

1. 빈 상태·프로필 설정 확인.
2. 합성 운동 20분과 합성 점심을 같은 날짜에 저장. 누적 1일·운동1/식단1 및 재조회 대조.
3. 기록 제목을 눌러 수정하고 화면을 다시 열어 보존 확인.
4. 삭제 확인을 거쳐 합성 기록 제거. 잔디/지표/목록이 함께 갱신되는지 확인.
5. 좁은 화면·dark/light·키보드·오류/충돌·새 채팅 조회 확인.
6. 리뷰 버튼은 호스트 메시지 기능을 사용한다. 미지원 시 표시된 요청문을 채팅에 붙여 넣는다.

## dots와 매일 21:00 알림

매일 Asia/Seoul 21:00 식단 리뷰 안내를 클라우드 예약으로 등록한다. PC 데이터를 읽지 않는 고정 문구를 사용한다. dots 또는 해당 계정의 ChatGPT 웹 Scheduled 지원 여부를 확인한다. 로컬 Codex 자동화는 PC가 꺼져도 실행되는 클라우드 예약과 다르다.

실제 등록·변경·해제는 호스트 Scheduled에서 확인하고 기존 예약 ID를 이용해 중복을 막는다. Fitlog 설정 변경만으로 실제 예약이 바뀌지 않는다. ChatGPT와 휴대폰 OS 푸시 허용도 확인한다. 채팅 생성은 푸시 수신 증거가 아니다. 외부 알람 서비스는 만들지 않는다.

## 해제

```sh
codex plugin remove fitlog@fitlog-personal
```

플러그인 해제는 DB/백업을 지우지 않는다. 알림 예약은 호스트에서 따로 해제한다. 시험 연결도 별개이며 필요 없을 때 codex mcp remove fitlog-probe로 해제할 수 있다.
## 미니 대시보드 / PiP · 2026-10-10

사용자 요청: 채팅을 가리지 않는 가로형 약 20% 크기의 오버레이, 왼쪽 한 달 잔디, 오른쪽 넘기는 최소 정보. 사용자 확정: 기본 4개(운동·아침·점심·저녁 기록) 및 날짜 기록·리뷰.

- 기본 UI는 최대 폭 760px, 데스크톱 실측 높이 약 242px. 좁은 360px에서도 두 열 유지. 20%는 설계 의도이며 호스트 창 전체 크기에 대한 강제 비율이 아니다.
- 페이지 1: 실제 오늘 기록에서 중복 없이 산출한 4개 체크리스트. 완료 항목은 회색/취소선/체크 및 비활성. 미완료 클릭은 날짜·끼니가 채워진 기록 폼을 연다. 빈 클릭만으로 건강 기록을 생성하지 않는다.
- 페이지 2: 최다/현재 연속 기록, 오늘 기록 완료 수/4 원형 그래프. 건강 성과나 칼로리 달성 지표가 아니다.
- 페이지 3: 선택 날짜 운동·식단 건수, 날짜 상세, 최근 7일 채팅 리뷰.
- 기존 전체 대시보드의 편집·삭제·프로필·알림 설정은 전체 보기에서 이용한다.
- 처음 연결되면 호스트가 제공하는 availableDisplayModes에 pip가 있을 때만 requestDisplayMode를 요청한다. 거절/미지원이면 작은 인라인 화면을 유지하고 설명한다. 수동 오버레이 버튼도 제공한다.
- 채팅 측 기록 반영: 화면 활성 중 15초마다, 창 focus 및 새로고침 버튼으로 조회. 호스트 최종 오버레이 크기·위치·DOTS 아래 순서는 제어/검증하지 못했다.
- 실제 플러그인의 open_dashboard를 사용해야 한다. open_fitlog_probe는 별도의 합성 시험 화면이다. 앱 전체 재시작 후 Fitlog 메뉴/진입점을 확인한다.

공식 API 근거: https://developers.openai.com/plugins/reference 및 https://developers.openai.com/plugins/build/extensions

### 본 서버 연결을 찾을 수 없을 때

2026-10-10 표시 실패 신고 후 이 PC에 본 서버 `fitlog`를 명시적으로 등록했다. `codex mcp get fitlog --json`의 경로는 이 저장소 `dist/main.mjs`이며 enabled=true다. 기존 `fitlog-probe`는 시험 화면만 연다. 패키지 갱신(0.1.1)과 본 서버 직접 등록 후에는 앱을 완전히 종료·다시 실행해 본 서버 도구 `open_dashboard`가 로드됐는지 먼저 확인한다. 메뉴 자동 등록·PiP는 그 다음 단계이며 도구 발견만으로 완료로 표시하지 않는다. 향후 같은 이름의 플러그인 서버가 발견되면 중복 실행 여부를 먼저 확인한다.

## 설치 최신화 · 2026-10-11 · 0.1.2

소스 수정/빌드/GitHub 푸시와 설치본/실행 세션 갱신은 별개다. package.json의 version을 변경하고 생성기가 두 manifest에 같은 버전을 쓰도록 했다. 이번 생산 UI 리소스는 ui://fitlog/dashboard/v0.1.2.html로 구분한다.

1. pnpm typecheck, pnpm build, pnpm test 실행.
2. node scripts/prepare-plugin.mjs로 현재 버전 패키지 재생성.
3. codex plugin add fitlog@fitlog-personal --json으로 기존 설치 갱신.
4. codex plugin list --json에서 Fitlog 버전/installed/enabled, 캐시 manifest 및 MCP 실행 경로를 재조회.
5. 앱을 완전히 종료하고 다시 실행한 뒤 Fitlog를 새로 연다. 이미 열려 있는 카드나 진행 중 채팅의 이전 MCP 도구 목록은 최신 UI/서버라는 근거가 아니다. 새 생산 서버 도구 20개와 버전 UI 리소스를 확인한다.

이 과정은 건강 DB/사진/백업을 수정하지 않는다. 자동 업데이트 완료는 설치 재조회와 실제 재시작/수용을 각각 확인한 뒤 기록한다. 공식 안내: https://developers.openai.com/plugins/build/plugins#install-a-local-plugin-manually
