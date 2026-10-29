# 개발·유지보수

[프로젝트 안내](../README.md) · [화면·메뉴 구성](ia.md) · [디렉토리 변경 이력](directory-migration.md)

프로젝트 경로는 저장소 루트 기준입니다. 아래 내용은 2026-10-26의 코드 상태를 기준으로 합니다.

## 기술 구성

| 구분 | 사용 기술 |
|---|---|
| 화면·스타일·동작 | HTML5, CSS, 일반 JavaScript |
| 디자인 시스템 | KRDS 1.0.6 기준, 파비콘 일부는 1.1.0 반입 기록 |
| 그래프 | ECharts 5.5.0, 기본 SVG 렌더링 |
| 슬라이드 | Swiper 11.0.6 |
| 데이터 | HTML 통계표, JSON, XLSX |
| 개발 도구 | Python 3 표준 라이브러리, JavaScript 문법 검사용 Node.js |

화면 실행에는 별도 패키지 설치나 번들 빌드가 필요하지 않습니다. 스타일가이드는 jQuery·Prism 플러그인·글꼴 일부를 외부 CDN에서 불러옵니다.

## 주요 파일

| 파일 | 역할 |
|---|---|
| `js/kr/include.js` | 템플릿 삽입, 메뉴·브레드크럼·제목·현재 메뉴 구성 |
| `js/kr/main.js` | 메인 영상·인포그래픽·연혁·보고서·배너 동작 |
| `js/kr/user-custom.js` | SNS 공유, 조회 조건 전환, 검색 시연 |
| `js/kr/survey-history.js` | XLSX 데이터 검증과 조사 변천사 목록·상세 구성 |
| `js/common/cm-xlsx.js` | 브라우저에서 XLSX 압축·XML 해석 |
| `js/common/cm-chart.js` | 통계표·JSON을 그래프로 표시, 범례·확대·다운로드·인쇄 |
| `js/common/krds-display.js` | 글자·화면 표시 설정 |
| `js/common/krds-custom.js` | KRDS 동작 보정과 프로젝트 공통 UI |
| `css/common/krds-base.css` | 기본 보정·글꼴 정의 |
| `css/common/krds-custom.css` | 프로젝트 공통 컴포넌트·화면 스타일 |
| `css/kr/main.css` | 메인 화면 전용 스타일·애니메이션 |

## 로딩 순서

### CSS

1. KRDS 스타일: `krds/resources/css/component/output.css` 및 필요한 플러그인 CSS
2. `css/common/krds-base.css`
3. `css/common/krds-custom.css`
4. `css/kr/krds-theme.css`
5. `css/kr/user-custom.css`
6. 메인 화면에서는 `css/kr/main.css` 추가

### JavaScript

`js/common/krds-display.js`는 화면 깜빡임을 줄이기 위해 head에서 먼저 실행합니다. 본문 끝에서는 다음 의존 순서를 유지합니다.

1. `js/kr/include.js`로 공통 템플릿 삽입
2. 조사 변천사에서는 `cm-xlsx.js` → `survey-history.js`로 탭·패널 생성
3. Swiper와 KRDS `ui-script.js` 로딩
4. `krds-custom.js` → `krds-base.js` 로딩
5. 그래프 화면에서는 ECharts → `cm-chart.js` 로딩
6. `user-custom.js`, 메인 화면에서는 추가로 `main.js` 로딩

현재 템플릿·XLSX 요청은 동기 방식이며 KRDS 초기화보다 먼저 끝나도록 구성되어 있습니다. 비동기로 바꿀 때는 초기화 시점도 함께 조정해야 합니다.

## 경로 작성

- `include.js`는 자신의 스크립트 주소에서 프로젝트 루트를 구합니다. 서버 하위 경로에서도 이 기준을 유지합니다.
- 템플릿의 `{{root}}`는 프로젝트 루트, `{{html}}`은 `html/kr/`로 치환됩니다.
- 템플릿은 `tmpl/kr/`에 두고 페이지에는 `<div data-include="header"></div>`처럼 논리 이름을 적습니다.
- CSS의 `url()`은 CSS 파일 위치 기준입니다.
- HTML 조각이 삽입된 뒤의 상대경로는 최종 문서 주소 기준입니다. 스타일가이드 예제와 코드 조회를 함께 확인합니다.
- 메인 영상 주소는 `html/kr/main.html`과 `html/kr/code/ext_main_hero.html`에 있습니다. `main.js`는 영상 요소의 `data-src`를 읽으므로 별도 영상 경로를 작성하지 않습니다.

## 그래프 색 · 패턴 기준

그래프 안쪽(색 · 패턴 · 레이블)은 `nise2026/nise_graph_13types_v1.1.html`을 기준으로 `js/common/cm-chart.js`에 옮겼습니다. v1.0과 v1.1의 전체 차이는 `nise2026/nise_graph_v1.0_v1.1_comparison.md`에 있습니다. 번호 01~10은 Sequential Blue Palette 색과 패턴의 공통 세트 번호입니다.

| 항목 | 이전 (v1.0) | 현재 (v1.1) |
|---|---|---|
| 패턴 불투명도 | 02 · 03 44%, 04 36%, 05 39%, 07 33%, 09 59% | 02 · 03 · 04 · 05 · 07 · 09 모두 80% (01 · 06 · 08 · 10은 100%), 추가 투명도 `transparency` 0% |
| 일반 막대 순서 | 06 → 08 → 07 → 05 → 09 → 04 → 10 → 03 → 02 → 01 | 06 → 08 → 05 → 09 → 04 → 10 → 03 → 01 → 07 → 02 |
| 연도 막대 (2017년 · 2023 등) | 연도 수에 따라 연함 → 진함 별도 배정 | 일반 막대와 같은 순서 |
| 막대 2개 | 06 → 08 | 06 → 08 (같음) |
| 막대 계열 1개 | 화면에 따라 패턴 적용 | 06 기본 파랑 · 무패턴 (`data-chart-palette` 지정과 관계없이) |
| 콤보(막대 + 증가율) 막대 | 06 + 패턴 토글 | 06 무패턴 |
| 다크 모드 막대 | 밝게 반전한 전용 팔레트, 남색 패턴 40~70% | 라이트와 같은 색 · 패턴 · 순서 |
| 꺾은선 색 | 라이트 · 다크 모두 계열별 배정 | 라이트는 그대로, 다크는 꺾은선 순서대로 01 → 02 → … → 10 |
| 꺾은선 값 레이블 상자 | 그래프 바탕색 면, 선 색 테두리 1px, 모서리 4px, 여백 3 · 6px | 라이트 흰색 60% · 다크 검정 5% 면, 글자색 40% 테두리 0.8px, 모서리 2px, 여백 상하 3 · 좌우 2px |
| 누적막대 레이블 모서리 | 4px | 5px |

- 모든 그래프가 v1.1 공통 순서를 씁니다. 특수교육 현황 배치 유형 구성비(누적 가로막대)도 Figma 시안의 `data-chart-palette="1,3,4,6"` 지정을 빼고 06 → 08 → 05 → 09로 바꿨습니다. `data-chart-palette`는 특별한 이유가 있을 때만 씁니다.
- 도넛과 동시 병기(있음/없음) 규칙은 이 저장소에 해당 그래프가 없어 옮기지 않았습니다.
- `cm-chart.js`를 고치면 그래프를 쓰는 화면(특수교육 현황 · 시계열 · 핵심데이터 · 교차분석)의 스크립트 주소 `?v=` 날짜도 바꿉니다.

## 데이터·비주얼 수정

| 작업 | 수정 원본 | 반영 방법·범위 |
|---|---|---|
| 조사 변천사 | `data/kr/survey_history/survey_history.xlsx` | 브라우저가 직접 읽음. 별도 생성 명령 없음 |
| 특수교육 현황 생성 구간 | `data/kr/edu_status/edu_status.json` | `build_edu_status.py` 실행 |
| 메인 인포그래픽 | `_tools/build_main_stat_svg.py` 내부 수치·SVG 구성 | 메인 HTML의 관련 `aria-label`도 함께 고친 뒤 생성 |
| 메인 비주얼 영상 | `img/kr/main/main_hero_loop.mp4` | 같은 이름으로 교체. 이름이 바뀌면 화면·예제의 주소 수정 |

특수교육 현황 생성 도구는 학생 수의 **급별 구간**과 기관 수의 **전체 구간**만 갱신합니다. 학생 수의 계·배치별·장애유형별 등 수동 작성 구간과 메인 수치는 별도로 대조해야 합니다.

메인 영상은 동작 줄이기·데이터 절약·모바일·선명하게 모드 조건에 따라 재생하지 않고 정지 이미지를 표시합니다. 화면 밖에서는 재생을 멈추는 동작이 있습니다.

조사 변천사의 상세 주소는 대상자 순서에 따라 생성됩니다. XLSX 수정 절차와 주의점은 [데이터 안내](../data/kr/survey_history/README.md)를 참고합니다.

## 검사·생성 도구

저장소 루트에서 실행합니다.

| 명령 | 검사·작업 | 파일 변경 |
|---|---|---|
| `python3 _tools/check_project.py` | 아래 검사와 자체 Python·JavaScript 문법 검사 통합 | 없음 |
| `python3 _tools/check_paths.py` | HTML·템플릿·CSS의 로컬 참조와 템플릿 이름 검사 | 없음 |
| `python3 _tools/build_edu_status.py --check` | 특수교육 현황 생성 구간의 일치 여부 검사 | 없음 |
| `python3 _tools/build_main_stat_svg.py --check` | 메인 SVG 생성 구간의 일치 여부 검사 | 없음 |
| `python3 _tools/build_edu_status.py` | 특수교육 현황의 지정된 HTML 구간 재생성 | 있음 |
| `python3 _tools/build_main_stat_svg.py` | 메인 인포그래픽 SVG 4개 재생성 | 있음 |

검사 명령은 통과 시 종료 코드 0, 실패 시 1을 반환합니다. 생성 구간이 다르면 `--check`는 갱신 필요를 알리고 파일은 그대로 둡니다.

통합 검사는 원자료의 정확성, 생성 대상 밖의 수치, 메인 SVG의 `aria-label`, XLSX 내용의 업무 규칙, 브라우저 상호작용을 판정하지 않습니다. 외부 라이브러리와 과거 백업의 JavaScript 문법은 제외합니다.

## 변경 후 확인 순서

1. 데이터·화면·리소스를 수정합니다. 생성 대상이면 필요한 생성 도구를 실행합니다.
2. `python3 _tools/check_project.py`를 실행합니다.
3. 로컬 서버에서 수정 화면과 연결 화면을 새로고침합니다.
4. 메뉴·브레드크럼, 이미지·글꼴·영상, 그래프·통계표, 상세 이동을 확인합니다.
5. 공통 컴포넌트를 수정했다면 스타일가이드의 예제와 코드 보기도 확인합니다.
6. `git diff --check`와 변경 내역을 확인한 뒤 커밋·푸시합니다.

## 운영 연동이 필요한 부분

| 기능 | 현재 코드 상태 |
|---|---|
| 통합검색 | `통합교육`에 대한 결과 화면과 다른 검색어의 결과 없음 화면을 나누는 시연 |
| AI 해설 | 화면에 작성된 예시 질문·답변을 재생하는 시연 |
| 교차분석 | 화면과 예시 그래프가 있으며 변수 끌어다 놓기·실제 분석 처리는 미연동 |
| 시계열 조건 조회 | 일부 칩·대상자 목록과 특성별 조건은 시연용 |
| 만족도 조사 | 입력·글자 수 표시 UI. 저장 주소와 제출 처리 미연동 |
| 홍보영상 | 본문 영상의 `src`가 비어 있음. 메인 비주얼 영상과 별도 연결 필요 |

데이터분석 메뉴는 `js/kr/include.js`의 `hidden: true`로 숨겨져 있습니다. 실제 연동 완료 여부는 화면 파일의 존재와 구분해서 관리합니다.

## KRDS 관리

KRDS CSS·JS·글꼴·이미지·예제 원본은 `krds/`에 보존합니다. 프로젝트 보정은 `css/common/`, `js/common/`, 사용자 전용 변경은 `css/kr/`, `js/kr/`에 작성합니다. 버전과 반입 출처는 [KRDS 반입 기록](../krds/KRDS_VERSION.md)에 있습니다.
