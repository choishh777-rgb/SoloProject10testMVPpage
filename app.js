const DATA_ENDPOINT = ""; // Apps Script 웹앱 URL을 넣으면 응답/이벤트가 Google Sheets로 전송됩니다.
const GA_MEASUREMENT_ID = ""; // GA4 데이터 스트림의 측정 ID(G-XXXXXXXXXX)를 넣으면 GA4로도 이벤트가 전송됩니다.
const KAKAO_JS_KEY = "aa52d45f67fe34ca4ae8fc7df6663e2d"; // 카카오 개발자센터(developers.kakao.com)에서 발급받은 JavaScript 키를 넣으면 카카오톡 공유가 작동합니다.

const ATTRIBUTION_KEYS = [
  'utm_source','utm_medium','utm_campaign','utm_content','utm_term',
  'gclid','fbclid','ttclid','wbraid','gbraid'
];

function getSessionId(){
  let id = sessionStorage.getItem('solo_sid');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 's_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    sessionStorage.setItem('solo_sid', id);
  }
  return id;
}

function getVisitorId(){
  let id = localStorage.getItem('solo_vid');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem('solo_vid', id);
  }
  return id;
}

function readAttributionFromUrl(){
  const q = new URLSearchParams(location.search);
  const data = {};
  ATTRIBUTION_KEYS.forEach(k => data[k] = q.get(k) || '');
  return data;
}

function getAttribution(){
  const current = readAttributionFromUrl();
  const hasCampaign = ATTRIBUTION_KEYS.some(k => current[k]);
  if (hasCampaign) {
    sessionStorage.setItem('solo_attribution', JSON.stringify(current));
    if (!localStorage.getItem('solo_first_attribution')) localStorage.setItem('solo_first_attribution', JSON.stringify(current));
  }
  let session = {}; let first = {};
  try { session = JSON.parse(sessionStorage.getItem('solo_attribution') || '{}'); } catch (e) {}
  try { first = JSON.parse(localStorage.getItem('solo_first_attribution') || '{}'); } catch (e) {}
  const direct = { utm_source:'direct', utm_medium:'none', utm_campaign:'', utm_content:'', utm_term:'', gclid:'', fbclid:'', ttclid:'', wbraid:'', gbraid:'' };
  return { session: Object.keys(session).length ? session : (hasCampaign ? current : direct), first: Object.keys(first).length ? first : (hasCampaign ? current : direct) };
}

function initGA(){
  if (!GA_MEASUREMENT_ID || !/^G-[A-Z0-9]+$/i.test(GA_MEASUREMENT_ID)) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, { send_page_view: true });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

function initKakao(){
  if (!KAKAO_JS_KEY || typeof Kakao === 'undefined') return;
  if (!Kakao.isInitialized()) Kakao.init(KAKAO_JS_KEY);
}

async function sendToSheet(payload){
  if (!DATA_ENDPOINT) return;
  try {
    await fetch(DATA_ENDPOINT, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(payload) });
  } catch (e) { console.warn('tracking save failed', e); }
}

function baseTrackingPayload(){
  const attr = getAttribution();
  return {
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    page: location.pathname,
    page_url: location.href,
    referrer: document.referrer || '',
    userAgent: navigator.userAgent || '',
    ...attr.session,
    first_utm_source: attr.first.utm_source || '',
    first_utm_medium: attr.first.utm_medium || '',
    first_utm_campaign: attr.first.utm_campaign || '',
    first_utm_content: attr.first.utm_content || ''
  };
}

function trackEvent(eventName, params = {}){
  if (window.gtag) gtag('event', eventName, params);
  sendToSheet({ kind: 'event', eventName, ...baseTrackingPayload(), params });
}

function makeShareUrl(resultName = ''){
  const url = new URL(location.href);
  ATTRIBUTION_KEYS.forEach(k => url.searchParams.delete(k));
  url.searchParams.set('utm_source', 'result_share');
  url.searchParams.set('utm_medium', 'referral');
  url.searchParams.set('utm_campaign', 'solo_result_share');
  if (resultName) url.searchParams.set('utm_content', resultName);
  return url.toString();
}

initGA();
initKakao();
getAttribution();
trackEvent('landing_view', { screen: 'landing' });

const MASCOT_BODY = `<path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3"/>`;

const MASCOTS = {
 '관찰형|숨김형': `${MASCOT_BODY}<ellipse cx="42" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><ellipse cx="78" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><circle cx="50" cy="50" r="3.6" fill="#3B2340"/><circle cx="82" cy="50" r="3.6" fill="#3B2340"/><circle cx="51.2" cy="49" r="1.1" fill="#fff"/><circle cx="83.2" cy="49" r="1.1" fill="#fff"/><path d="M55 64 L65 64" stroke="#3B2340" stroke-width="2.2" stroke-linecap="round"/>`,
 '관찰형|조절형': `${MASCOT_BODY}<ellipse cx="42" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><ellipse cx="78" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><circle cx="47" cy="50" r="3" fill="#3B2340"/><circle cx="73" cy="50" r="3" fill="#3B2340"/><path d="M52 64 Q60 62 68 64" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M38 74 Q48 68 58 74" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M82 74 Q72 68 62 74" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '관찰형|표현형': `${MASCOT_BODY}<ellipse cx="42" cy="55" rx="8" ry="6" fill="#FF9B84" opacity="0.85"/><ellipse cx="78" cy="55" rx="8" ry="6" fill="#FF9B84" opacity="0.85"/><circle cx="46" cy="48" r="4" fill="#3B2340"/><circle cx="74" cy="48" r="4" fill="#3B2340"/><circle cx="47.3" cy="46.5" r="1.2" fill="#fff"/><circle cx="75.3" cy="46.5" r="1.2" fill="#fff"/><path d="M50 60 Q60 66 70 60" stroke="#3B2340" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M30 70 Q22 55 34 44" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M90 70 Q98 55 86 44" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '균형형|숨김형': `${MASCOT_BODY}<ellipse cx="42" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><ellipse cx="78" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><circle cx="46" cy="50" r="3.4" fill="#3B2340"/><circle cx="74" cy="50" r="3.4" fill="#3B2340"/><path d="M62 42 L70 39" stroke="#3B2340" stroke-width="2.2" stroke-linecap="round"/><path d="M50 63 Q58 60 68 63" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M92 72 Q100 78 94 86" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 80 Q32 84 40 82" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '균형형|조절형': `${MASCOT_BODY}<ellipse cx="42" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><ellipse cx="78" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><circle cx="46" cy="50" r="3.4" fill="#3B2340"/><circle cx="74" cy="50" r="3.4" fill="#3B2340"/><path d="M50 63 Q60 68 70 63" stroke="#3B2340" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M28 76 Q10 76 8 62" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M92 76 Q110 76 112 62" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '균형형|표현형': `<path d="M45 20 C40 12 28 12 24 20 C20 28 26 34 45 46 C64 34 70 28 66 20 C62 12 50 12 45 20 Z" fill="#D85A30" opacity="0.85"/>${MASCOT_BODY}<ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><circle cx="46" cy="49" r="3.8" fill="#3B2340"/><circle cx="74" cy="49" r="3.8" fill="#3B2340"/><circle cx="47.4" cy="47.4" r="1.3" fill="#fff"/><circle cx="75.4" cy="47.4" r="1.3" fill="#fff"/><path d="M48 62 Q60 70 72 62" stroke="#3B2340" stroke-width="2.8" fill="none" stroke-linecap="round"/><path d="M30 78 Q20 80 16 90" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M90 78 Q100 80 104 90" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '직진형|숨김형': `${MASCOT_BODY}<ellipse cx="42" cy="60" rx="6" ry="4" fill="#FF9B84" opacity="0.5"/><ellipse cx="78" cy="60" rx="6" ry="4" fill="#FF9B84" opacity="0.5"/><circle cx="46" cy="50" r="9" fill="#3B2340"/><circle cx="74" cy="50" r="9" fill="#3B2340"/><line x1="55" y1="49" x2="65" y2="49" stroke="#3B2340" stroke-width="2.4"/><path d="M50 66 Q60 71 70 66" stroke="#3B2340" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M90 80 Q104 78 106 64" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '직진형|조절형': `${MASCOT_BODY}<ellipse cx="42" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><ellipse cx="78" cy="55" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><path d="M40 47 L52 44" stroke="#3B2340" stroke-width="2.4" stroke-linecap="round"/><path d="M68 44 L80 47" stroke="#3B2340" stroke-width="2.4" stroke-linecap="round"/><circle cx="46" cy="51" r="3.2" fill="#3B2340"/><circle cx="74" cy="51" r="3.2" fill="#3B2340"/><path d="M52 64 L68 64" stroke="#3B2340" stroke-width="2.4" stroke-linecap="round"/><rect x="86" y="62" width="20" height="26" rx="2" fill="#fff" stroke="#3B2340" stroke-width="2.4"/><line x1="90" y1="70" x2="102" y2="70" stroke="#3B2340" stroke-width="1.6"/><line x1="90" y1="76" x2="102" y2="76" stroke="#3B2340" stroke-width="1.6"/><line x1="90" y1="82" x2="98" y2="82" stroke="#3B2340" stroke-width="1.6"/><path d="M78 70 Q84 68 86 66" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`,
 '직진형|표현형': `<path d="M60 16 C56 9 47 9 44 15 C41 22 46 27 60 36 C74 27 79 22 76 15 C73 9 64 9 60 16 Z" fill="#D85A30"/>${MASCOT_BODY}<ellipse cx="42" cy="58" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="58" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><path d="M46 48 C43 45 38 45 37 49 C36 53 40 55 46 59 C52 55 56 53 55 49 C54 45 49 45 46 48 Z" fill="#3B2340"/><path d="M74 48 C71 45 66 45 65 49 C64 53 68 55 74 59 C80 55 84 53 83 49 C82 45 77 45 74 48 Z" fill="#3B2340"/><path d="M46 66 Q60 78 74 66" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M28 74 Q14 70 10 58" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M92 74 Q106 70 110 58" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>`
};

function renderMascot(key){
  const svg = `<svg viewBox="0 0 120 110" role="img" aria-label="${key.split('|').join(' ')} 몽글이 캐릭터">${MASCOTS[key]}</svg>`;
  $('#resultMascot').innerHTML = `<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="${key.split('|').join(' ')} 몽글이 캐릭터">${MASCOTS[key]}</svg>`;
  $('#shareMascot').innerHTML = svg;
}

const questions = [
 {id:'Q1',axis:'X',text:'친구 모임에서 딱 내 스타일인 사람이 나타났다. 아직 서로 말도 안 해봤다. 나는—',choices:['어떤 사람인지 일단 지켜본다.','자연스럽게 같은 대화에 끼어들 기회를 찾아본다.','타이밍이 생기면 내가 먼저 말을 건다.','마음에 들었으면 굳이 기다리지 않고 바로 말을 건다.']},
 {id:'Q2',axis:'X',text:'어제까지 잘 연락하던 사람이 오늘 하루 종일 먼저 연락이 없다. 나는—',choices:['나도 먼저 연락하지 않고 기다린다.','오늘은 두고 내일까지 조금 더 지켜본다.','저녁쯤 별일 없다는 듯 가볍게 먼저 말을 건다.','궁금하면 굳이 기다리지 않고 내가 먼저 연락한다.']},
 {id:'Q3',axis:'X',text:'소개팅이 끝났다. 집에 가는 길인데 오늘 생각보다 꽤 괜찮았다. 나는—',choices:['상대가 먼저 연락하는지 기다려본다.','헤어질 때 “다음에 또 봐요” 정도로 여지를 남긴다.','집에 가서 “잘 들어갔어요?”라고 내가 먼저 연락한다.','헤어지기 전에 다음에 언제 볼지 구체적으로 얘기해본다.']},
 {id:'Q4',axis:'X',text:'마음에 드는 사람이 “이번 주말엔 딱히 할 것도 없네”라고 말했다. 나는—',choices:['그냥 그런가 보다 하고 넘어간다.','“나도 별거 없는데” 정도로만 슬쩍 말해본다.','“그럼 뭐라도 할래?” 하고 가볍게 던져본다.','“토요일 어때?” 하며 날짜나 할 일을 바로 제안한다.']},
 {id:'Q5',axis:'X',text:'연락도 하고 몇 번 만나기도 했는데, 관계가 계속 애매하다. 나는—',choices:['굳이 정의하지 않고 자연스럽게 흘러가는 걸 본다.','상대가 어떻게 행동하는지 조금 더 지켜본다.','“우리 요즘 어떤 사이 같아?” 정도로 슬쩍 물어본다.','애매한 상태가 길어지면 내가 먼저 관계를 분명히 하려고 한다.']},
 {id:'Q6',axis:'Y',text:'친구가 갑자기 “너 걔 좋아하는 거 다 티 나”라고 한다. 나는—',choices:['“무슨 소리야” 하며 바로 부인한다.','그냥 웃으면서 말을 돌린다.','“조금 그런가?” 정도로 살짝 인정한다.','“헐, 그렇게 티 나?” 하며 사실상 인정한다.']},
 {id:'Q7',axis:'Y',text:'좋아하는 사람이 “나 보고 싶었어?”라고 장난스럽게 묻는다. 나는—',choices:['“아니?” 하고 장난으로라도 부정한다.','“글쎄~” 하며 애매하게 넘긴다.','“조금?” 하고 웃으며 인정한다.','“응, 보고 싶었지”라고 자연스럽게 말한다.']},
 {id:'Q8',axis:'Y',text:'상대가 약속시간에 늦었는데 별다른 설명도 없다. 솔직히 조금 서운하다. 나는—',choices:['티 내지 않고 그냥 넘어간다.','표정이나 말투에는 조금 묻어나지만 직접 말하진 않는다.','“나 좀 기다렸어” 정도로 가볍게 표현한다.','“아무 말 없이 늦어서 좀 서운했어”라고 솔직하게 말한다.']},
 {id:'Q9',axis:'Y',text:'데이트가 끝나고 집에 왔다. 오늘 정말 즐거웠다. 나는—',choices:['좋았어도 평소처럼 짧게 연락한다.','“잘 들어갔어?” 정도로만 연락하고 감정 표현은 아낀다.','“오늘 진짜 재밌었어”라고 솔직하게 말한다.','“오늘 너무 좋았고 또 보고 싶어”처럼 느낀 감정을 충분히 표현한다.']},
 {id:'Q10',axis:'Y',text:'이제 서로 호감이 있다는 건 거의 확실하다. 그 뒤 내 모습은—',choices:['마음은 커져도 겉으로 보이는 모습은 크게 달라지지 않는다.','전보다 편해지지만 표현은 여전히 조심스럽게 한다.','보고 싶다거나 좋다는 말을 자연스럽게 조금씩 늘린다.','좋으면 좋다, 보고 싶으면 보고 싶다고 확실히 표현한다.']}
];

const results = {
 '관찰형|숨김형':{name:'조용한 저격수',def:'좋아해도 티 안 나는 척하지만, 상대가 한 말은 이상하게 다 기억하고 있는 타입.',traits:['좋아하는 사람 앞에서 오히려 더 무심한 척한다','상대의 말 한마디, 표정 변화를 오래 곱씹는다','먼저 연락하느니 그냥 기다리는 쪽을 택한다'],sting:'연락을 먼저 하지는 않으면서, 상대가 먼저 안 오면 은근히 서운해하는 편.',strength:'상대를 관찰하는 눈이 예리해서 미묘한 신호도 잘 캐치함.',share:'좋아하는 티 안 내려는데, 상대가 보낸 말은 이상하게 다 기억하고 있어요.'},
 '관찰형|조절형':{name:'신중한 탐색가',def:'확신이 서기 전까지는 절대 먼저 움직이지 않는, 계산된 신중함의 소유자.',traits:['상대의 마음을 어느 정도 확인한 뒤에야 표현을 시작한다','관계의 다음 단계를 넘어가기 전에 머릿속으로 여러 번 시뮬레이션한다','감정보다 상황 판단이 먼저 작동한다'],sting:'안전하다는 확신이 들 때까지 마음을 최대한 숨기다가, 타이밍을 놓치는 경우가 많음.',strength:'성급하게 상처받거나 상처 주는 일이 적음.',share:'확신이 서기 전까지는 절대 먼저 안 움직이는 타입.'},
 '관찰형|표현형':{name:'티나는 신중러',def:'좋아하는 티 안 내려고 노력하는데, 정작 답장 속도에서 다 티가 나는 타입.',traits:['먼저 다가가진 않지만, 대화가 시작되면 반응이 빠르고 솔직해진다','감정을 숨기려 해도 표정이나 텍스트 톤에서 드러난다','관계 초반엔 신중하지만 마음이 열리면 급격히 편해진다'],sting:'안 좋아하는 척하다가 리액션에서 다 들킴.',strength:'숨기려는 노력과 별개로 솔직함이 있어서 상대가 진심을 느끼기 쉬움.',share:'좋아하는 티 안 내려는데, 답장 속도에서 다 들키는 타입.'},
 '균형형|숨김형':{name:'은근한 밀당러',def:'적당히 다가가고 적당히 물러서는데, 본인도 그게 밀당인지 잘 모름.',traits:['너무 적극적이지도, 너무 소극적이지도 않게 조절한다','감정을 잘 드러내지 않아서 주변에서 속마음을 궁금해한다','관계의 온도를 무의식적으로 맞춘다'],sting:'의도한 밀당이 아닌데 상대는 밀당이라고 오해하는 경우가 많음.',strength:'관계에 안정적인 리듬을 만드는 능력.',share:'밀당할 생각 없는데 은근히 밀당러 소리 듣는 타입.'},
 '균형형|조절형':{name:'페이스 조율러',def:'관계의 속도를 상대에 맞춰 조율하는, 가장 균형 잡힌 타입.',traits:['상대의 반응 속도를 보고 나의 속도를 조정한다','감정 표현도 상황에 맞게 강약을 조절한다','극단적인 선택보다 안정적인 흐름을 선호한다'],sting:'너무 맞추다 보면 정작 내가 원하는 속도를 잃어버릴 때가 있음.',strength:'관계를 오래, 안정적으로 유지하는 데 강함.',share:'상대 속도에 맞추다가 내 속도를 까먹은 적 있는 사람.'},
 '균형형|표현형':{name:'솔직한 설렘러',def:'무리하게 밀어붙이진 않지만, 마음이 생기면 숨기지 않고 표현하는 타입.',traits:['좋아하는 감정을 자연스럽게 드러낸다','극적인 액션보다 꾸준한 관심 표현을 선호한다','상대의 반응을 존중하면서도 내 마음을 감추지 않는다'],sting:'솔직함이 때로는 상대에게 부담으로 느껴질 수 있음.',strength:'오해를 만들지 않는 투명한 소통.',share:'좋아하면 굳이 숨기지 않는, 제일 솔직한 타입.'},
 '직진형|숨김형':{name:'쿨한 척 적극파',def:'행동은 빠른데, 감정은 절대 티 안 내려는 모순적인 타입.',traits:['마음이 생기면 먼저 연락하고 약속을 잡는다','그러면서도 “그냥 심심해서”라는 식으로 감정을 숨긴다','상대가 먼저 마음을 표현하면 오히려 당황한다'],sting:'행동은 다 해놓고 마음은 숨기니까, 상대가 헷갈려함.',strength:'관계를 실제로 앞으로 이끄는 실행력.',share:'행동은 직진, 마음은 비밀. 상대는 매번 헷갈려함.'},
 '직진형|조절형':{name:'계획형 직진러',def:'마음을 먹으면 움직이지만, 그 전에 이미 다 계산해놓은 전략가형.',traits:['관계를 진전시킬 타이밍을 스스로 계획한다','감정 표현도 즉흥적이지 않고 적절한 순간을 고른다','목표가 생기면 흔들림 없이 나아간다'],sting:'계획대로 안 풀리면 유독 스트레스를 받음.',strength:'관계에 방향성과 목적의식이 뚜렷함.',share:'마음도 계획 세워서 움직이는 전략가 타입.'},
 '직진형|표현형':{name:'직진 감정러',def:'마음이 생기면 숨기는 것보다 보여주는 쪽을 택하는, 가장 솔직하고 빠른 타입.',traits:['호감을 느끼면 바로 연락하고 표현한다','좋아하는 마음을 굳이 숨기지 않는다','관계의 다음 단계를 먼저 제안하는 편이다'],sting:'상대의 속도까지 내 속도라고 착각할 때가 있음.',strength:'관계에 확실한 추진력과 에너지를 만듦.',share:'마음 생기면 숨기는 것보다 보여주는 쪽. 제일 빠른 타입.'}
};

const mascots = {
 '관찰형|숨김형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="곁눈질하며 웃는 조용한 저격수 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/>
  <path d="M40 48 Q46 45 52 48" stroke="#3B2340" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M64 48 Q70 45 76 48" stroke="#3B2340" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M52 62 Q58 65 64 61" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M32 72 Q22 66 24 56" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M88 72 Q98 68 96 58" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '관찰형|조절형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="돋보기를 들고 신중하게 살펴보는 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/>
  <circle cx="46" cy="50" r="3" fill="#3B2340"/><circle cx="74" cy="50" r="3" fill="#3B2340"/>
  <path d="M52 64 L68 64" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M84 62 Q98 60 100 48" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="104" cy="38" r="10" fill="#FFF7EE" stroke="#3B2340" stroke-width="3"/>
  <line x1="111" y1="45" x2="118" y2="53" stroke="#3B2340" stroke-width="4" stroke-linecap="round"/>
  <path d="M36 70 Q26 74 24 84" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '관찰형|표현형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="놀라서 볼을 감싸는 티나는 신중러 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="8" ry="6" fill="#FF9B84" opacity="0.85"/><ellipse cx="78" cy="55" rx="8" ry="6" fill="#FF9B84" opacity="0.85"/>
  <circle cx="46" cy="48" r="4" fill="#3B2340"/><circle cx="74" cy="48" r="4" fill="#3B2340"/>
  <circle cx="47.5" cy="46.5" r="1.2" fill="#fff"/><circle cx="75.5" cy="46.5" r="1.2" fill="#fff"/>
  <ellipse cx="60" cy="64" rx="5" ry="6" fill="#3B2340"/>
  <path d="M28 66 Q20 56 26 46" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M92 66 Q100 56 94 46" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '균형형|숨김형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="한쪽 눈썹 올리며 팔짱 낀 은근한 밀당러 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/>
  <circle cx="46" cy="50" r="3.4" fill="#3B2340"/><circle cx="74" cy="50" r="3.4" fill="#3B2340"/>
  <path d="M68 42 Q74 38 80 41" stroke="#3B2340" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M52 64 Q60 66 68 62" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M30 68 Q45 78 58 70" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M90 68 Q75 78 62 70" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '균형형|조절형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="양팔을 균형있게 벌린 페이스 조율러 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/>
  <circle cx="46" cy="50" r="3.4" fill="#3B2340"/><circle cx="74" cy="50" r="3.4" fill="#3B2340"/>
  <path d="M50 63 Q60 68 70 63" stroke="#3B2340" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M28 66 Q18 62 16 52" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M92 66 Q102 62 104 52" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '균형형|표현형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="활짝 웃으며 팔을 벌린 솔직한 설렘러 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.8"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.8"/>
  <circle cx="46" cy="49" r="3.6" fill="#3B2340"/><circle cx="74" cy="49" r="3.6" fill="#3B2340"/>
  <path d="M48 62 Q60 72 72 62" stroke="#3B2340" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M26 64 Q14 58 12 46" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M94 64 Q106 58 108 46" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M100 24 L102 30 L108 32 L102 34 L100 40 L98 34 L92 32 L98 30 Z" fill="#FFC857" stroke="#3B2340" stroke-width="1.2"/>
 </svg>`,
 '직진형|숨김형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="선글라스 쓰고 엄지 척하는 쿨한 척 적극파 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="58" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/><ellipse cx="78" cy="58" rx="6" ry="4" fill="#FF9B84" opacity="0.6"/>
  <rect x="36" y="44" width="18" height="9" rx="4" fill="#3B2340"/><rect x="66" y="44" width="18" height="9" rx="4" fill="#3B2340"/>
  <line x1="54" y1="47" x2="66" y2="47" stroke="#3B2340" stroke-width="2.4"/>
  <path d="M52 64 Q60 66 68 64" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M96 70 Q108 66 110 56" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="112" cy="52" r="4" fill="#FFD8C2" stroke="#3B2340" stroke-width="2.4"/>
  <path d="M28 70 Q18 74 22 84" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '직진형|조절형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="체크리스트를 든 계획형 직진러 몽글이">
  <path d="M60 98 C30 78 16 55 24 36 C29 21 48 17 60 34 C72 17 91 21 96 36 C104 55 90 78 60 98 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/><ellipse cx="78" cy="55" rx="7" ry="5" fill="#FF9B84" opacity="0.75"/>
  <circle cx="46" cy="50" r="3.4" fill="#3B2340"/><circle cx="74" cy="50" r="3.4" fill="#3B2340"/>
  <path d="M53 64 L67 64" stroke="#3B2340" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M90 68 Q100 62 100 52" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
  <rect x="94" y="30" width="18" height="24" rx="2" fill="#FFF7EE" stroke="#3B2340" stroke-width="2.4"/>
  <path d="M98 38 L101 41 L107 34" stroke="#3B2340" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="98" y1="47" x2="108" y2="47" stroke="#3B2340" stroke-width="1.8"/>
  <path d="M30 70 Q20 74 22 84" stroke="#3B2340" stroke-width="3" fill="none" stroke-linecap="round"/>
 </svg>`,
 '직진형|표현형':`<svg width="120" height="110" viewBox="0 0 120 110" role="img" aria-label="하트 눈으로 팔 벌리고 달려오는 직진 감정러 몽글이">
  <path d="M60 100 C28 80 14 56 24 37 C30 22 50 18 60 36 C70 18 90 22 96 37 C106 56 92 80 60 100 Z" fill="#FFD8C2" stroke="#3B2340" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="42" cy="57" rx="8" ry="6" fill="#FF9B84" opacity="0.85"/><ellipse cx="78" cy="57" rx="8" ry="6" fill="#FF9B84" opacity="0.85"/>
  <path d="M46 48 C44 45 39 45 39 49 C39 52 46 56 46 56 C46 56 53 52 53 49 C53 45 48 45 46 48 Z" fill="#3B2340"/>
  <path d="M74 48 C72 45 67 45 67 49 C67 52 74 56 74 56 C74 56 81 52 81 49 C81 45 76 45 74 48 Z" fill="#3B2340"/>
  <path d="M48 64 Q60 74 72 64" stroke="#3B2340" stroke-width="2.8" fill="none" stroke-linecap="round"/>
  <path d="M24 70 Q10 62 8 48" stroke="#3B2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M96 70 Q110 62 112 48" stroke="#3B2340" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <path d="M4 30 L14 30 M2 40 L12 42" stroke="#3B2340" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
 </svg>`
};

let idx = 0;
const answers = [];
const $ = s => document.querySelector(s);

function show(id){
  document.querySelectorAll('.screen').forEach(x => x.classList.remove('active'));
  $(id).classList.add('active');
}

function render(){
  const q = questions[idx];
  $('#progressBar').style.width = `${((idx + 1) / questions.length) * 100}%`;
  $('#progressText').textContent = `${idx + 1} / ${questions.length}`;
  $('#axisPill').textContent = q.axis === 'X' ? '행동성 · 관찰 ↔ 직진' : '감정표현 · 숨김 ↔ 표현';
  $('#questionText').textContent = q.text;
  $('#choices').innerHTML = '';
  q.choices.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'choice-btn';
    b.innerHTML = `<span class="choice-letter">${String.fromCharCode(65 + i)}</span><span>${c}</span>`;
    b.onclick = () => select(i + 1);
    $('#choices').appendChild(b);
  });
  trackEvent('question_reached', { question_number: idx + 1, question_id: q.id, axis: q.axis });
}

function select(score){
  answers[idx] = score;
  if (idx < questions.length - 1) { idx++; render(); }
  else finish();
}

function classify(s){ return s <= 9 ? 0 : s <= 14 ? 1 : 2; }

function finish(){
  const x = answers.slice(0, 5).reduce((a, b) => a + b, 0);
  const y = answers.slice(5).reduce((a, b) => a + b, 0);
  const xs = ['관찰형', '균형형', '직진형'][classify(x)];
  const ys = ['숨김형', '조절형', '표현형'][classify(y)];
  const r = results[`${xs}|${ys}`];

  $('#resultType').textContent = r.name;
  renderMascot(`${xs}|${ys}`);
  $('#resultDefinition').textContent = r.def;
  $('#xLabel').textContent = xs;
  $('#yLabel').textContent = ys;
  $('#xScore').textContent = `${Math.round((x - 5) / 15 * 100)}%`;
  $('#yScore').textContent = `${Math.round((y - 5) / 15 * 100)}%`;
  $('#traits').innerHTML = r.traits.map(t => `<li>${t}</li>`).join('');
  $('#sting').textContent = r.sting;
  $('#strength').textContent = r.strength;
  $('#shareType').textContent = r.name;
  $('#shareLine').textContent = r.share;

  show('#result');
  trackEvent('test_complete', { result: r.name, xType: xs, yType: ys });
  trackEvent('result_view', { result: r.name, xType: xs, yType: ys });
  saveResponse({ answers, x, y, xType: xs, yType: ys, result: r.name });
}

async function saveResponse(payload){
  const row = {
    kind: 'response',
    ...baseTrackingPayload(),
    ...payload
  };
  localStorage.setItem('solo_last_result', JSON.stringify(row));
  if (!DATA_ENDPOINT) return;
  try {
    await fetch(DATA_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(row)
    });
  } catch (e) { console.warn('save failed', e); }
}

$('#startBtn').onclick = () => { trackEvent('test_start', { screen: 'landing' }); idx = 0; answers.length = 0; show('#quiz'); render(); };
$('#backBtn').onclick = () => { trackEvent('quiz_back_click', { question_number: idx + 1 }); if (idx === 0) show('#landing'); else { idx--; render(); } };
$('#restartBtn').onclick = () => { trackEvent('retry_click', {}); idx = 0; answers.length = 0; show('#landing'); };
function buildShareText(type){
  const shareUrl = makeShareUrl(type);
  const text = `나는 ${type} 나왔어ㅋㅋ 너는 뭐 나오는지 해봐 👇\n${shareUrl}`;
  return { shareUrl, text };
}

$('#copyBtn').onclick = async () => {
  const type = $('#resultType').textContent;
  trackEvent('copy_link_click', { result: type });
  const { text } = buildShareText(type);
  await navigator.clipboard.writeText(text);
  alert('공유 문구를 복사했어요!');
};

$('#kakaoBtn').onclick = () => {
  const type = $('#resultType').textContent;
  const r = results[`${$('#xLabel').textContent}|${$('#yLabel').textContent}`];
  trackEvent('share_click', { result: type, method: 'kakao' });
  if (typeof Kakao === 'undefined' || !Kakao.isInitialized || !Kakao.isInitialized()) {
    alert('카카오톡 공유는 아직 설정 중이에요. 대신 링크를 복사해드릴게요!');
    $('#copyBtn').click();
    return;
  }
  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `나의 SOLO TYPE, ${type}`,
      description: r ? r.share : 'SOLO PROJECT 연애 유형 테스트',
      imageUrl: `${location.origin}/share-card-square.png?v=1`,
      link: { mobileWebUrl: makeShareUrl(type), webUrl: makeShareUrl(type) }
    },
    buttons: [{ title: '나도 테스트하기', link: { mobileWebUrl: makeShareUrl(type), webUrl: makeShareUrl(type) } }]
  });
  trackEvent('share_success', { result: type, method: 'kakao' });
};

$('#threadsBtn').onclick = () => {
  const type = $('#resultType').textContent;
  trackEvent('share_click', { result: type, method: 'threads' });
  const { text } = buildShareText(type);
  window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`, '_blank');
  trackEvent('share_success', { result: type, method: 'threads' });
};

$('#bandBtn').onclick = () => {
  const type = $('#resultType').textContent;
  trackEvent('share_click', { result: type, method: 'band' });
  const { text } = buildShareText(type);
  window.open(`https://band.us/plugin/share?body=${encodeURIComponent(text)}&route=${encodeURIComponent(location.hostname)}`, 'share_band', 'width=480,height=560');
  trackEvent('share_success', { result: type, method: 'band' });
};

$('#instaBtn').onclick = async () => {
  const type = $('#resultType').textContent;
  trackEvent('share_click', { result: type, method: 'instagram' });
  const { text } = buildShareText(type);
  await navigator.clipboard.writeText(text);
  alert('인스타그램은 앱에서만 링크 공유가 가능해요.\n문구를 복사했으니 스토리나 DM에 붙여넣어주세요!');
  trackEvent('share_success', { result: type, method: 'instagram_clipboard' });
};
