# 디렉토리 변경 이력

[프로젝트 안내](../README.md) · [개발·유지보수](maintenance.md)

2026-10-26에 사이트별 분류를 파일 유형별 분류로 변경했습니다. 아래의 이전 경로는 이동 이력을 설명하기 위한 기록입니다.

## 현재 배치 원칙

- `html/`, `tmpl/`, `css/`, `js/`, `img/`, `fonts/`, `data/`를 최상위에 둡니다.
- `tmpl/`은 `html/`과 같은 위치에 둡니다.
- 유형 안에서 공통(`common`)·사용자(`kr`)·스타일가이드(`styleguide`)를 구분합니다.
- 메인 비주얼 영상은 이미지·비주얼 자산과 함께 `img/kr/main/`에 둡니다.
- 미사용 관리자 전용 파일과 빈 `video/` 디렉토리는 제거했습니다.
- KRDS 리소스 원본과 과거 그래프 백업은 내용을 유지했습니다.

## 경로 이동표

| 사이트별 구조의 이전 경로 | 현재 경로 |
|---|---|
| `kr/html/` | `html/kr/` |
| `kr/tmpl/` | `tmpl/kr/` |
| `_common/html/` | `html/common/` |
| `_common/resources/html/` | `html/common/fragments/` |
| `_common/resources/css/` | `css/common/` |
| `kr/css/` | `css/kr/` |
| `_common/resources/js/` | `js/common/` |
| `kr/js/` | `js/kr/` |
| `_common/resources/img/` | `img/common/` |
| `kr/img/` | `img/kr/` |
| `_common/resources/font/` | `fonts/common/` |
| `kr/data/` | `data/kr/` |
| `_common/docs/` | `docs/` |
| `_common/styleguide/*.html` | `html/styleguide/` |
| `_common/styleguide/*.css` | `css/styleguide/` |
| `_common/styleguide/*.js` | `js/styleguide/` |
| `kr/video/main_hero_loop.mp4` | `img/kr/main/main_hero_loop.mp4` |

영상은 구조 변경 직후의 `video/kr/`에서 최종적으로 `img/kr/main/`으로 옮겼습니다.

## 관련 코드 수정

- HTML의 CSS·JS·이미지·영상 참조와 CSS 내부의 이미지·글꼴 참조를 수정했습니다.
- `js/kr/include.js`의 HTML·템플릿 기준 경로와 현재 메뉴 판별을 수정했습니다.
- `js/kr/survey-history.js`의 XLSX 참조를 수정했습니다.
- Python 생성 도구의 입력 JSON·출력 HTML 경로를 수정했습니다.
- 스타일가이드의 예제 삽입·코드 보기와 템플릿 내부 리소스 참조를 수정했습니다.

## 메인 비주얼과 관리자 파일

메인 영상의 실제 파일, `html/kr/main.html`, `html/kr/code/ext_main_hero.html`을 같은 새 경로로 맞췄습니다. `main.js`는 영상 요소의 `data-src`를 읽습니다.

미사용 관리자용 HTML·템플릿·CSS·JS 7개와 각 디렉토리를 삭제했습니다. 스타일가이드의 관리자용 CSS·JS 참조와 비활성 관리자 예제도 제거했습니다. 학교 관리자 등 조사 대상 명칭은 유지했습니다.

## URL과 운영

사용자 화면 주소는 `/kr/html/...`에서 `/html/kr/...`, 스타일가이드는 `/_common/styleguide/...`에서 `/html/styleguide/...`로 바뀌었습니다. 쿼리 문자열의 `id`, `round`, `q`, `idx`는 유지합니다.

이전 URL의 호환 파일이나 운영 서버 리다이렉트 설정은 추가하지 않았습니다. 이전 URL이 사용 중이면 배포 서버에서 별도로 대응해야 합니다.

## 확인 기록

구조 변경 시 사용자 화면 18개와 스타일가이드 4개의 초기 표시, 메뉴·검색·조사 상세 이동·일부 그래프 조작을 확인했습니다. 관리자 파일 삭제 후에는 메인 영상의 새 URL 재생과 스타일가이드 69개 예제·코드 로딩을 확인했습니다. 이는 해당 시점의 확인 기록이며 전체 기능의 정상 동작이나 운영 연동 완료를 뜻하지 않습니다.

이후 변경 시에는 `python3 _tools/check_project.py`와 수정 화면의 브라우저 확인을 진행합니다. 검사 범위는 [개발·유지보수](maintenance.md)를 참고합니다.
