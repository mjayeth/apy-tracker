/**
 * APY Tracker API-Only Version for Vercel
 * 
 * Vercel 환경에서 시스템 의존성 문제를 피하기 위해 API만 사용하는 버전입니다.
 * Compound Blue vaults만 API로 조회하고, 나머지는 기본값을 사용합니다.
 */

const vaults = require('./vaults');
const { getCompoundBlueVaultsApy } = require('./morphoApi');
const fs = require('fs-extra');
const path = require('path');

/**
 * API 전용 메인 실행 함수
 * Compound Blue vaults만 API로 조회하고, 나머지는 기본값 사용
 */
async function main() {
  console.log('🚀 API-Only Net APY Tracker 시작...\n');
  
  try {
    console.log(`📊 총 ${vaults.length}개 vault를 처리합니다.\n`);
    
    // Compound Blue vaults는 API로 처리
    const compoundVaults = vaults.filter(vault => vault.type === 'compound_blue');
    const compoundResults = await getCompoundBlueVaultsApy(compoundVaults);
    
    // 나머지 vaults는 기본값 사용 (API 전용 모드)
    const nonCompoundVaults = vaults.filter(vault => vault.type !== 'compound_blue');
    const defaultResults = nonCompoundVaults.map(vault => ({
      name: vault.name,
      address: vault.address,
      asset: vault.asset,
      netApy: 'API_Only_Mode', // API 전용 모드 표시
      source: 'api_only',
      url: vault.url
    }));
    
    // 결과 합치기
    const allResults = [...compoundResults, ...defaultResults];
    
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
    console.log('\n📊 === All Vault Net APY Results (API-Only Mode) ===\n');
    
    sortedResults.forEach((vault, index) => {
      const netApyPercent = vault.netApy && typeof vault.netApy === 'number' ? 
        (vault.netApy * 100).toFixed(2) : vault.netApy;
      
      console.log(`${index + 1}. 🏦 ${vault.name} (${vault.asset})`);
      console.log(`   📍 Address: ${vault.address}`);
      console.log(`   📊 Net APY: ${netApyPercent}%`);
      console.log(`   🔗 Source: ${vault.source}`);
      console.log('');
    });
    
    // API 전용 모드 vault들 출력
    const apiOnlyVaults = allResults.filter(vault => vault.source === 'api_only');
    
    if (apiOnlyVaults.length > 0) {
      console.log('\nℹ️ === API-Only Mode Vaults ===\n');
      apiOnlyVaults.forEach(vault => {
        console.log(`🏦 ${vault.name} (${vault.asset})`);
        console.log(`   📍 Address: ${vault.address}`);
        console.log(`   ℹ️ Note: Web scraping disabled in Vercel environment`);
        console.log('');
      });
    }
    
    console.log(`✅ 총 ${allResults.length}개 vault 처리 완료!`);
    console.log(`📈 API 성공: ${compoundResults.length}개, API 전용 모드: ${apiOnlyVaults.length}개`);
    
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
    mode: 'api_only'
  };
  
  await fs.writeJson(path.join(__dirname, 'data', 'latest.json'), dataToSave, { spaces: 2 });
  console.log(`📁 데이터 저장됨: ${path.join(__dirname, 'data', 'latest.json')}`);
}

// 메인 실행
if (require.main === module) {
  main();
}

module.exports = { main }; 