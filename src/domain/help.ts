/** Public capability catalog shared by the UI and read-only MCP help. No personal data. */
export const helpTopics = [
 {id:'checklist',title:'오늘 할 일',description:'완료한 일은 체크하고, 횟수 목표는 숫자를 입력해요. 목표 횟수에 도달하면 달성으로 표시돼요. 목록 아래에서 추가하고, 각 항목 옆 연필과 삭제 버튼으로 수정·제거해요. 과거 기록은 보존돼요.'},
 {id:'progress',title:'달성과 연속 기록',description:'원형 그래프는 오늘 목표의 달성 비율이에요. 연속 기록은 기록을 남긴 날을 기준으로 해요. 기록을 남긴 것과 목표 달성은 달라요.'},
 {id:'calendar',title:'달력과 지난 기록',description:'그날 목표를 많이 달성할수록 잔디가 진해져요. 날짜를 누르면 아래에 그날의 달성 내역이 보여요. 선택한 지난 날짜를 다시 누르면 오늘로 돌아와요. 위쪽 오늘 할 일과 달성 표시는 바뀌지 않아요.'},
 {id:'photos',title:'식사 사진',description:'사진은 이 채팅에 첨부해 주세요. 저장된 사진은 그날의 이미지북에서 옆으로 넘겨 봐요. AI가 사진을 확인할 수 있을 때 음식·칼로리·영양을 추정해요. 사진만으로 목표 달성을 확정하지 않아요. 카메라 사진 자동 가져오기는 아직 지원하지 않아요.'},
 {id:'profile',title:'프로필과 목표',description:'톱니바퀴를 누르면 개인정보와 나의 목표를 수정할 수 있어요. 변경은 자동 저장돼요. 성별·나이·키·체중을 입력하면 권장 칼로리와 영양량이 계산돼요. 참고 추정치이며 감량 목표만으로 섭취량을 자동으로 줄이지 않아요.'},
 {id:'alarms',title:'알림',description:'이름·시간·반복을 눌러 수정하고 알림을 켜거나 꺼요. 화면이 열려 있을 때만 확인할 수 있어요. 앱 종료 후 알림과 휴대폰 알림은 아직 지원하지 않아요.'},
 {id:'chat',title:'채팅으로 기록하기',description:'오늘 한 일과 먹은 음식을 짧게 말해 주세요. 예정인 일은 완료로 기록하지 않아요. 먹었다는 사실과 식단 목표 달성도 구분해요. 사진을 읽거나 저장할 수 없으면 그 이유를 알려드려요. 사용법도 채팅에서 물어볼 수 있어요.'},
 {id:'permissions',title:'내 기록과 이용 범위',description:'내 작업·프로필·알림·기록을 관리할 수 있어요. 공식 화면과 기능 배포는 개발자가 관리해요. 현재는 한 사람의 컴퓨터에 저장하는 방식이며 사용자별 로그인·권한 분리는 아직 제공하지 않아요. AI가 기록을 참고하도록 요청할 수 있지만 항상 기억하거나 다른 기기에 자동 동기화하지는 않아요.'},
] as const;
export function getHelp(topic:string='all') {
 return {version:'0.1.10',topics:helpTopics.filter(t=>topic==='all'||t.id===topic),
  support:{implemented:['local_records','binary_count_goals','calendar_history','photo_storage','autosave_profile','open_app_alarms','help_overlay'],
   requiresHost:['chat_tool_selection','attachment_bytes','image_recognition'],
   planned:['role_authorization','cross_device_sync','background_mobile_notifications','camera_auto_import']},
  photoLimits:{mimeTypes:['image/jpeg','image/png','image/webp'],maxBytes:4*1024*1024},
  privacy:'Help contains no personal records. Local files remain under the computer owner’s control; official release permissions do not prevent local file editing.'};
}
