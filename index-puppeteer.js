/**
 * APY Tracker Main Script - Puppeteer Version
 * 
 * DeFi vaults의 Net APY를 수집하는 메인 스크립트입니다.
 * Compound Blue vaults는 Morpho API를 사용하고, 나머지는 Puppeteer 웹 스크래핑을 사용합니다.
 */

const vaults = require('./vaults');
const { scrapeAllVaultsNetApy } = require('./puppeteerScraper');
const { getCompoundBlueVaultsApy } = require('./morphoApi');
const fs = require('fs-extra');
const path = require('path');

/**
 * 메인 실행 함수
 * 1. Compound Blue vaults는 API로 조회
 * 2. 나머지 vaults는 Puppeteer 웹 스크래핑으로 조회
 * 3. 결과를 합쳐서 정렬 및 저장
 */
async function main() {
  console.log('🚀 Hybrid Net APY Tracker (Puppeteer) 시작...\n');
  
  try {
    console.log(`📊 총 ${vaults.length}개 vault를 처리합니다.\n`);
    
    // Compound Blue vaults는 API로 처리
    const compoundVaults = vaults.filter(vault => vault.type === 'compound_blue');
    const compoundResults = await getCompoundBlueVaultsApy(compoundVaults);
    
    // 나머지 vaults는 Puppeteer 웹 스크래핑으로 처리
    const nonCompoundVaults = vaults.filter(vault => vault.type !== 'compound_blue');
    const scrapingResults = await scrapeAllVaultsNetApy(nonCompoundVaults);
    
    // 결과 합치기
    const allResults = [...compoundResults, ...scrapingResults];
    
    // Net APY 순으로 정렬 (고정 순서 우선)
    const fixedOrder = [
        'High-Yield USDC Vault by Alphaping',
        'Smokehouse High-Yield USDT by Steakhouse',
        'OEV-Boosted High-Yield USDC by Yearn',
        'High-Yield USDC Vault by Hyperithm',
        'High-Yield USDC Lending by Gauntlet',
        'High-Yield USDC Vault by Relend',
        'High-Yield USDC Vault by Steakhouse',
        'SOL High APY Lending Strategy',
        'High-Yield USDT Lending by Gauntlet',
        'APT Low-risk High-interest Staking',
        'OpenEden High-Yield USDC by Ouroboros'
    ];
    
    const sortedResults = fixedOrder.map(name => 
        allResults.find(vault => vault.name === name)
    ).filter(Boolean);

    // 결과 출력
    console.log('\n📊 === All Vault Net APY Results (Hybrid: API + Puppeteer Scraping) ===\n');
    
    sortedResults.forEach((vault, index) => {
      const netApyPercent = vault.netApy && typeof vault.netApy === 'number' ? 
        (vault.netApy * 100).toFixed(2) : vault.netApy;
      
      console.log(`${index + 1}. 🏦 ${vault.name} (${vault.asset})`);
      console.log(`   📍 Address: ${vault.address}`);
      console.log(`   📊 Net APY: ${netApyPercent}%`);
      console.log(`   🔗 Source: ${vault.source}`);
      console.log('');
    });
    
    // 에러가 있는 vault들 출력
    const errorVaults = allResults.filter(vault => 
      vault.netApy === 'Error' || vault.netApy === 'N/A'
    );
    
    if (errorVaults.length > 0) {
      console.log('\n❌ === Vaults with Errors ===\n');
      errorVaults.forEach(vault => {
        console.log(`🏦 ${vault.name} (${vault.asset})`);
        console.log(`   📍 Address: ${vault.address}`);
        console.log(`   ❌ Error: Unable to fetch Net APY data`);
        console.log('');
      });
    }
    
    console.log(`✅ 총 ${allResults.length}개 vault Net APY 조회 완료!`);
    console.log(`📈 성공: ${sortedResults.length}개, 실패: ${errorVaults.length}개`);
    
    // 데이터 저장
    await saveData(allResults);
    
    return allResults;
    
  } catch (error) {
    console.error('❌ Error in main:', error.message);
    throw error;
  }
}

/**
 * 수집된 데이터를 파일로 저장합니다.
 * @param {Array} allResults - 수집된 모든 vault 데이터
 */
async function saveData(allResults) {
  const dataToSave = {
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'),
    vaults: allResults,
    mode: 'puppeteer_scraping'
  };
  
  await fs.writeJson(path.join(__dirname, 'data', 'latest.json'), dataToSave, { spaces: 2 });
  console.log(`📁 데이터 저장됨: ${path.join(__dirname, 'data', 'latest.json')}`);
}

// 메인 실행
if (require.main === module) {
  main();
}

module.exports = { main }; 