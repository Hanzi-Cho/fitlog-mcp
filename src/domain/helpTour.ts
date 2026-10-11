import {helpTopics} from './help.js';
const topic=(id:string)=>helpTopics.find(t=>t.id===id)!.description;
/** Explicit product order. Multiple pages keep the same anchor and reserved geometry. */
export const helpTour=[
 {id:'progress',title:'연속 기록과 오늘 달성',selector:'.daily-metrics',side:'right',pages:['최다·현재 연속 기록은 기록을 남긴 날을 기준으로 해요. 오늘의 원형 그래프는 목표를 얼마나 달성했는지 보여줘요. 기록을 남긴 것과 목표 달성은 달라요.']},
 {id:'checklist',title:'오늘 할 일',selector:'.checklist-column',side:'left',pages:['완료한 일은 체크하고 횟수 목표는 숫자를 입력해요. 목표 횟수에 도달하면 달성으로 표시돼요. 채팅에 오늘 한 일을 짧게 말해도 기록을 도와드려요.','목록 아래의 작업 추가하기로 완료 여부 또는 목표 횟수를 정해요.','항목 옆 연필로 내용을 수정해요. 그 오른쪽 제거 버튼을 누르면 오늘부터 목록에서 빠지고 과거 기록은 남아요.']},
 {id:'calendar',title:'달력과 지난 기록',selector:'.mini-month',side:'right',pages:[topic('calendar')]},
 {id:'photos',title:'식사 이미지북',selector:'.imagebook',side:'left',pages:[topic('photos')]},
 {id:'settings',title:'프로필 및 설정',selector:'.config-button',side:'bottom',pages:['톱니바퀴를 누르면 아래에 개인정보와 알림 설정이 나타나요. 다음 설명에서 설정을 함께 살펴볼게요.']},
 {id:'profile',title:'프로필 수정',selector:'.personal-fields',side:'top',settings:true,pages:['나의 목표와 성별·나이·키·체중을 입력해요. 변경은 자동 저장되고 시간대는 컴퓨터를 따라가요.']},
 {id:'nutrition',title:'권장 영양과 운동량',selector:'.nutrition-guidance',side:'top',settings:true,pages:['개인정보를 입력하면 하루 권장 칼로리·최소 단백질·권장 탄수화물과 지방이 계산돼요. 참고 추정치이며 감량 목표만으로 섭취량을 자동으로 줄이지 않아요.','아래의 권장 운동량을 참고해 운동 목표를 정해요. 내 상황에 맞게 무리 없이 조절해 주세요.']},
 {id:'alarms',title:'알림 설정',selector:'.alarm-settings',side:'top',settings:true,pages:[topic('alarms')]},
] as const;
