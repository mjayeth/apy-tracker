const fs = require('fs-extra');
const path = require('path');

// 데이터 디렉토리 설정
const DATA_DIR = path.join(__dirname, 'data');

// 간소화된 데이터 관리 클래스
class DataManager {
  constructor() {
    this.ensureDirectories();
  }

  // 디렉토리 생성
  async ensureDirectories() {
    await fs.ensureDir(DATA_DIR);
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

  // 데이터 저장
  async saveData(data) {
    try {
      const dataToSave = {
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'),
        vaults: data
      };
      
      await fs.writeJson(path.join(DATA_DIR, 'latest.json'), dataToSave, { spaces: 2 });
      console.log(`📁 데이터 저장됨: ${path.join(DATA_DIR, 'latest.json')}`);
      return true;
    } catch (error) {
      console.error('데이터 저장 실패:', error.message);
      return false;
    }
  }
}

module.exports = {
  DataManager
}; 