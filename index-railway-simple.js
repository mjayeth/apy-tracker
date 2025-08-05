/**
 * Railway Simple APY Tracker
 * Playwright 없이 기본 fetch만 사용하는 간단한 버전
 */

const vaults = require('./vaults');
const { getCompoundBlueVaultsApy } = require('./morphoApi');
const { scrapeVaultWithAPI } = require('./api-scraping-service');
const fs = require('fs-extra');
const path = require('path');

/**
 * 메인 실행 함수 - 간단한 버전
 */
async function main() {
  console.log('🚀 Railway Simple APY Tracker 시작...\n');
  
  try {
    console.log(`📊 총 ${vaults.length}개 vault를 처리합니다.\n`);
    
    // Compound Blue vaults 2개는 API로 처리
    const compoundVaults = vaults.filter(vault => vault.type === 'compound_blue');
    console.log(`🔗 API로 처리할 Compound Blue vaults: ${compoundVaults.length}개`);
    const compoundResults = await getCompoundBlueVaultsApy(compoundVaults);
    
    // 나머지 vaults 9개는 기본 fetch로 처리 (JavaScript 렌더링 불가)
    const nonCompoundVaults = vaults.filter(vault => vault.type !== 'compound_blue');
    console.log(`🌐 기본 fetch로 처리할 vaults: ${nonCompoundVaults.length}개`);
    
    const scrapingResults = [];
    for (const vault of nonCompoundVaults) {
      const result = await scrapeVaultWithAPI(vault, 'basic');
      scrapingResults.push(result);
    }
    
    // 결과 합치기
    const allResults = [...compoundResults, ...scrapingResults];
    
    // 결과 출력
    console.log('\n📊 === Railway Simple APY Results ===\n');
    
    allResults.forEach((vault, index) => {
      const netApyPercent = vault.netApy && typeof vault.netApy === 'number' ? 
        (vault.netApy * 100).toFixed(2) : vault.netApy;
      
      console.log(`${index + 1}. 🏦 ${vault.name} (${vault.asset})`);
      console.log(`   📍 Address: ${vault.address}`);
      console.log(`   📊 Net APY: ${netApyPercent}%`);
      console.log(`   🔗 Source: ${vault.source}`);
      console.log('');
    });
    
    // 성공한 vault들 통계
    const successfulVaults = allResults.filter(vault => 
      vault.netApy !== 'Error' && vault.netApy !== 'N/A' && typeof vault.netApy === 'number'
    );
    
    console.log(`✅ 총 ${allResults.length}개 vault 처리 완료!`);
    console.log(`📈 성공: ${successfulVaults.length}개`);
    console.log(`🔗 API 성공: ${compoundResults.filter(v => v.netApy !== 'Error').length}개`);
    console.log(`🌐 Fetch 성공: ${scrapingResults.filter(v => v.netApy !== 'Error').length}개`);
    
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
 */
async function saveData(allResults) {
  const dataToSave = {
    timestamp: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    time: new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'),
    vaults: allResults,
    mode: 'railway_simple'
  };
  
  await fs.writeJson(path.join(__dirname, 'data', 'latest.json'), dataToSave, { spaces: 2 });
  console.log(`📁 데이터 저장됨: ${path.join(__dirname, 'data', 'latest.json')}`);
}

// 메인 실행
if (require.main === module) {
  main();
}

module.exports = { main }; 