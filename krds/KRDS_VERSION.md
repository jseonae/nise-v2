# KRDS 반입 기록

[프로젝트 안내](../README.md) · [개발·유지보수](../docs/maintenance.md)

이 디렉토리의 KRDS CSS·JavaScript·글꼴·이미지·컴포넌트 예제는 원본 묶음으로 보존합니다. 프로젝트 전용 보정은 아래 위치에 작성합니다.

| 용도 | 프로젝트 경로 |
|---|---|
| 기본 스타일·글꼴 보정 | `css/common/krds-base.css` |
| 프로젝트 공통 스타일 | `css/common/krds-custom.css` |
| 사용자 테마·추가 스타일 | `css/kr/` |
| 공통 동작 보정·확장 | `js/common/` |
| 사용자 전용 동작 | `js/kr/` |

## 버전과 출처

다음 태그·커밋·날짜는 기존 반입 기록을 보존한 내용입니다.

- 출처: [KRDS UI/UX 저장소](https://github.com/KRDS-uiux/krds-uiux)
- 기준 버전: 태그 `1.0.6`
- 기준 커밋: `508e961bc65ab1aa6660270c7cddcc650d91ead0` (2025-09-05)
- 파비콘 예외: `resources/img/component/favicon/`은 1.0.6에 없어 태그 `1.1.0`, 커밋 `d6bb184c823e4757f05807ea4646a23e3133b6e6` (2026-01-12)에서 가져온 기록입니다.

## 현재 저장소 구성

- `resources/cdn`, `resources/css`, `resources/fonts`, `resources/img`, `resources/js`
- `html/code`: 컴포넌트 예제
- `package.json`: 패키지 정보. 실행·빌드용 `scripts`는 비어 있습니다.
- 원본 SCSS 소스와 최상위 `tokens` 디렉토리는 포함하지 않습니다. 배포용 CSS 토큰은 `resources/css/token/`에 있습니다.

기존 문서에는 예제 HTML 제외라고 적혀 있었으나, 현재 저장소에는 `html/code/`가 있고 스타일가이드에서 읽어 사용합니다.

## 화면에서 사용하는 스타일

현재 사용자 화면은 `krds/resources/css/component/output.css`와 필요한 플러그인 CSS를 불러옵니다. 프로젝트 추가 CSS의 순서는 [개발·유지보수](../docs/maintenance.md)의 로딩 순서를 따릅니다.

기존 반입 기록에 따르면 `resources/cdn/krds.min.css`에는 원격 이미지 경로가 포함되어 있습니다. 현재 페이지는 이 CDN CSS 대신 로컬 리소스용 `output.css`를 참조합니다.

## 변경 이력 안내

파일 유형별 재배치 시 KRDS 리소스 묶음의 위치와 내용은 유지했습니다. 이 설명 문서는 현재 프로젝트 경로와 실제 예제 사용 상태를 반영해 정리했습니다. 이전 프로젝트 경로는 [디렉토리 변경 이력](../docs/directory-migration.md)에서 확인할 수 있습니다.
