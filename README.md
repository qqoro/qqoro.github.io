# qqoro.github.io

[야식메뉴판 Plus](https://github.com/qqoro/yasig-menu-plus)와 [동인메뉴판](https://github.com/qqoro/doujin-menu) 소개 페이지. Astro 정적 사이트이며 GitHub Pages로 배포됩니다.

## 개발

```bash
pnpm install
pnpm dev       # 개발 서버
pnpm build     # dist/ 생성
pnpm preview   # 빌드 결과 미리보기
pnpm check     # 타입 검사
```

빌드 시 GitHub API에서 최신 릴리스 버전과 누적 다운로드 수를 가져옵니다. `GITHUB_TOKEN` 환경 변수가 있으면 인증 요청을 사용합니다(없어도 동작).

## 배포

`main`에 푸시하면 `.github/workflows/deploy.yml`이 빌드해서 GitHub Pages에 올립니다. 매일 한 번 다시 빌드해 수치를 갱신합니다.

저장소 설정 → Pages → Source를 **GitHub Actions**로 지정해야 합니다.

## 스크린샷 추가

`src/assets/screenshots/`에 넣고 `src/components/FeatureStack.astro`의 `placeholder` 항목을 `img`로 바꾸면 됩니다.
