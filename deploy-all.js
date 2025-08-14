const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// 색상 유틸리티
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    console.log(`\n${colors.cyan}${colors.bright}[${step}]${colors.reset} ${message}`);
}

async function runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        log(`실행: ${command} ${args.join(' ')}`, 'yellow');
        
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            ...options
        });

        child.on('close', (code) => {
            if (code === 0) {
                log(`✅ 성공: ${command}`, 'green');
                resolve();
            } else {
                log(`❌ 실패: ${command} (코드: ${code})`, 'red');
                reject(new Error(`Command failed with code ${code}`));
            }
        });

        child.on('error', (error) => {
            log(`❌ 오류: ${command} - ${error.message}`, 'red');
            reject(error);
        });
    });
}

async function updateDashboardData() {
    logStep('1', '대시보드 데이터 업데이트 중...');
    
    try {
        // 최신 APY 데이터 읽기
        const latestData = await fs.readJson('data/latest.json');
        
        // 정적 대시보드 HTML 읽기
        let dashboardHtml = await fs.readFile('public/static-dashboard.html', 'utf8');
        
        // vaultData 부분을 최신 데이터로 교체
        const vaultDataStart = dashboardHtml.indexOf('const vaultData = {');
        const vaultDataEnd = dashboardHtml.indexOf('};', vaultDataStart) + 1;
        
        const newVaultData = `const vaultData = ${JSON.stringify(latestData, null, 8)};`;
        
        dashboardHtml = dashboardHtml.substring(0, vaultDataStart) + 
                       newVaultData + 
                       dashboardHtml.substring(vaultDataEnd);
        
        // 업데이트된 HTML을 index.html로 저장
        await fs.writeFile('public/index.html', dashboardHtml);
        
        log('✅ 대시보드 데이터 업데이트 완료', 'green');
        
        // 업데이트된 데이터 미리보기
        log('\n📊 최신 APY 데이터:', 'blue');
        latestData.vaults.forEach(vault => {
            const apy = (vault.netApy * 100).toFixed(2);
            log(`  ${vault.name}: ${apy}%`, 'reset');
        });
        
    } catch (error) {
        log(`❌ 대시보드 데이터 업데이트 실패: ${error.message}`, 'red');
        throw error;
    }
}

async function deployToGitHub() {
    logStep('2', 'GitHub에 배포 중...');
    
    try {
        // Git 상태 확인
        await runCommand('git', ['status']);
        
        // 변경사항 추가
        await runCommand('git', ['add', '.']);
        
        // 커밋 - 단순한 메시지 사용
        const commitMessage = 'Auto-update APY data';
        await runCommand('git', ['commit', '-m', commitMessage]);
        
        // 푸시
        await runCommand('git', ['push', 'origin', 'main']);
        
        log('✅ GitHub 배포 완료', 'green');
        
    } catch (error) {
        log(`❌ GitHub 배포 실패: ${error.message}`, 'red');
        throw error;
    }
}

async function waitForDeployment() {
    logStep('3', '배포 완료 대기 중...');
    
    const maxAttempts = 30; // 최대 5분 대기
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        try {
            log(`🔄 배포 확인 시도 ${attempts + 1}/${maxAttempts}...`, 'yellow');
            
            const response = await fetch('https://mjayeth.github.io/apy-tracker/');
            if (response.ok) {
                log('✅ 웹사이트 배포 완료!', 'green');
                return true;
            }
        } catch (error) {
            // 에러는 무시하고 계속 시도
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
    }
    
    log('⚠️ 배포 확인 시간 초과 (수동으로 확인해주세요)', 'yellow');
    return false;
}

async function showFinalResult() {
    log('\n🎉 모든 과정 완료!', 'green');
    log('==================================================', 'cyan');
    
    log('\n🌐 웹사이트 URL:', 'blue');
    log('https://mjayeth.github.io/apy-tracker/', 'bright');
    
    log('\n📱 공유 방법:', 'blue');
    log('위 링크를 복사해서 다른 사람에게 공유하세요!', 'reset');
    
    log('\n📊 포함된 데이터:', 'blue');
    log('- 12개 DeFi Vault의 최신 APY', 'reset');
    log('- ALPHA Hub 순서대로 정렬', 'reset');
    log('- Euler Finance pufETH/WETH Loop 포함', 'reset');
    
    log('\n🔄 다음 업데이트:', 'blue');
    log('npm run deploy-all', 'bright');
}

async function main() {
    try {
        log('🚀 APY Tracker 전체 자동화 시작!', 'magenta');
        log('==================================================', 'cyan');
        
        // 1단계: APY 데이터 수집
        logStep('0', 'APY 데이터 수집 중...');
        await runCommand('npm', ['run', 'collect']);
        
        // 2단계: 대시보드 데이터 업데이트
        await updateDashboardData();
        
        // 3단계: GitHub 배포
        await deployToGitHub();
        
        // 4단계: 배포 완료 대기
        await waitForDeployment();
        
        // 5단계: 최종 결과 표시
        await showFinalResult();
        
    } catch (error) {
        log(`\n❌ 전체 과정 실패: ${error.message}`, 'red');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { main };
