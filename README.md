# nise-v2

특수교육 실태조사 데이터 활용 플랫폼의 프런트엔드 퍼블리싱 프로젝트입니다. HTML·CSS·JavaScript와 KRDS를 사용하며, 사용자 화면·공통 컴포넌트·스타일가이드를 포함합니다.

문서의 프로젝트 경로는 저장소 루트를 기준으로 합니다. 현재 구조와 코드 기준일은 2026-10-26입니다.

## 문서 안내

| 문서 | 내용 |
|---|---|
| [화면·메뉴 구성](docs/ia.md) | 화면 목록, 메뉴 노출 상태, 공통 템플릿 |
| [개발·유지보수](docs/maintenance.md) | 주요 파일, 로딩 순서, 데이터 수정, 검사·생성 도구 |
| [디렉토리 변경 이력](docs/directory-migration.md) | 이전·현재 경로, 영상 이동, 관리자 파일 제거 |
| [조사 변천사 데이터](data/kr/survey_history/README.md) | XLSX 작성 방법과 화면 확인 절차 |
| [KRDS 반입 기록](krds/KRDS_VERSION.md) | 버전·출처, 보존 범위, 프로젝트 확장 위치 |

## 디렉토리 구조

파일 유형을 최상위에서 구분하고, 그 안에서 공통(`common`)과 사용자(`kr`)를 구분합니다.

```text
html/       kr/ 사용자 화면, common/ 예제·HTML 조각, styleguide/ 가이드 화면
tmpl/       kr/ 사용자 공통 템플릿 (html/과 같은 위치)
css/        common/ 공통 보정, kr/ 사용자, styleguide/ 가이드 스타일
js/         common/ 공통 UI·라이브러리, kr/ 사용자, styleguide/ 가이드 스크립트
img/        common/ 공통 이미지, kr/ 사용자 이미지·메인 비주얼 영상
fonts/      common/ 프로젝트 추가 글꼴
data/       kr/ 특수교육 현황 JSON·조사 변천사 XLSX
docs/       화면·유지보수·변경 이력 문서
_tools/     경로·문법 검사와 HTML·SVG 생성 도구
krds/       KRDS 리소스와 컴포넌트 예제 원본 묶음
```

메인 비주얼 영상은 `img/kr/main/main_hero_loop.mp4`에 있습니다. 미사용 관리자용 HTML·템플릿·CSS·JS와 최상위 `video/` 디렉토리는 제거했습니다.

## 로컬 실행

화면을 확인할 때는 Python 3으로 저장소 루트에서 HTTP 서버를 실행합니다.

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

| 화면 | 로컬 주소 |
|---|---|
| 메인 | [메인 화면](http://127.0.0.1:8000/html/kr/main.html) |
| 특수교육 현황 | [통계·그래프 화면](http://127.0.0.1:8000/html/kr/stat/edu_status.html) |
| 조사 변천사 데이터 확인 | [엑셀 검증 화면](http://127.0.0.1:8000/html/kr/stat/survey_history_list.html?check=1) |
| 스타일가이드 | [컴포넌트 가이드](http://127.0.0.1:8000/html/styleguide/styleguide.html) |

공통 템플릿과 데이터 파일을 HTTP 요청으로 읽으므로 `file://`로 직접 열지 않습니다. 별도의 npm 개발 서버·빌드 명령은 없습니다.

## 변경 후 검사

Python 3과 Node.js가 있는 환경에서 다음 명령을 실행합니다.

```bash
python3 _tools/check_project.py
```

프로젝트 파일을 수정하지 않고 로컬 파일 참조, HTML·SVG 생성 구간의 일치, 자체 Python·JavaScript 문법을 검사합니다. 실패하면 종료 코드 1을 반환합니다.

생성 구간을 갱신해야 할 때 사용하는 명령은 [개발·유지보수 문서](docs/maintenance.md)에 정리했습니다.

## 현재 구현 범위

화면은 정적 HTML, 페이지 내 통계표·JSON, 조사 변천사 XLSX를 사용합니다. 실제 검색·AI 답변·교차분석 처리·만족도 저장 등은 운영 연동이 필요한 부분이 있습니다. 데이터분석 메뉴는 코드의 `hidden: true` 설정에 따라 숨겨져 있습니다.

운영 서버·DB·인증·배포 설정은 이 저장소에 포함되어 있지 않습니다. 이전 URL을 사용 중인 서비스가 있다면 배포 서버에서 별도로 경로 매핑 또는 리다이렉트를 적용해야 합니다.
