/**
 * DeFi Vault Configuration
 * 
 * 각 vault의 설정 정보를 정의합니다.
 * - name: vault 이름
 * - address: vault 주소
 * - chainId: 블록체인 네트워크 ID (1: Ethereum, 137: Polygon, 101: Solana)
 * - asset: 자산 심볼
 * - type: vault 타입 (compound_blue: API 사용, 기타: 웹 스크래핑)
 * - url: vault 웹사이트 URL
 */

module.exports = [
  // 이미지 순서에 맞춰 정렬
  {
    name: 'High-Yield USDC Vault by Alphaping',
    address: '0xb0f05E4De970A1aaf77f8C2F823953a367504BA9',
    chainId: 1,
    asset: 'USDC',
    url: 'https://app.morpho.org/ethereum/vault/0xb0f05E4De970A1aaf77f8C2F823953a367504BA9/alphaping-usdc'
  },
  {
    name: 'pufETH/WETH Loop on Euler Finance',
    address: '0x46BC453666BA11b4b08B0804E49A9D797546ee7D',
    chainId: 1,
    asset: 'pufETH',
    type: 'euler',
    url: 'https://app.euler.finance/vault/0x46BC453666BA11b4b08B0804E49A9D797546ee7D?network=ethereum'
  },
  {
    name: 'Smokehouse High-Yield USDT by Steakhouse',
    address: '0xA0804346780b4c2e3bE118ac957D1DB82F9d7484',
    chainId: 1,
    asset: 'USDT',
    url: 'https://app.morpho.org/ethereum/vault/0xA0804346780b4c2e3bE118ac957D1DB82F9d7484/smokehouse-usdt'
  },
  {
    name: 'OEV-Boosted High-Yield USDC by Yearn',
    address: '0x68Aea7b82Df6CcdF76235D46445Ed83f85F845A3',
    chainId: 1,
    asset: 'USDC',
    url: 'https://app.morpho.org/ethereum/vault/0x68Aea7b82Df6CcdF76235D46445Ed83f85F845A3/oev-boosted-usdc'
  },
  {
    name: 'High-Yield USDC Vault by Hyperithm',
    address: '0x777791C4d6DC2CE140D00D2828a7C93503c67777',
    chainId: 1,
    asset: 'USDC',
    url: 'https://app.morpho.org/ethereum/vault/0x777791C4d6DC2CE140D00D2828a7C93503c67777/hyperithm-usdc'
  },
  {
    name: 'High-Yield USDC Lending by Gauntlet',
    address: '0x781FB7F6d845E3bE129289833b04d43Aa8558c42',
    chainId: 137,
    asset: 'USDC',
    type: 'compound_blue',
    url: 'https://www.compound.blue/0x781FB7F6d845E3bE129289833b04d43Aa8558c42'
  },
  {
    name: 'High-Yield USDC Vault by Relend',
    address: '0x0F359FD18BDa75e9c49bC027E7da59a4b01BF32a',
    chainId: 1,
    asset: 'USDC',
    url: 'https://app.morpho.org/ethereum/vault/0x0F359FD18BDa75e9c49bC027E7da59a4b01BF32a/relend-usdc'
  },
  {
    name: 'High-Yield USDC Vault by Steakhouse',
    address: '0xBEeFFF209270748ddd194831b3fa287a5386f5bC',
    chainId: 1,
    asset: 'USDC',
    url: 'https://app.morpho.org/ethereum/vault/0xBEeFFF209270748ddd194831b3fa287a5386f5bC/steakhouse-usdc'
  },
  {
    name: 'SOL High APY Lending Strategy',
    address: 'A1so1bPD3W1TfeFwboDh8yfAAVaVtcdAYBYCjhg2mJQ',
    chainId: 101,
    asset: 'SOL',
    type: 'kamino',
    url: 'https://app.kamino.finance/earn/lend/A1so1bPD3W1TfeFwboDh8yfAAVaVtcdAYBYCjhg2mJQ'
  },
  {
    name: 'High-Yield USDT Lending by Gauntlet',
    address: '0xfD06859A671C21497a2EB8C5E3fEA48De924D6c8',
    chainId: 137,
    asset: 'USDT',
    type: 'compound_blue',
    url: 'https://www.compound.blue/0xfD06859A671C21497a2EB8C5E3fEA48De924D6c8'
  },
  {
    name: 'APT Low-risk High-interest Staking',
    address: 'stake.amnis.finance',
    chainId: 101,
    asset: 'APT',
    type: 'amnis',
    url: 'https://stake.amnis.finance/stake'
  },
  {
    name: 'OpenEden High-Yield USDC by Ouroboros',
    address: '0x2F21c6499fa53a680120e654a27640Fc8Aa40BeD',
    chainId: 1,
    asset: 'USDC',
    url: 'https://app.morpho.org/ethereum/vault/0x2F21c6499fa53a680120e654a27640Fc8Aa40BeD/openeden-usdc'
  }
]; 