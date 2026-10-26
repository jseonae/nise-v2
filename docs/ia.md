# 화면·메뉴 구성

[프로젝트 안내](../README.md) · [개발·유지보수](maintenance.md)

2026-10-26의 `js/kr/include.js`와 화면 파일을 기준으로 정리했습니다. 기존 문서의 Figma 프레임명은 디자인 대응 정보로 보존하며, Figma의 현재 상태를 재검증한 기록은 아닙니다.

## 메뉴 규칙과 노출 상태

- 메뉴 데이터는 `js/kr/include.js`의 `MENU`에서 관리합니다.
- 1Depth는 통계정보·데이터분석·알림마당이며, 현재 데이터분석은 `hidden: true`입니다.
- 헤더의 1Depth 링크는 해당 그룹의 첫 화면으로 이동합니다. GNB에는 현재 그룹의 2Depth 메뉴를 표시합니다.
- 모바일 전체메뉴와 전체메뉴 팝업은 숨김 설정을 제외한 그룹으로 구성합니다.
- 목록·상세 화면은 `이름_list.html`·`이름_view.html`로 짝을 이룹니다.
- 상세 화면은 본문 제목과 별도로 페이지 상단에 브레드크럼·공유·인쇄 도구를 둡니다.
- 기타 정책 메뉴를 추가할 때는 기존 기획 기준에 따라 `html/kr/etc/` 아래에 둡니다. 현재 정책 링크에는 미연결 항목이 있습니다.

## 서비스 화면

사용자 화면 파일은 18개입니다. 파일 존재와 UI 구현은 실제 API·저장 기능의 완료 여부를 뜻하지 않습니다.

| 구분 | 화면 | 경로 | Figma 프레임 기록 |
|---|---|---|---|
| 메인 | 플랫폼 메인 | `html/kr/main.html` | main-확정 |
| 통계정보 | 조사 변천사 목록·상세 | `html/kr/stat/survey_history_list.html`, `html/kr/stat/survey_history_view.html` | s01통계정보_조사 변천사 list / view |
| 통계정보 | 특수교육 현황 | `html/kr/stat/edu_status.html` | 특수교육현황-학생수기준-계 |
| 통계정보 | 시계열 시각화 목록·상세 | `html/kr/stat/timeseries_list.html`, `html/kr/stat/timeseries_view.html` | 시계열시각화-list / view |
| 통계정보 | 핵심데이터 시각화 목록·상세 | `html/kr/stat/keydata_list.html`, `html/kr/stat/keydata_view.html` | 핵심데이터시각화-list / view |
| 데이터분석 | 교차분석·준비 화면 | `html/kr/analysis/cross_analysis.html`, `html/kr/analysis/cross_analysis_ready.html` | s02데이터분석_교차분석_view |
| 알림마당 | 조사개요 | `html/kr/board/survey_overview.html` | s03알림마당_조사개요 |
| 알림마당 | 공지사항 목록·상세 | `html/kr/board/notice_list.html`, `html/kr/board/notice_view.html` | s03알림마당_공지사항 list / view |
| 알림마당 | 자료실 목록·상세 | `html/kr/board/archive_list.html`, `html/kr/board/archive_view.html` | s03알림마당_자료실 list / view |
| 알림마당 | 홍보영상 | `html/kr/board/promo_video.html` | s03알림마당_홍보영상 view |
| 통합검색 | 검색 결과·결과 없음 | `html/kr/search/search_result.html`, `html/kr/search/search_result_none.html` | 기존 문서에 프레임명 없음 |

메인과 통합검색은 일반 2Depth 메뉴에 속하지 않는 화면입니다. 교차분석 두 파일은 직접 접근할 수 있지만 데이터분석 메뉴는 숨김 상태입니다. 시연·미연동 기능은 [개발·유지보수](maintenance.md)의 운영 연동 항목에서 확인합니다.

## 공통 템플릿

`tmpl/`은 `html/`과 같은 최상위 디렉토리입니다. 사용자 공통 영역은 `tmpl/kr/`에 둡니다.

| 템플릿 | 용도 |
|---|---|
| `header.html` | 본문 바로가기, 공식 누리집 배너, 헤더·검색·메뉴 |
| `page-top.html` | 브레드크럼, 제목·설명, 공유·인쇄 |
| `footer.html` | 푸터, 페이지 상단 이동 버튼 |
| `modal.html` | 전체메뉴·화면 설정·차트 확대 등 공통 모달 |
| `research.html` | 만족도 입력 UI |
| `kogl/notice/`, `kogl/archive/` | 공지사항·자료실용 공공누리 표시 |

페이지에는 `<div data-include="header"></div>`처럼 이름을 지정합니다. `include.js`가 KRDS UI 초기화 전에 템플릿을 넣고, 메뉴 데이터로 현재 메뉴·제목·브레드크럼을 채웁니다. 메뉴 변경 시 코드의 `MENU`와 이 문서를 함께 갱신합니다.

메인 등 GNB가 없는 헤더는 `data-gnb="none"`을 사용합니다. 상세 제목의 브레드크럼 표시는 `data-crumb` 또는 조사 변천사 화면 스크립트에서 구성합니다.

공공누리 유형은 `type0`, `type1`, `type2`, `type3`, `type4`, `typeAI`이며, 예를 들어 `<div data-include="kogl/notice/type1"></div>`로 넣습니다. 유형은 등록 데이터에 맞춰 선택합니다. 기존 마크·문구 출처 기록은 [한국문화정보원 공통코드](https://www.kogl.or.kr/edu/eduDataView.do?dataIdx=170)입니다.

## 예제·스타일가이드

- 사용자 전용 컴포넌트 예제: `html/kr/code/`
- 공통 컴포넌트 예제: `html/common/code/`
- 공통 HTML 조각: `html/common/fragments/`
- 스타일가이드: `html/styleguide/`의 `styleguide.html`, `color.html`, `typography.html`, `icon.html`
- KRDS 예제 원본: `krds/html/code/`

미사용 관리자 화면과 관련 템플릿·CSS·JS는 제거했습니다. 조사 대상인 ‘학교 관리자’ 등의 명칭은 사용자 화면의 데이터이므로 유지합니다.
