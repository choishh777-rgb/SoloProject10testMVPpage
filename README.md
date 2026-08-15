# SOLO PROJECT 무료 연애 유형 테스트 — 웹 MVP (디자인 반영 + 유입/퍼널 추적판)

## 이번 업데이트
- 웜 피치 × 플럼 팔레트, Jua + Gothic A1 폰트로 전체 리디자인
- 마스코트 캐릭터 "몽글이" 9유형 + 랜딩 포즈 SVG로 직접 제작해 삽입
- 손그림 느낌의 낙서 장식(별, 하트, 도트) 랜딩 화면에 추가
- 문항 진행 화면에 축 표시 필, 진행바, 레터드 선택지 버튼 적용
- 점수/텍스트 컬러 시스템: 포인트 컬러는 딥 코랄, 본문·점수 숫자는 플럼으로 통일
- **GA4 + Google Sheets 이벤트 로깅 시스템 추가** (아래 "유입/퍼널 추적" 참고)

## 포함 기능
- 10문항 시나리오형 테스트 (X축 관찰↔직진 5문항 / Y축 숨김↔표현 5문항)
- 9유형 자동 분류 및 결과 페이지
- 공유 버튼 / 링크 복사 (공유 시 자체 UTM 자동 부여)
- 퍼널 단계별 이벤트 로깅 + first-touch/session 어트리뷰션 구분
- GA4 연동 (선택) + Google Sheets `events`/`responses` 시트 자동 저장 (선택)

## 가장 빠른 배포
### 프론트엔드
- GitHub Pages / Netlify / Vercel 중 아무 곳에나 `index.html`, `styles.css`, `app.js` 업로드
- 별도 빌드 과정 없음, 폰트는 Google Fonts CDN에서 자동 로드

## 유입/퍼널 추적

### 1. GA4 연결 (선택)
`app.js` 맨 위에서 값을 바꿉니다.
```js
const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
```
자동 전송되는 이벤트:
`landing_view` · `test_start` · `question_reached`(1~10) · `test_complete` · `result_view` · `share_click` · `share_success` · `share_cancel` · `copy_link_click` · `retry_click` · `quiz_back_click`

### 2. Google Sheets 원시 로그 연결 (선택)
1. 새 Google Sheet 생성
2. 확장 프로그램 > Apps Script에서 `apps-script.gs` 붙여넣기
3. `SHEET_ID`를 실제 시트 ID로 교체
4. 배포 > 새 배포 > 웹 앱 (실행 사용자: 나 / 액세스: 모든 사용자)
5. 배포 URL을 `app.js` 상단 `DATA_ENDPOINT`에 입력

자동 생성되는 시트:
- `events`: 유입/퍼널/공유 이벤트 로그 (어디서 왔는지, 몇 번 문항에서 이탈했는지)
- `responses`: 10문항 최종 응답 + 9유형 결과

### 3. UTM 링크로 채널 구분
```text
https://내도메인/?utm_source=instagram&utm_medium=reels&utm_campaign=solo_launch
https://내도메인/?utm_source=kakao&utm_medium=community&utm_campaign=solo_launch
```
`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`과 `gclid`/`fbclid`/`ttclid` 등 광고 클릭 ID, referrer, 첫 유입(first-touch) UTM, 현재 세션 UTM까지 모두 수집됩니다.

### 4. 결과 공유 유입은 자동으로 분리됩니다
결과 페이지에서 공유하면 기존 광고 UTM을 복제하지 않고 새 링크가 생성됩니다.
```text
?utm_source=result_share&utm_medium=referral&utm_campaign=solo_result_share&utm_content=페이스%20조율러
```
"광고로 처음 들어온 사람"과 "친구가 결과를 공유해서 들어온 사람"을 분리해서 볼 수 있습니다.

### 5. 추천 퍼널
`landing_view → test_start → question_reached → test_complete → result_view → share_click/share_success`

`events` 시트에서 `sessionId` 기준으로 보면 어디서 이탈했는지 확인할 수 있습니다.

## 채널별 공유 버튼 (카카오톡 / 인스타그램 / 스레드 / 밴드 / 링크복사)

결과 화면 공유 버튼이 채널별로 직접 공유되도록 분리되어 있습니다.

- **스레드, 밴드**: 별도 설정 없이 바로 작동합니다 (플랫폼이 제공하는 공개 공유 링크 방식).
- **인스타그램**: 외부 웹사이트에서 게시물/스토리에 링크를 직접 밀어넣는 기능을 막아두고 있어서, 문구를 클립보드에 복사한 뒤 "스토리나 DM에 직접 붙여넣어달라"고 안내하는 방식입니다.
- **카카오톡**: 정식 작동을 위해 별도 설정이 필요합니다.
  1. [developers.kakao.com](https://developers.kakao.com) 가입 후 애플리케이션 추가
  2. 앱 설정 > 플랫폼 > Web에 배포된 도메인(Netlify/Vercel 주소) 등록
  3. 앱 키 메뉴에서 **JavaScript 키** 복사
  4. `app.js` 상단의 `KAKAO_JS_KEY`에 붙여넣기
  5. GitHub push → 재배포

  키를 넣지 않은 상태에서는 카카오톡 버튼을 누르면 자동으로 "링크 복사"로 대체 동작합니다 (에러 없이 안전하게 폴백).

  카톡 공유 카드에 뜨는 이미지는 `share-card.png`이며, `index.html`과 같은 폴더(사이트 루트)에 있어야 `내도메인/share-card.png` 경로로 정상 노출됩니다. 지금은 결과 유형과 무관하게 고정된 브랜드 이미지 1장을 씁니다 (9유형별 이미지는 정적 사이트 구조상 서버 없이 동적 생성이 어려워 다음 단계 과제로 남겨둡니다).

## 알려진 개선 필요 항목 (지난 코드 리뷰 기준, 아직 미반영)
- Apps Script 웹앱이 완전 공개 상태라 스팸 데이터 유입 위험 — 토큰 검증 로직 추가 권장
- `no-cors` 모드라 저장 실패가 콘솔에 안 뜸 — 배포 직후 실제 시트에 데이터가 쌓이는지 수동 확인 필요

## 다음 개발 우선순위
1. 위 "알려진 개선 필요 항목" 반영
2. 결과 공유카드 PNG 저장 기능
3. 무료 결과 아래 유료 A/B 상품 카드 (자기진단 / 카톡분석) — 여기에 `data-track-event` 속성만 붙이면 클릭 추적 자동 연동 가능
4. 결제 연동

## 10문항 점수 기준
- X축(Q1~Q5): 5~9 관찰형 / 10~14 균형형 / 15~20 직진형
- Y축(Q6~Q10): 5~9 숨김형 / 10~14 조절형 / 15~20 표현형

## 참고: app.js 내 미사용 코드
파일 안에 `MASCOTS`(대문자, 실제 사용 중)와 `mascots`(소문자, 미사용 중복)가 함께 있습니다. 동작에는 영향 없지만 파일 용량을 줄이고 싶으면 소문자 `mascots` 객체는 삭제해도 안전합니다.

