# 파일 유형별 디렉토리 이전

`tmpl/`은 `html/`과 같은 최상위에 둡니다. 각 유형 안에서 공통·사용자·관리자를 구분하며 파일명과 화면 내부 구조, 데이터 값, 스크립트 초기화 순서를 유지합니다.

| 이전 | 현재 |
|---|---|
| `kr/html/` | `html/kr/` |
| `adm/html/` | `html/adm/` |
| `kr/tmpl/` | `tmpl/kr/` |
| `adm/tmpl/` | `tmpl/adm/` |
| `_common/html/` | `html/common/` |
| `_common/resources/html/` | `html/common/fragments/` |
| `_common/resources/css/` | `css/common/` |
| `kr/css/`, `adm/css/` | `css/kr/`, `css/adm/` |
| `_common/resources/js/` | `js/common/` |
| `kr/js/`, `adm/js/` | `js/kr/`, `js/adm/` |
| `_common/resources/img/`, `kr/img/` | `img/common/`, `img/kr/` |
| `_common/resources/font/` | `fonts/common/` |
| `kr/video/`, `kr/data/` | `video/kr/`, `data/kr/` |
| `_common/docs/` | `docs/` |
| `_common/styleguide/*.html` | `html/styleguide/` |
| `_common/styleguide/*.css` | `css/styleguide/` |
| `_common/styleguide/*.js` | `js/styleguide/` |

## 주소와 운영

사용자 화면 주소는 `/kr/html/...`에서 `/html/kr/...`로 바뀝니다. 관리자 화면은 `/adm/html/...`에서 `/html/adm/...`, 스타일가이드는 `/_common/styleguide/...`에서 `/html/styleguide/...`로 바뀝니다. 쿼리 문자열(`id`, `round`, `q`, `idx`)은 유지합니다.

이전 주소의 호환 파일이나 운영 서버 리다이렉트 설정은 추가하지 않았습니다. 기존 주소가 사용 중이면 배포 서버에서 이전 경로와 새 경로를 매핑해야 합니다.

## 보존 대상

`krds/`는 내부 상대경로와 원본을 보존하기 위해 기존 위치에 유지합니다. `krds/KRDS_VERSION.md` 안의 커스텀 파일에 대한 이전 경로는 위 표로 읽어 주세요. `js/common/backup/` 안의 과거 버전도 내용을 변경하지 않고 이동했습니다.

## 검증

`python3 _tools/check_project.py`로 경로·생성 구간 일치·자체 스크립트 문법을 함께 검사합니다. 이 명령과 두 생성 도구의 `--check` 옵션은 프로젝트 파일을 변경하지 않습니다.

`python3 _tools/check_paths.py`는 프로젝트의 HTML·템플릿·CSS·스타일가이드가 참조하는 로컬 파일과 `data-include`의 템플릿 이름을 검사합니다. 외부 원본, 외부 URL, 페이지 내 앵커, 아직 연결하지 않은 주소 자리표시는 검사 대상에서 제외합니다.

생성 도구 실행 후에는 출력 HTML의 차이도 확인합니다. 브라우저에서는 현재 메뉴·브레드크럼, XLSX 로딩, 그래프, 검색 이동, 스타일가이드의 예제와 코드 보기를 확인합니다.
