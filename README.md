# nise
NISE Center Data Platform

## 디렉토리 구조

```
html/         kr/ 사용자 화면, adm/ 관리자 화면, common/ 예제·HTML 조각, styleguide/ 가이드 화면
tmpl/         kr/ 사용자 공통 템플릿, adm/ 관리자 공통 템플릿 (html/과 같은 위치)
css/          common/ 공통 보정, kr/ 사용자, adm/ 관리자, styleguide/ 가이드 스타일
js/           common/ 공통 UI·그래프·엑셀·라이브러리, kr/ 사용자, adm/ 관리자, styleguide/ 가이드 스크립트
img/          common/ 공통 이미지, kr/ 사용자 이미지
fonts/        common/ 프로젝트 추가 글꼴
video/        kr/ 사용자 영상
data/         kr/ 통계 JSON·조사 변천사 XLSX
docs/         메뉴 구조·유지보수 문서
_tools/       경로 검사·HTML/SVG 생성 도구
krds/         KRDS 원본 (수정 금지, 버전은 krds/KRDS_VERSION.md)
```

CSS 불러오는 순서: KRDS 원본 → `css/common/krds-base.css`(KRDS가 가이드만 있고 코드를 주지 않는 기본 스타일) → `css/common/krds-custom.css` → 사이트 `krds-theme.css` → 사이트 추가 스타일

## 로컬 실행

저장소 루트에서 HTTP 서버를 실행합니다. `file://`로 직접 열면 공통 템플릿을 불러올 수 없습니다.

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

- 메인: http://127.0.0.1:8000/html/kr/main.html
- 관리자 골격: http://127.0.0.1:8000/html/adm/dashboard.html
- 스타일가이드: http://127.0.0.1:8000/html/styleguide/styleguide.html
- 조사 변천사 데이터 확인: http://127.0.0.1:8000/html/kr/stat/survey_history_list.html?check=1

## 초기화 순서

사용자 페이지는 `js/kr/include.js`로 템플릿을 먼저 삽입합니다. 조사 변천사는 그 다음 엑셀 데이터와 화면을 구성하고, 이후 KRDS UI를 초기화합니다. 그래프 페이지는 ECharts 다음에 `js/common/cm-chart.js`를 불러옵니다. 화면 표시 설정인 `js/common/krds-display.js`는 기존처럼 head에서 실행합니다.

`include.js`는 자신의 주소를 기준으로 프로젝트 루트를 계산하므로 서버 하위 경로에서도 사용할 수 있습니다. `{{root}}`는 프로젝트 루트, `{{html}}`은 `html/kr/`로 치환됩니다.

## 검사·생성

Python 3과 Node.js가 있는 환경에서 아래 명령으로 경로·생성 구간·자체 Python/JavaScript 문법을 한 번에 검사합니다. 프로젝트 파일을 변경하지 않으며 오류가 있으면 종료 코드 1을 반환합니다.

```bash
python3 _tools/check_project.py
```

각 검사는 따로 실행할 수도 있습니다.

```bash
python3 _tools/check_paths.py
python3 _tools/build_edu_status.py --check
python3 _tools/build_main_stat_svg.py --check
```

생성 구간의 갱신이 필요할 때 아래 명령을 실행합니다.

```bash
python3 _tools/build_edu_status.py
python3 _tools/build_main_stat_svg.py
```

경로 검사와 `--check`는 파일을 수정하지 않습니다. 옵션 없는 생성 도구 두 개는 각각 `html/kr/stat/edu_status.html`, `html/kr/main.html`의 지정된 구간을 다시 씁니다. 조사 변천사는 `data/kr/survey_history/survey_history.xlsx`를 브라우저에서 직접 읽습니다.

통합 검사는 로컬 참조와 생성 구간의 일치, 스크립트 문법을 확인합니다. 통계 원자료의 정확성, 생성 대상 밖의 수동 작성 수치, 메인 SVG의 `aria-label`, 브라우저 상호작용은 별도로 확인해야 합니다. 외부 라이브러리와 과거 백업의 JavaScript 문법은 검사하지 않습니다.

## 디렉토리 이전

파일 이동표와 URL 변경 사항은 `docs/directory-migration.md`를 참고합니다. 기존 사용자 화면 URL의 `/kr/html/`은 `/html/kr/`로 변경되었습니다. 기존 URL을 운영 중이었다면 웹 서버에서 별도의 리다이렉트 또는 경로 매핑을 적용해야 합니다. 이 저장소에서는 운영 서버 설정을 변경하지 않습니다.
