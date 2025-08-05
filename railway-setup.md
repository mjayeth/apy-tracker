# Railway 배포 가이드

## 🚀 Railway로 APY Tracker 배포하기

Railway는 Vercel보다 더 많은 시스템 의존성을 지원하여 웹 스크래핑이 가능합니다.

### 1. Railway 계정 생성
- https://railway.app 에서 GitHub 계정으로 로그인

### 2. 프로젝트 생성
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 초기화
railway init

# 배포
railway up
```

### 3. 환경 변수 설정
Railway 대시보드에서 다음 환경 변수 설정:
```
NODE_ENV=production
PORT=3000
```

### 4. package.json 스크립트 수정
```json
{
  "scripts": {
    "start": "node dashboard.js",
    "build": "npm install",
    "dev": "node dashboard.js"
  }
}
```

### 5. 장점
- ✅ Docker 컨테이너 지원
- ✅ 시스템 의존성 설치 가능
- ✅ Playwright/Puppeteer 완전 지원
- ✅ 무료 티어 제공
- ✅ 자동 HTTPS

### 6. 배포 후 확인
- Railway에서 제공하는 URL로 접속
- 웹 스크래핑이 정상 작동하는지 확인 