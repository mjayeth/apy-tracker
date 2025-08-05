# Render 배포 가이드

## 🚀 Render로 APY Tracker 배포하기

Render는 Docker 컨테이너를 완전히 지원하여 웹 스크래핑이 가능합니다.

### 1. Dockerfile 생성
```dockerfile
FROM node:18-slim

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Playwright 브라우저 설치
RUN npx playwright install chromium

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. Render 계정 생성
- https://render.com 에서 GitHub 계정으로 로그인

### 3. 새 Web Service 생성
- GitHub 저장소 연결
- Build Command: `npm install && npx playwright install chromium`
- Start Command: `npm start`

### 4. 환경 변수 설정
```
NODE_ENV=production
PORT=3000
```

### 5. 장점
- ✅ Docker 완전 지원
- ✅ 시스템 의존성 설치 가능
- ✅ Playwright/Puppeteer 완전 지원
- ✅ 무료 티어 제공
- ✅ 자동 HTTPS

### 6. 배포 후 확인
- Render에서 제공하는 URL로 접속
- 웹 스크래핑이 정상 작동하는지 확인 