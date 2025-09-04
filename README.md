# DeFi APY Tracker Dashboard

Real-time DeFi Vault APY monitoring dashboard with hybrid API and web scraping capabilities.

## Features

- **15 DeFi Vaults** tracked across multiple chains
- **Real-time APY data** from Morpho API and web scraping
- **Multi-chain support**: Ethereum, Polygon, Solana, Aptos
- **Interactive dashboard** with sorting and filtering
- **Automatic data updates** every few minutes

## Supported Vaults

### Ethereum
- High-Yield USDC Vault by Alphaping
- pufETH/WETH Loop on Euler Finance
- Smokehouse High-Yield USDT by Steakhouse
- OEV-Boosted High-Yield USDC by Yearn
- High-Yield USDC Vault by Hyperithm
- High-Yield USDC Vault by Relend
- High-Yield USDC Vault by Steakhouse
- OpenEden High-Yield USDC by Ouroboros

### Polygon
- High-Yield USDC Lending by Gauntlet
- High-Yield USDT Lending by Gauntlet

### Solana
- SOL High APY Lending Strategy (Kamino)
- Jupiter Lend USDC
- Jupiter Lend USDT
- Jupiter Lend USDS

### Aptos
- APT Low-risk High-interest Staking (Amnis)

## Tech Stack

- **Backend**: Node.js, Express
- **Web Scraping**: Playwright
- **API**: Morpho Protocol API
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Deployment**: Vercel

## Local Development

```bash
# Install dependencies
npm install

# Run data collection
npm run collect

# Start dashboard
npm run dashboard

# Run everything locally
npm run local
```

## API Endpoints

- `GET /` - Dashboard homepage
- `GET /api/latest` - Latest vault data
- `POST /api/collect` - Manual data collection

## Deployment

This project is deployed on Vercel and automatically updates from the GitHub repository.

## License

MIT