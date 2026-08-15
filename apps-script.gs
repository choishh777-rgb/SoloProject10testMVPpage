/**
 * SOLO PROJECT Google Sheets 수집 엔드포인트
 * - events: 랜딩/테스트 시작/문항 도달/완료/결과/공유 등 퍼널 로그
 * - responses: 최종 10문항 응답 + 결과
 *
 * 설치
 * 1) Google Sheet 생성
 * 2) 확장 프로그램 > Apps Script
 * 3) 이 코드 붙여넣기
 * 4) SHEET_ID를 현재 스프레드시트 ID로 교체
 * 5) 배포 > 새 배포 > 웹 앱 > 실행 사용자: 나 / 액세스: 모든 사용자
 * 6) 배포 URL을 app.js의 DATA_ENDPOINT에 입력
 */
const SHEET_ID = '8PmcVkjrxw477XvaagCYt9IByDUH5bhtW1V2leLyqDo';
const EVENT_SHEET = 'events';
const RESPONSE_SHEET = 'responses';

function getOrCreateSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}

function doPost(e) {
  try {
    const data = JSON.parse((e.postData && e.postData.contents) || '{}');
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.kind === 'event') {
      const sh = getOrCreateSheet_(ss, EVENT_SHEET, [
        'timestamp','sessionId','visitorId','eventName','page','page_url','referrer',
        'utm_source','utm_medium','utm_campaign','utm_content','utm_term',
        'first_utm_source','first_utm_medium','first_utm_campaign','first_utm_content',
        'gclid','fbclid','ttclid','wbraid','gbraid','params_json','userAgent'
      ]);
      sh.appendRow([
        data.timestamp || new Date().toISOString(), data.sessionId || '', data.visitorId || '', data.eventName || '',
        data.page || '', data.page_url || '', data.referrer || '',
        data.utm_source || '', data.utm_medium || '', data.utm_campaign || '', data.utm_content || '', data.utm_term || '',
        data.first_utm_source || '', data.first_utm_medium || '', data.first_utm_campaign || '', data.first_utm_content || '',
        data.gclid || '', data.fbclid || '', data.ttclid || '', data.wbraid || '', data.gbraid || '',
        JSON.stringify(data.params || {}), data.userAgent || ''
      ]);
    } else {
      const sh = getOrCreateSheet_(ss, RESPONSE_SHEET, [
        'timestamp','sessionId','visitorId','result','xType','yType','x','y',
        'Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8','Q9','Q10',
        'page_url','referrer','utm_source','utm_medium','utm_campaign','utm_content','utm_term',
        'first_utm_source','first_utm_medium','first_utm_campaign','first_utm_content',
        'gclid','fbclid','ttclid','wbraid','gbraid','userAgent'
      ]);
      const answers = Array.isArray(data.answers) ? data.answers : [];
      sh.appendRow([
        data.timestamp || new Date().toISOString(), data.sessionId || '', data.visitorId || '',
        data.result || '', data.xType || '', data.yType || '', data.x || '', data.y || '',
        ...Array.from({length:10}, (_,i)=>answers[i] || ''),
        data.page_url || '', data.referrer || '',
        data.utm_source || '', data.utm_medium || '', data.utm_campaign || '', data.utm_content || '', data.utm_term || '',
        data.first_utm_source || '', data.first_utm_medium || '', data.first_utm_campaign || '', data.first_utm_content || '',
        data.gclid || '', data.fbclid || '', data.ttclid || '', data.wbraid || '', data.gbraid || '', data.userAgent || ''
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
