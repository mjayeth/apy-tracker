const fs = require('fs-extra');
const path = require('path');

// 데이터 디렉토리 설정
const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');

// 데이터 관리 클래스
class DataManager {
  constructor() {
    this.ensureDirectories();
  }

  // 디렉토리 생성
  async ensureDirectories() {
    await fs.ensureDir(DATA_DIR);
    await fs.ensureDir(HISTORY_DIR);
  }

  // 최신 데이터 조회
  async getLatestData() {
    try {
      const latestPath = path.join(DATA_DIR, 'latest.json');
      if (await fs.pathExists(latestPath)) {
        return await fs.readJson(latestPath);
      }
      return null;
    } catch (error) {
      console.error('최신 데이터 조회 실패:', error.message);
      return null;
    }
  }

  // 히스토리 데이터 조회
  async getHistoryData(days = 7) {
    try {
      const files = await fs.readdir(HISTORY_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json')).sort().reverse();
      
      const historyData = [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      for (const file of jsonFiles) {
        const filePath = path.join(HISTORY_DIR, file);
        const data = await fs.readJson(filePath);
        
        const fileDate = new Date(data.timestamp);
        if (fileDate >= cutoffDate) {
          historyData.push(data);
        }
      }

      return historyData;
    } catch (error) {
      console.error('히스토리 데이터 조회 실패:', error.message);
      return [];
    }
  }

  // 특정 날짜 데이터 조회
  async getDataByDate(date) {
    try {
      const files = await fs.readdir(HISTORY_DIR);
      const targetFiles = files.filter(file => file.startsWith(date));
      
      if (targetFiles.length === 0) {
        return null;
      }

      // 가장 최근 파일 선택
      const latestFile = targetFiles.sort().reverse()[0];
      const filePath = path.join(HISTORY_DIR, latestFile);
      return await fs.readJson(filePath);
    } catch (error) {
      console.error('날짜별 데이터 조회 실패:', error.message);
      return null;
    }
  }

  // APY 변화 추이 분석
  async analyzeApyTrends(vaultName, days = 7) {
    try {
      const historyData = await this.getHistoryData(days);
      const vaultData = [];

      for (const data of historyData) {
        const vault = data.vaults.find(v => v.name === vaultName);
        if (vault) {
          vaultData.push({
            timestamp: data.timestamp,
            date: data.date,
            time: data.time,
            apy: vault.apy,
            netApy: vault.netApy,
            source: vault.source
          });
        }
      }

      return vaultData;
    } catch (error) {
      console.error('APY 트렌드 분석 실패:', error.message);
      return [];
    }
  }

  // 최고 APY 기록 조회
  async getHighestApyRecords(days = 30) {
    try {
      const historyData = await this.getHistoryData(days);
      const vaultRecords = {};

      for (const data of historyData) {
        for (const vault of data.vaults) {
          if (!vaultRecords[vault.name]) {
            vaultRecords[vault.name] = {
              name: vault.name,
              highestApy: 0,
              highestNetApy: 0,
              lowestApy: Infinity,
              lowestNetApy: Infinity,
              records: []
            };
          }

          const record = vaultRecords[vault.name];
          
          // 최고 APY 업데이트
          if (vault.apy > record.highestApy) {
            record.highestApy = vault.apy;
          }
          if (vault.netApy > record.highestNetApy) {
            record.highestNetApy = vault.netApy;
          }

          // 최저 APY 업데이트
          if (vault.apy < record.lowestApy) {
            record.lowestApy = vault.apy;
          }
          if (vault.netApy < record.lowestNetApy) {
            record.lowestNetApy = vault.netApy;
          }

          record.records.push({
            timestamp: data.timestamp,
            apy: vault.apy,
            netApy: vault.netApy,
            source: vault.source
          });
        }
      }

      return Object.values(vaultRecords);
    } catch (error) {
      console.error('최고 APY 기록 조회 실패:', error.message);
      return [];
    }
  }

  // 데이터 통계 생성
  async generateStats(days = 7) {
    try {
      const historyData = await this.getHistoryData(days);
      const latestData = await this.getLatestData();
      
      if (!latestData) {
        return null;
      }

      const stats = {
        totalVaults: latestData.vaults.length,
        totalRecords: historyData.length,
        dateRange: {
          start: historyData[historyData.length - 1]?.date,
          end: historyData[0]?.date
        },
        averageApy: 0,
        highestApy: 0,
        lowestApy: Infinity,
        vaultStats: []
      };

      // 전체 통계 계산
      let totalApy = 0;
      let count = 0;

      for (const vault of latestData.vaults) {
        if (typeof vault.apy === 'number') {
          totalApy += vault.apy;
          count++;
          
          if (vault.apy > stats.highestApy) {
            stats.highestApy = vault.apy;
          }
          if (vault.apy < stats.lowestApy) {
            stats.lowestApy = vault.apy;
          }
        }

        // Vault별 통계
        const vaultTrend = await this.analyzeApyTrends(vault.name, days);
        const vaultStat = {
          name: vault.name,
          currentApy: vault.apy,
          currentNetApy: vault.netApy,
          trend: vaultTrend.length > 1 ? {
            change: vaultTrend[0].apy - vaultTrend[vaultTrend.length - 1].apy,
            changePercent: ((vaultTrend[0].apy - vaultTrend[vaultTrend.length - 1].apy) / vaultTrend[vaultTrend.length - 1].apy) * 100
          } : null,
          records: vaultTrend.length
        };
        stats.vaultStats.push(vaultStat);
      }

      stats.averageApy = count > 0 ? totalApy / count : 0;

      return stats;
    } catch (error) {
      console.error('통계 생성 실패:', error.message);
      return null;
    }
  }

  // 데이터 백업
  async backupData() {
    try {
      const backupDir = path.join(DATA_DIR, 'backup', new Date().toISOString().split('T')[0]);
      await fs.ensureDir(backupDir);
      
      await fs.copy(HISTORY_DIR, path.join(backupDir, 'history'));
      await fs.copy(path.join(DATA_DIR, 'latest.json'), path.join(backupDir, 'latest.json'));
      
      console.log(`📦 데이터 백업 완료: ${backupDir}`);
      return backupDir;
    } catch (error) {
      console.error('데이터 백업 실패:', error.message);
      return null;
    }
  }

  // 오래된 데이터 정리
  async cleanupOldData(daysToKeep = 30) {
    try {
      const files = await fs.readdir(HISTORY_DIR);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      let deletedCount = 0;
      
      for (const file of files) {
        const filePath = path.join(HISTORY_DIR, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filePath);
          deletedCount++;
        }
      }
      
      console.log(`🗑️ 오래된 데이터 정리 완료: ${deletedCount}개 파일 삭제`);
      return deletedCount;
    } catch (error) {
      console.error('데이터 정리 실패:', error.message);
      return 0;
    }
  }
}

// 사용 예시 함수들
async function showDataUsage() {
  const dataManager = new DataManager();
  
  console.log('\n📊 === 데이터 관리 도구 ===');
  
  // 최신 데이터 조회
  const latest = await dataManager.getLatestData();
  if (latest) {
    console.log(`\n📈 최신 데이터 (${latest.date} ${latest.time}):`);
    console.log(`   총 ${latest.vaults.length}개 vault`);
    console.log(`   평균 APY: ${(latest.vaults.reduce((sum, v) => sum + (v.apy || 0), 0) / latest.vaults.length * 100).toFixed(2)}%`);
  }
  
  // 통계 생성
  const stats = await dataManager.generateStats(7);
  if (stats) {
    console.log(`\n📊 최근 7일 통계:`);
    console.log(`   총 기록: ${stats.totalRecords}개`);
    console.log(`   평균 APY: ${(stats.averageApy * 100).toFixed(2)}%`);
    console.log(`   최고 APY: ${(stats.highestApy * 100).toFixed(2)}%`);
    console.log(`   최저 APY: ${(stats.lowestApy * 100).toFixed(2)}%`);
  }
  
  // 최고 APY 기록
  const records = await dataManager.getHighestApyRecords(7);
  console.log(`\n🏆 최근 7일 최고 APY 기록:`);
  records.slice(0, 5).forEach(record => {
    console.log(`   ${record.name}: ${(record.highestApy * 100).toFixed(2)}%`);
  });
}

module.exports = {
  DataManager,
  showDataUsage
}; 