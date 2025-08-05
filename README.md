# DeFi Vault APY Tracker

DeFi vaults의 Net APY를 실시간으로 추적하는 하이브리드 솔루션입니다.

## 🚀 Features

- **하이브리드 데이터 수집**: API + 웹 스크래핑
- **실시간 APY 추적**: 11개 주요 DeFi vaults
- **웹 대시보드**: 실시간 데이터 시각화
- **데이터 저장**: JSON 형식으로 히스토리 보관

## 📊 Supported Vaults

### Morpho Protocol (Ethereum)
- Morpho OEV-boosted USDC
- Morpho Hyperithm High-Yield USDC
- Morpho High-Yield USDC Vault by Alphaping
- Morpho High-Yield USDC Vault by Steakhouse
- Morpho High-Yield USDC Vault by Relend
- OpenEden High-Yield USDC by Ouroboros
- Smokehouse High-Yield USDT by Steakhouse

### Compound Blue (Polygon) - API 방식
- Compound USDC Core
- Compound USDT

### Other Protocols - 웹 스크래핑
- Kamino Finance Lend (Solana)
- Amnis Finance Stake (Aptos)

## 🛠️ Installation

```bash
# 저장소 클론
git clone <repository-url>
cd apy-tracker

# 의존성 설치
npm install

# Playwright 브라우저 설치
npx playwright install chromium
```

## 🚀 Usage

### 데이터 수집
```bash
# APY 데이터 수집
npm run collect
```

### 웹 대시보드 실행
```bash
# 대시보드 서버 시작
npm start
# 또는
npm run dashboard
```

대시보드는 http://localhost:3000 에서 접속할 수 있습니다.

## 📁 Project Structure

```
apy-tracker/
├── index.js              # 메인 실행 스크립트
├── vaults.js             # vault 설정 정보
├── morphoApi.js          # Morpho API 통합
├── webScraper.js         # 웹 스크래핑 로직
├── dashboard.js          # 웹 대시보드 서버
├── package.json          # 프로젝트 설정
├── data/                 # 데이터 저장소
│   └── latest.json       # 최신 데이터
└── public/               # 웹 대시보드 파일
    └── index.html        # 대시보드 UI
```

## 🔧 Configuration

### Vault 추가/수정
`vaults.js` 파일에서 vault 정보를 수정할 수 있습니다:

```javascript
{
  name: 'Vault Name',
  address: '0x...',
  chainId: 1, // 1: Ethereum, 137: Polygon, 101: Solana
  asset: 'USDC',
  type: 'compound_blue', // API 사용 시
  url: 'https://...'
}
```

## 📊 Data Format

### JSON 형식
```json
{
  "timestamp": "2025-08-04T18:07:12.689Z",
  "date": "2025-08-04",
  "time": "18-07-12",
  "vaults": [
    {
      "name": "Vault Name",
      "address": "0x...",
      "asset": "USDC",
      "netApy": 0.089,
      "source": "morpho_api",
      "url": "https://..."
    }
  ]
}
```

## 🔄 Data Collection Methods

### API 방식 (Compound Blue)
- Morpho GraphQL API 사용
- 정확하고 안정적인 데이터
- 실시간 업데이트

### 웹 스크래핑 방식
- Playwright를 사용한 동적 페이지 스크래핑
- 사이트별 최적화된 선택자 사용
- 복잡한 React 앱 지원

## 📈 API Endpoints

웹 대시보드에서 제공하는 API:

- `GET /api/latest` - 최신 데이터
- `POST /api/collect` - 수동 데이터 수집

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License

## 🆘 Support

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요. 